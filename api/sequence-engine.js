import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SEQUENCES = {
  Restaurant: [
    { day: 0, subject: "Professional Cleaning Services for Your Restaurant", type: "cold" },
    { day: 4, subject: "Following up — Blue Owl Cleaning Ltd", type: "followup" },
    { day: 10, subject: "Quick cleaning checklist for restaurants", type: "value" },
    { day: 18, subject: "Last message from Blue Owl Cleaning", type: "final" },
  ],
  default: [
    { day: 0, subject: "Professional Cleaning Services", type: "cold" },
    { day: 4, subject: "Following up on my previous email", type: "followup" },
    { day: 10, subject: "A useful cleaning checklist for your premises", type: "value" },
    { day: 18, subject: "Last message regarding cleaning services", type: "final" },
  ]
};

function getTemplate(type, sector, biz) {
  const name = biz?.name || "Blue Owl Cleaning Ltd";
  const director = biz?.directorName || "Ola Aina";
  const phone = biz?.phone || "07472 539 762";
  const email = biz?.email || "ola@blueowlcleanings.com";
  const website = biz?.website || "www.blueowlcleanings.com";

  const sig = `Kind regards,\n${director}\nDirector — ${name}\n${phone}\n${email}\n${website}`;

  const templates = {
    cold: {
      Restaurant: `Dear Facilities / Operations Manager,\n\nRunning a busy restaurant means maintaining the highest hygiene standards — not just for inspections, but for your reputation.\n\nWe specialise in deep kitchen cleans, extraction systems, front-of-house maintenance, and end-of-service cleans tailored around your opening hours.\n\nWe are fully insured and London-based. We would love to arrange a free site visit and provide a no-obligation quote.\n\n${sig}`,
      Hospital: `Dear Facilities Manager,\n\nIn a healthcare environment, cleaning goes beyond appearance — it is about patient safety, infection control, and regulatory compliance.\n\n${name} provides specialist clinical cleaning services including ward cleans, common area maintenance, and deep sanitisation protocols.\n\nWe would welcome the opportunity to discuss how we can support your facility.\n\n${sig}`,
      "Care Home": `Dear Facilities Manager,\n\nResidents in care homes deserve a clean, safe, and welcoming environment — and your team deserves a reliable cleaning partner.\n\nWe provide regular and deep cleaning services for care homes across London, with trained staff who understand the sensitivity required in these environments.\n\nWe would be happy to arrange a free site assessment at a time that suits you.\n\n${sig}`,
      default: `Dear Facilities / Operations Manager,\n\nMaintaining a clean, safe, and presentable environment is essential for any professional operation.\n\n${name} provides tailored commercial cleaning services across London — flexible scheduling, trained operatives, and consistently high standards.\n\nWe would love to arrange a free site visit and provide a no-obligation quote.\n\n${sig}`
    },
    followup: {
      default: `Dear Facilities / Operations Manager,\n\nI wanted to follow up on my email from a few days ago regarding professional cleaning services for your premises.\n\nI understand you are busy — I will keep this brief. ${name} works with businesses across London delivering reliable, high-quality cleaning that fits around your operations.\n\nIf you have 10 minutes for a quick call or would like a free site visit, I would love to connect.\n\n${sig}`
    },
    value: {
      default: `Dear Facilities / Operations Manager,\n\nI hope this finds you well. I wanted to share something useful — a quick checklist our team uses when assessing commercial premises:\n\n- High-touch surfaces cleaned and sanitised daily\n- Deep clean of kitchen and food prep areas weekly\n- Extraction and ventilation systems checked monthly\n- Waste management and bin areas sanitised regularly\n- Staff welfare areas maintained to the highest standard\n\nIf any of these are a challenge for your current team, ${name} can help — quickly, reliably, and at competitive rates.\n\nFree site visit available this week if useful.\n\n${sig}`
    },
    final: {
      default: `Dear Facilities / Operations Manager,\n\nI appreciate your time over the past few weeks. This will be my last message — I do not want to fill your inbox unnecessarily.\n\nIf your cleaning requirements ever change, or if you would like a second opinion on your current provision, please do not hesitate to get in touch.\n\nWishing you and your team all the best.\n\n${sig}`
    }
  };

  const typeTemplates = templates[type] || templates.cold;
  return typeTemplates[sector] || typeTemplates.default;
}

function leadKey(bizId, email) {
  return `lead:${bizId}:${email.replace("@", "_at_").replace(/\./g, "_")}`;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, leads, business_id, biz } = req.body || {};
  const bizId = business_id || "blueowl";

  if (action === "enroll") {
    let enrolled = 0;
    for (const lead of (leads || [])) {
      const key = leadKey(bizId, lead.email);
      const existing = await redis.get(key);
      if (!existing) {
        await redis.set(key, JSON.stringify({
          email: lead.email,
          name: lead.name,
          sector: lead.sector,
          touchIndex: 0,
          enrolledAt: Date.now(),
          nextSendAt: Date.now(),
          status: "active",
          opens: 0,
          replies: 0,
          business_id: bizId,
        }));
        enrolled++;
      }
    }
    return res.status(200).json({ enrolled });
  }

  if (action === "process") {
    const pattern = `lead:${bizId}:*`;
    const keys = await redis.keys(pattern);
    let sent = 0;
    const now = Date.now();
    const limit = 80;

    for (const k of keys) {
      if (sent >= limit) break;
      const raw = await redis.get(k);
      if (!raw) continue;
      const lead = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (lead.status !== "active") continue;
      if (lead.nextSendAt > now) continue;

      const seq = SEQUENCES[lead.sector] || SEQUENCES.default;
      if (lead.touchIndex >= seq.length) {
        await redis.set(k, JSON.stringify({ ...lead, status: "completed" }));
        continue;
      }

      const touch = seq[lead.touchIndex];
      const body = getTemplate(touch.type, lead.sector, biz);
      const fromName = biz?.name || "Blue Owl Cleaning Ltd";
      const fromEmail = process.env.RESEND_FROM || "ola@blueowlcleanings.com";

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: `${fromName} <${fromEmail}>`,
            to: [lead.email],
            subject: touch.subject,
            text: body,
          }),
        });

        const nextTouch = seq[lead.touchIndex + 1];
        const nextSendAt = nextTouch ? now + (nextTouch.day - touch.day) * 86400000 : now + 365 * 86400000;

        await redis.set(k, JSON.stringify({
          ...lead,
          touchIndex: lead.touchIndex + 1,
          lastSentAt: now,
          nextSendAt,
          status: lead.touchIndex + 1 >= seq.length ? "completed" : "active",
        }));
        sent++;
      } catch (e) {
        console.error("Send error:", e);
      }
    }
    return res.status(200).json({ sent });
  }

  if (action === "stats") {
    // Never fall back to blueowl leads for other businesses
    if (!bizId || bizId === "undefined") {
      return res.status(200).json({ total: 0, active: 0, completed: 0, leads: [] });
    }
    const pattern = `lead:${bizId}:*`;
    const keys = await redis.keys(pattern);
    const leads = [];
    for (const k of keys) {
      const raw = await redis.get(k);
      if (raw) {
        const lead = typeof raw === "string" ? JSON.parse(raw) : raw;
        // Double check lead belongs to this business
        if (lead.business_id && lead.business_id !== bizId) continue;
        leads.push(lead);
      }
    }
    const active = leads.filter(l => l.status === "active").length;
    const completed = leads.filter(l => l.status === "completed").length;
    return res.status(200).json({ total: leads.length, active, completed, leads: leads.slice(0, 100) });
  }

  return res.status(400).json({ error: "Unknown action" });
}