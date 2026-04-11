import Stripe from "stripe";
export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const sig = req.headers["stripe-signature"];
  let rawBody = "";
  await new Promise((resolve, reject) => { req.on("data", chunk => { rawBody += chunk; }); req.on("end", resolve); req.on("error", reject); });
  let stripeEvent; try { stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET); } catch (err) { return res.status(400).json({ error: err.message }); }
  if (stripeEvent.type === "checkout.session.completed") { const session = stripeEvent.data.object; if (process.env.RESEND_API_KEY && session.customer_email) { await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ from: "onboarding@resend.dev", to: session.customer_email, subject: "Welcome to CleanManager Pro", html: "<h1>Welcome!</h1><p>Your account is active. Login at https://cleanmanager-pro.vercel.app</p>" }) }); } }
  return res.status(200).json({ received: true });
}
