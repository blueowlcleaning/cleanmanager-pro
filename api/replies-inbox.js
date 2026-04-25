import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    try {
      const payload = req.body;
      // Filter out empty Resend ping notifications
    if (!payload.from || payload.from === "Unknown" || !payload.text) {
      return res.status(200).json({ success: true, ignored: true });
    }
    const reply = {
        id: "reply_" + Date.now(),
        from: payload.from || "Unknown",
        subject: payload.subject || "No subject",
        body: payload.text || payload.html || "No content",
        receivedAt: Date.now(),
        read: false,
        type: "reply"
      };

      await redis.set("reply:" + reply.id, JSON.stringify(reply));
      await redis.lpush("replies_list", reply.id);

      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === "GET") {
    const ids = await redis.lrange("replies_list", 0, 49);
    const replies = await Promise.all(ids.map(async id => {
      const raw = await redis.get("reply:" + id);
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    }));
    return res.status(200).json({ replies: replies.filter(Boolean) });
  }

  res.status(405).json({ error: "Method not allowed" });
}
