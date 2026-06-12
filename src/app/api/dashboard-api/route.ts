/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomBytes, pbkdf2Sync } from "crypto";
import { sendEmail } from "@/lib/server/_mailer";

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

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const resource = searchParams.get("resource");

  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400, headers: CORS });

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, name, company, email, price_per_lead, currency, created_at, claimed, language, deal_value")
    .eq("token", token)
    .single();

  if (clientError || !client) return NextResponse.json({ error: "Client not found" }, { status: 404, headers: CORS });

  if (resource === "status") {
    const { data: status } = await supabase.from("clients").select("cap_paused").eq("token", token).single();
    return NextResponse.json({ paused: status?.cap_paused ?? false }, { headers: CORS });
  }

  if (resource === "products") {
    const { data } = await supabase.from("products").select("*").eq("client_id", client.id).order("created_at", { ascending: false });
    return NextResponse.json({ products: data ?? [] }, { headers: CORS });
  }

  const [{ data: leads }, { data: invoices }, { data: orders }] = await Promise.all([
    supabase.from("leads").select("id, name, email, phone, source, created_at, price, lead_status").eq("client_id", client.id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("id, month_key, month_label, leads_count, amount, currency, stripe_link, sent_at, paid_at").eq("client_id", client.id).order("month_key", { ascending: false }),
    supabase.from("orders").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({ client, leads: leads ?? [], invoices: invoices ?? [], orders: orders ?? [] }, { headers: CORS });
}

export async function POST(req: NextRequest) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const body = await req.json().catch(() => ({}));
  const action = body?.action as string | undefined;

  if (action === "create-order") {
    const { token, customerName, customerEmail, customerPhone, customerAddress, items, total } = body ?? {};
    if (!token) return NextResponse.json({ error: "token required" }, { status: 400, headers: CORS });
    const { data: client } = await supabase.from("clients").select("id, email, company, price_per_lead, lead_cap").eq("token", token).single();
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404, headers: CORS });

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
    if (error) return NextResponse.json({ error: "Failed to create order" }, { status: 500, headers: CORS });

    await supabase.from("leads").insert({
      client_id: client.id,
      name: customerName ?? null,
      email: customerEmail ?? null,
      phone: customerPhone ?? null,
      source: "webshop",
      price: (client as any).price_per_lead,
    });

    if ((client as any).lead_cap) {
      const { count } = await supabase.from("leads").select("id", { count: "exact", head: true }).eq("client_id", client.id);
      if ((count ?? 0) >= (client as any).lead_cap) {
        await supabase.from("clients").update({ cap_paused: true }).eq("id", client.id);
      }
    }

    if (customerEmail) {
      const orderItems = (items ?? []) as { name: string; quantity: number; price: number }[];
      const itemRows = orderItems.map(i => `
        <tr>
          <td style="padding:10px 0;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${i.name}</td>
          <td style="padding:10px 0;font-size:13px;color:#6b7280;text-align:center;border-bottom:1px solid #f3f4f6;">× ${i.quantity}</td>
          <td style="padding:10px 0;font-size:13px;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #f3f4f6;">${(i.price * i.quantity).toFixed(2)} kr</td>
        </tr>`).join("");
      const company = (client as any).company;
      const orderNum = ((order as any).id as string).slice(-8).toUpperCase();
      const html = `<div style="font-family:-apple-system,Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;"><div style="background:#2563eb;padding:32px 24px 28px;"><p style="margin:0 0 4px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);text-transform:uppercase;">Ordrebekræftelse</p><p style="margin:0;font-size:22px;font-weight:800;color:#fff;">${company}</p></div><div style="padding:28px 24px 0;"><p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Hej ${customerName ?? "der"}, tak for din ordre!</p><div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:24px;"><p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;">Ordrenummer</p><p style="margin:0;font-size:16px;font-weight:800;color:#111827;">#${orderNum}</p></div><table style="width:100%;border-collapse:collapse;margin-bottom:8px;">${itemRows}</table><div style="padding:14px 0 0;border-top:2px solid #111827;margin-bottom:28px;display:flex;justify-content:space-between;"><span style="font-size:14px;font-weight:700;color:#111827;">I alt</span><span style="font-size:16px;font-weight:800;color:#2563eb;">${Number(total ?? 0).toFixed(2)} kr</span></div></div><div style="background:#f9fafb;padding:20px 24px;border-top:1px solid #e5e7eb;"><p style="margin:0;font-size:12px;color:#9ca3af;">${company}</p></div></div>`;
      sendEmail({ to: customerEmail, subject: `Tak for din ordre #${orderNum} - ${company}`, html }).catch(() => {});
    }

    return NextResponse.json({ success: true, orderId: (order as any).id }, { status: 201, headers: CORS });
  }

  const { token } = body ?? {};
  if (!token) return NextResponse.json({ error: "Missing fields" }, { status: 400, headers: CORS });

  if (action === "update-order") {
    const { id, status } = body ?? {};
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400, headers: CORS });
    const { data: client } = await supabase.from("clients").select("id").eq("token", token).single();
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404, headers: CORS });
    const { error } = await supabase.from("orders").update({ status }).eq("id", id).eq("client_id", client.id);
    if (error) return NextResponse.json({ error: "Failed to update order" }, { status: 500, headers: CORS });
    return NextResponse.json({ success: true }, { headers: CORS });
  }

  if (action === "add-product") {
    const { name, description, price, image, categorySlug } = body ?? {};
    if (!name || price == null) return NextResponse.json({ error: "name and price required" }, { status: 400, headers: CORS });
    const { data: client } = await supabase.from("clients").select("id").eq("token", token).single();
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404, headers: CORS });
    const { data, error } = await supabase.from("products").insert({ client_id: client.id, name, description: description ?? null, price: Number(price), image: image ?? null, category_slug: categorySlug ?? null }).select().single();
    if (error) return NextResponse.json({ error: "Failed to create product" }, { status: 500, headers: CORS });
    return NextResponse.json({ product: data }, { status: 201, headers: CORS });
  }

  if (action === "update-product") {
    const { id, name, description, price, image, categorySlug, inStock } = body ?? {};
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400, headers: CORS });
    const { data: client } = await supabase.from("clients").select("id").eq("token", token).single();
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404, headers: CORS });
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (image !== undefined) updates.image = image;
    if (categorySlug !== undefined) updates.category_slug = categorySlug;
    if (inStock !== undefined) updates.in_stock = inStock;
    const { error } = await supabase.from("products").update(updates).eq("id", id).eq("client_id", client.id);
    if (error) return NextResponse.json({ error: "Failed to update product" }, { status: 500, headers: CORS });
    return NextResponse.json({ success: true }, { headers: CORS });
  }

  if (action === "delete-product") {
    const { id } = body ?? {};
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400, headers: CORS });
    const { data: client } = await supabase.from("clients").select("id").eq("token", token).single();
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404, headers: CORS });
    const { error } = await supabase.from("products").delete().eq("id", id).eq("client_id", client.id);
    if (error) return NextResponse.json({ error: "Failed to delete product" }, { status: 500, headers: CORS });
    return NextResponse.json({ success: true }, { headers: CORS });
  }

  const { password } = body ?? {};
  if (!password) return NextResponse.json({ error: "Missing fields" }, { status: 400, headers: CORS });

  if (action === "claim") {
    if ((password as string).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400, headers: CORS });
    const { data: client } = await supabase.from("clients").select("id, claimed").eq("token", token).single();
    if (!client) return NextResponse.json({ error: "Dashboard not found" }, { status: 404, headers: CORS });
    if (client.claimed) return NextResponse.json({ error: "Already claimed" }, { status: 400, headers: CORS });
    await supabase.from("clients").update({ claimed: true, password_hash: hashPassword(password as string) }).eq("token", token);
    return NextResponse.json({ success: true }, { headers: CORS });
  }

  if (action === "login") {
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    if (!checkLoginRateLimit(ip)) return NextResponse.json({ error: "Too many login attempts. Try again in 15 minutes." }, { status: 429, headers: CORS });
    const { data: client } = await supabase.from("clients").select("id, claimed, password_hash").eq("token", token).single();
    if (!client) return NextResponse.json({ error: "Dashboard not found" }, { status: 404, headers: CORS });
    if (!client.claimed || !client.password_hash) return NextResponse.json({ error: "Dashboard not claimed yet" }, { status: 400, headers: CORS });
    if (!verifyPassword(password as string, client.password_hash)) return NextResponse.json({ error: "Incorrect password" }, { status: 401, headers: CORS });
    return NextResponse.json({ success: true }, { headers: CORS });
  }

  if (action === "update-lead-status") {
    const { leadId, lead_status } = body ?? {};
    if (!leadId || !lead_status) return NextResponse.json({ error: "leadId and lead_status required" }, { status: 400, headers: CORS });
    const validStatuses = ["new", "contacted", "converted", "lost"];
    if (!validStatuses.includes(lead_status)) return NextResponse.json({ error: "Invalid lead_status" }, { status: 400, headers: CORS });
    const { data: client } = await supabase.from("clients").select("id").eq("token", token).single();
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404, headers: CORS });
    const { error } = await supabase.from("leads").update({ lead_status }).eq("id", leadId).eq("client_id", client.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    return NextResponse.json({ success: true }, { headers: CORS });
  }

  if (action === "set-deal-value") {
    const { deal_value } = body ?? {};
    const val = deal_value === null || deal_value === "" ? null : Number(deal_value);
    const { error } = await supabase.from("clients").update({ deal_value: val }).eq("token", token);
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });
    return NextResponse.json({ success: true }, { headers: CORS });
  }

  if (action === "change-password") {
    const { currentPassword, newPassword } = body ?? {};
    if (!currentPassword || !newPassword) return NextResponse.json({ error: "Missing fields" }, { status: 400, headers: CORS });
    if ((newPassword as string).length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400, headers: CORS });
    const { data: client } = await supabase.from("clients").select("id, password_hash").eq("token", token).single();
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404, headers: CORS });
    if (!client.password_hash || !verifyPassword(currentPassword as string, client.password_hash)) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401, headers: CORS });
    await supabase.from("clients").update({ password_hash: hashPassword(newPassword as string) }).eq("token", token);
    return NextResponse.json({ success: true }, { headers: CORS });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400, headers: CORS });
}
