// Stripe webhook handler. Listens for checkout.session.completed events and
// marks the matching invoice row as paid in Supabase. The Stripe Checkout
// session is created inside api/admin.ts (send-invoice action) and carries
// { client_id, month_key } in metadata so we know which invoice to update.
// Body parsing is disabled (config export) so we can verify the raw signature
// using STRIPE_WEBHOOK_SECRET. No other events are handled currently.
// Stripe must be configured in the Vercel dashboard to point to this endpoint.
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"] as string;

  let event: any;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { client_id, month_key } = session.metadata ?? {};

    if (client_id && month_key) {
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
      await supabase
        .from("invoices")
        .update({ paid_at: new Date().toISOString() })
        .eq("client_id", client_id)
        .eq("month_key", month_key);
    }
  }

  return res.status(200).json({ received: true });
}
