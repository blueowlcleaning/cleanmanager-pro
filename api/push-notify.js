import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { subscription, title, body, icon, url } = req.body || {};
  if (!subscription) return res.status(400).json({ error: "Missing subscription" });

  const payload = JSON.stringify({
    title: title || "CleanManager Pro",
    body: body || "You have a new notification",
    icon: icon || "/favicon.svg",
    url: url || "https://cleanmanager-pro.vercel.app"
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Push error:", error);
    return res.status(500).json({ error: error.message });
  }
}