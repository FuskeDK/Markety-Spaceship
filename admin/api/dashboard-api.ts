// Client-facing dashboard API - the only backend the client dashboard talks to.
// Auth model: no login to the admin panel; instead every client has a unique
// URL token (/dashboard/:token). Actions that mutate data also require the
// client to have set a password (claimed the dashboard) and be logged in
// (verified via the token + password).
//
// GET /api/dashboard-api?token=<t>             → full dashboard data (client, leads,
//                                               invoices, orders)
// GET /api/dashboard-api?token=<t>&resource=status   → cap_paused flag
// GET /api/dashboard-api?token=<t>&resource=products → product list for webshop
//
// POST actions (all require token; some also require password):
//   claim               - first-time password setup (hashed with pbkdf2)
//   login               - verify password, rate-limited per IP
//   change-password     - update password after verifying current one
//   update-lead-status  - client marks a lead as contacted/converted/lost
//   set-deal-value      - client inputs their deal value for ROI calc
//   create-order        - webshop checkout; creates lead + order, sends
//                          confirmation email, checks lead cap
//   update-order        - mark order handled/pending
//   add-product / update-product / delete-product - webshop catalogue mgmt
//
// Used by: src/pages/Dashboard.tsx.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, pbkdf2Sync } from "crypto";
import { sendEmail } from "../lib/server/_mailer.js";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const derived = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return derived === hash;
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_MAX = 8;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now >= record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_MAX) return false;
  record.count++;
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const action = req.body?.action as string | undefined;

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const token = req.query.token as string;
    const resource = req.query.resource as string | undefined;
    if (!token) return res.status(400).json({ error: "Token required" });

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, company, email, price_per_lead, currency, created_at, claimed, language, deal_value")
      .eq("token", token)
      .single();

    if (clientError || !client) return res.status(404).json({ error: "Client not found" });

    // Paused / cap status
    if (resource === "status") {
      const { data: status } = await supabase
        .from("clients")
        .select("cap_paused")
        .eq("token", token)
        .single();
      return res.status(200).json({ paused: status?.cap_paused ?? false });
    }

    // Products list
    if (resource === "products") {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });
      return res.status(200).json({ products: data ?? [] });
    }

    // Default: full dashboard data
    const [{ data: leads }, { data: invoices }, { data: orders }] = await Promise.all([
      supabase.from("leads").select("id, name, email, phone, source, created_at, price, lead_status").eq("client_id", client.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("id, month_key, month_label, leads_count, amount, currency, stripe_link, sent_at, paid_at").eq("client_id", client.id).order("month_key", { ascending: false }),
      supabase.from("orders").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
    ]);

    return res.status(200).json({ client, leads: leads ?? [], invoices: invoices ?? [], orders: orders ?? [] });
  }

  // ── POST ──────────────────────────────────────────────────────────────────
  if (req.method === "POST") {

    // create-order: called from webshop checkout, token = client token
    if (action === "create-order") {
      const { token, customerName, customerEmail, customerPhone, customerAddress, items, total } = req.body ?? {};
      if (!token) return res.status(400).json({ error: "token required" });
      const { data: client } = await supabase.from("clients").select("id, email, company, price_per_lead, lead_cap").eq("token", token).single();
      if (!client) return res.status(404).json({ error: "Client not found" });

      const { data: order, error } = await supabase.from("orders").insert({
        client_id: client.id,
        customer_name: customerName ?? null,
        customer_email: customerEmail ?? null,
        customer_phone: customerPhone ?? null,
        customer_address: customerAddress ?? null,
        items: items ?? [],
        total: Number(total ?? 0),
        status: "pending",
      }).select().single();
      if (error) return res.status(500).json({ error: "Failed to create order" });

      // Also create a lead so it shows in Overview
      await supabase.from("leads").insert({
        client_id: client.id,
        name: customerName ?? null,
        email: customerEmail ?? null,
        phone: customerPhone ?? null,
        source: "webshop",
        price: (client as { price_per_lead: number }).price_per_lead,
      });

      // Check lead cap after inserting - pause site if cap reached
      if ((client as { lead_cap: number | null }).lead_cap) {
        const { count } = await supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("client_id", client.id);
        if ((count ?? 0) >= (client as { lead_cap: number }).lead_cap) {
          await supabase.from("clients").update({ cap_paused: true }).eq("id", client.id);
        }
      }

      // Confirmation email to customer
      if (customerEmail) {
        const orderItems = (items ?? []) as { name: string; quantity: number; price: number }[];
        const itemRows = orderItems.map(i => `
          <tr>
            <td style="padding:10px 0;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${i.name}</td>
            <td style="padding:10px 0;font-size:13px;color:#6b7280;text-align:center;border-bottom:1px solid #f3f4f6;">× ${i.quantity}</td>
            <td style="padding:10px 0;font-size:13px;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #f3f4f6;">${(i.price * i.quantity).toFixed(2)} kr</td>
          </tr>`).join("");
        const company = (client as { company: string }).company;
        const orderNum = (order.id as string).slice(-8).toUpperCase();
        const html = `
<div style="color-scheme:light;background:#f9fafb;padding:32px 0;">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

  <div style="background:#2563eb;padding:32px 24px 28px;">
    <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:0.05em;text-transform:uppercase;">Ordrebekræftelse</p>
    <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">${company}</p>
  </div>

  <div style="padding:28px 24px 0;">
    <p style="margin:0 0 6px;font-size:15px;color:#111827;">Hej ${customerName ?? "der"},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.7;">Tak for din ordre! Vi har modtaget den og behandler den hurtigst muligt.</p>

    <div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Ordrenummer</p>
      <p style="margin:0;font-size:16px;font-weight:800;color:#111827;letter-spacing:0.04em;">#${orderNum}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      ${itemRows}
    </table>

    <div style="display:flex;justify-content:space-between;padding:14px 0 0;border-top:2px solid #111827;margin-bottom:28px;">
      <span style="font-size:14px;font-weight:700;color:#111827;">I alt</span>
      <span style="font-size:16px;font-weight:800;color:#2563eb;">${Number(total ?? 0).toFixed(2)} kr</span>
    </div>

    ${customerAddress ? `
    <div style="margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Leveringsadresse</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${customerAddress}</p>
    </div>` : ""}
  </div>

  <div style="background:#f9fafb;padding:20px 24px;border-top:1px solid #e5e7eb;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">Spørgsmål? Kontakt os - vi hjælper gerne.<br>${company}</p>
  </div>

</div>
</div>`;
        sendEmail({
          to: customerEmail,
          subject: `Tak for din ordre #${orderNum} - ${company}`,
          html,
        }).catch(() => {});
      }

      return res.status(201).json({ success: true, orderId: order.id });
    }

    // All remaining actions require token + client lookup
    const { token } = req.body ?? {};
    if (!token) return res.status(400).json({ error: "Missing fields" });

    // update-order: mark order as handled/pending
    if (action === "update-order") {
      const { id, status } = req.body ?? {};
      if (!id || !status) return res.status(400).json({ error: "id and status required" });
      const { data: client } = await supabase.from("clients").select("id").eq("token", token).single();
      if (!client) return res.status(404).json({ error: "Client not found" });
      const { error } = await supabase.from("orders").update({ status }).eq("id", id).eq("client_id", client.id);
      if (error) return res.status(500).json({ error: "Failed to update order" });
      return res.status(200).json({ success: true });
    }

    // add-product
    if (action === "add-product") {
      const { name, description, price, image, categorySlug } = req.body ?? {};
      if (!name || price == null) return res.status(400).json({ error: "name and price required" });
      const { data: client } = await supabase.from("clients").select("id").eq("token", token).single();
      if (!client) return res.status(404).json({ error: "Client not found" });
      const { data, error } = await supabase.from("products").insert({
        client_id: client.id, name, description: description ?? null,
        price: Number(price), image: image ?? null, category_slug: categorySlug ?? null,
      }).select().single();
      if (error) return res.status(500).json({ error: "Failed to create product" });
      return res.status(201).json({ product: data });
    }

    // update-product
    if (action === "update-product") {
      const { id, name, description, price, image, categorySlug, inStock } = req.body ?? {};
      if (!id) return res.status(400).json({ error: "id required" });
      const { data: client } = await supabase.from("clients").select("id").eq("token", token).single();
      if (!client) return res.status(404).json({ error: "Client not found" });
      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = Number(price);
      if (image !== undefined) updates.image = image;
      if (categorySlug !== undefined) updates.category_slug = categorySlug;
      if (inStock !== undefined) updates.in_stock = inStock;
      const { error } = await supabase.from("products").update(updates).eq("id", id).eq("client_id", client.id);
      if (error) return res.status(500).json({ error: "Failed to update product" });
      return res.status(200).json({ success: true });
    }

    // delete-product
    if (action === "delete-product") {
      const { id } = req.body ?? {};
      if (!id) return res.status(400).json({ error: "id required" });
      const { data: client } = await supabase.from("clients").select("id").eq("token", token).single();
      if (!client) return res.status(404).json({ error: "Client not found" });
      const { error } = await supabase.from("products").delete().eq("id", id).eq("client_id", client.id);
      if (error) return res.status(500).json({ error: "Failed to delete product" });
      return res.status(200).json({ success: true });
    }

    const { password } = req.body ?? {};
    if (!password) return res.status(400).json({ error: "Missing fields" });

    // Claim
    if (action === "claim") {
      if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
      const { data: client } = await supabase.from("clients").select("id, claimed").eq("token", token).single();
      if (!client) return res.status(404).json({ error: "Dashboard not found" });
      if (client.claimed) return res.status(400).json({ error: "Already claimed" });
      await supabase.from("clients").update({ claimed: true, password_hash: hashPassword(password) }).eq("token", token);
      return res.status(200).json({ success: true });
    }

    // Login
    if (action === "login") {
      const ip = ((req.headers["x-forwarded-for"] as string) ?? "").split(",")[0].trim() || "unknown";
      if (!checkLoginRateLimit(ip)) {
        return res.status(429).json({ error: "Too many login attempts. Try again in 15 minutes." });
      }
      const { data: client } = await supabase.from("clients").select("id, claimed, password_hash").eq("token", token).single();
      if (!client) return res.status(404).json({ error: "Dashboard not found" });
      if (!client.claimed || !client.password_hash) return res.status(400).json({ error: "Dashboard not claimed yet" });
      if (!verifyPassword(password, client.password_hash)) return res.status(401).json({ error: "Incorrect password" });
      return res.status(200).json({ success: true });
    }

    // Update lead status (client marks their own leads)
    if (action === "update-lead-status") {
      const { leadId, lead_status } = req.body ?? {};
      if (!leadId || !lead_status) return res.status(400).json({ error: "leadId and lead_status required" });
      const validStatuses = ["new", "contacted", "converted", "lost"];
      if (!validStatuses.includes(lead_status)) return res.status(400).json({ error: "Invalid lead_status" });
      const { data: client } = await supabase.from("clients").select("id").eq("token", token).single();
      if (!client) return res.status(404).json({ error: "Client not found" });
      const { error } = await supabase.from("leads")
        .update({ lead_status })
        .eq("id", leadId)
        .eq("client_id", client.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    // Set deal value (client inputs their average deal value for ROI calculator)
    if (action === "set-deal-value") {
      const { deal_value } = req.body ?? {};
      const val = deal_value === null || deal_value === "" ? null : Number(deal_value);
      const { error } = await supabase.from("clients").update({ deal_value: val }).eq("token", token);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    // Change password
    if (action === "change-password") {
      const { currentPassword, newPassword } = req.body ?? {};
      if (!currentPassword || !newPassword) return res.status(400).json({ error: "Missing fields" });
      if ((newPassword as string).length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
      const { data: client } = await supabase.from("clients").select("id, password_hash").eq("token", token).single();
      if (!client) return res.status(404).json({ error: "Client not found" });
      if (!client.password_hash || !verifyPassword(currentPassword as string, client.password_hash)) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      await supabase.from("clients").update({ password_hash: hashPassword(newPassword as string) }).eq("token", token);
      return res.status(200).json({ success: true });
    }
  }

  return res.status(400).json({ error: "Unknown action" });
}
