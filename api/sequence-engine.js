import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SEQUENCES = {
  Restaurant: [
    { day: 0, subject: "Professional Cleaning Services for Your Restaurant", type: "cold" },
    { day: 4, subject: "Following up — Blue Owl Cleaning Ltd", type: "followup" },
    { day: 10, subject: "Free Kitchen Deep Clean Checklist — Blue Owl", type: "value" },
    { day: 18, subject: "Final message — free site visit offer", type: "final" }
  ],
  Hospital: [
    { day: 0, subject: "Specialist Healthcare Cleaning Services", type: "cold" },
    { day: 4, subject: "Following up — Blue Owl Cleaning Ltd", type: "followup" },
    { day: 10, subject: "NHS Cleaning Standards Guide — Blue Owl", type: "value" },
    { day: 18, subject: "Final message — free compliance assessment", type: "final" }
  ],
  "Care Home": [
    { day: 0, subject: "Trusted Cleaning Services for Care Homes", type: "cold" },
    { day: 4, subject: "Following up — Blue Owl Cleaning Ltd", type: "followup" },
    { day: 10, subject: "CQC Cleaning Compliance Tips — Blue Owl", type: "value" },
    { day: 18, subject: "Final message — free site assessment", type: "final" }
  ],
  Office: [
    { day: 0, subject: "Reliable Office Cleaning Services", type: "cold" },
    { day: 4, subject: "Following up — Blue Owl Cleaning Ltd", type: "followup" },
    { day: 10, subject: "Office Hygiene Guide 2026 — Blue Owl", type: "value" },
    { day: 18, subject: "Final message — free office assessment", type: "final" }
  ],
  Warehouse: [
    { day: 0, subject: "Industrial Cleaning Services for Your Warehouse", type: "cold" },
    { day: 4, subject: "Following up — Blue Owl Cleaning Ltd", type: "followup" },
    { day: 10, subject: "Warehouse Safety Cleaning Checklist — Blue Owl", type: "value" },
    { day: 18, subject: "Final message — free site survey", type: "final" }
  ],
  default: [
    { day: 0, subject: "Professional Cleaning Services — Blue Owl Cleaning Ltd", type: "cold" },
    { day: 4, subject: "Following up — Blue Owl Cleaning Ltd", type: "followup" },
    { day: 10, subject: "Cleaning Best Practices 2026 — Blue Owl", type: "value" },
    { day: 18, subject: "Final message — free site visit offer", type: "final" }
  ]
};

const BODIES = {
  cold: {
    Restaurant: "Dear Facilities / Operations Manager,\n\nRunning a busy restaurant means maintaining the highest hygiene standards — not just for inspections, but for your reputation.\n\nWe specialise in deep kitchen cleans, extraction systems, front-of-house maintenance, and end-of-service cleans tailored around your opening hours.\n\nWe are fully insured and London-based. We would love to arrange a free site visit and provide a no-obligation quote.\n\nKind regards,\nOla Aina\nDirector — Blue Owl Cleaning Ltd\n07472 539 762\nola@blueowlcleanings.com\nwww.blueowlcleanings.com",
    Hospital: "Dear Facilities Manager,\n\nIn a healthcare environment, cleaning goes beyond appearance — it is about patient safety, infection control, and regulatory compliance.\n\nBlue Owl Cleaning Ltd provides specialist clinical cleaning services including ward cleans, common area maintenance, and deep sanitisation protocols aligned with NHS standards.\n\nWe would welcome the opportunity to discuss how we can support your facility.\n\nKind regards,\nOla Aina\nDirector — Blue Owl Cleaning Ltd\n07472 539 762\nola@blueowlcleanings.com\nwww.blueowlcleanings.com",
    "Care Home": "Dear Facilities Manager,\n\nResidents in care homes deserve a clean, safe, and welcoming environment — and your team deserves a reliable cleaning partner.\n\nWe provide regular and deep cleaning services for care homes across London, with trained staff who understand the sensitivity required in these environments.\n\nWe would be happy to arrange a free site assessment at a time that suits you.\n\nKind regards,\nOla Aina\nDirector — Blue Owl Cleaning Ltd\n07472 539 762\nola@blueowlcleanings.com\nwww.blueowlcleanings.com",
    default: "Dear Facilities / Operations Manager,\n\nMaintaining a clean, safe, and presentable environment is essential for any professional operation.\n\nBlue Owl Cleaning Ltd provides tailored commercial cleaning services across London — flexible scheduling, trained operatives, and consistently high standards.\n\nWe would love to arrange a free site visit and provide a no-obligation quote.\n\nKind regards,\nOla Aina\nDirector — Blue Owl Cleaning Ltd\n07472 539 762\nola@blueowlcleanings.com\nwww.blueowlcleanings.com"
  },
  followup: {
    default: "Dear Facilities / Operations Manager,\n\nI wanted to follow up on my email from a few days ago regarding professional cleaning services for your premises.\n\nI understand you are busy — I will keep this brief. Blue Owl Cleaning Ltd works with businesses across London delivering reliable, high-quality cleaning that fits around your operations.\n\nIf you have 10 minutes for a quick call or would like a free site visit, I would love to connect.\n\nKind regards,\nOla Aina\nDirector — Blue Owl Cleaning Ltd\n07472 539 762\nola@blueowlcleanings.com\nwww.blueowlcleanings.com"
  },
  value: {
    default: "Dear Facilities / Operations Manager,\n\nI hope this finds you well. I wanted to share something useful — a quick checklist our team uses when assessing commercial premises:\n\n- High-touch surfaces cleaned and sanitised daily\n- Deep clean of kitchen and food prep areas weekly\n- Extraction and ventilation systems checked monthly\n- Waste management and bin areas sanitised regularly\n- Staff welfare areas maintained to the highest standard\n\nIf any of these are a challenge for your current team, Blue Owl Cleaning Ltd can help — quickly, reliably, and at competitive rates.\n\nFree site visit available this week if useful.\n\nKind regards,\nOla Aina\nDirector — Blue Owl Cleaning Ltd\n07472 539 762\nola@blueowlcleanings.com\nwww.blueowlcleanings.com"
  },
  final: {
    default: "Dear Facilities / Operations Manager,\n\nI appreciate your time over the past few weeks. This will be my last message — I do not want to fill your inbox unnecessarily.\n\nIf your cleaning requirements ever change, or if you would like a second opinion on your current provision, please do not hesitate to get in touch.\n\nI will be in your area next week and would be happy to stop by for a no-obligation 15-minute chat if that would be useful.\n\nWishing you and your team all the best.\n\nKind regards,\nOla Aina\nDirector — Blue Owl Cleaning Ltd\n07472 539 762\nola@blueowlcleanings.com\nwww.blueowlcleanings.com"
  }
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action, lead } = req.body || {};

  if (action === "enroll") {
    const { email, name, sector } = lead;
    const key = "lead:" + email.replace("@", "_at_").replace(/\./g, "_");
    const existing = await redis.get(key);
    if (existing) return res.status(200).json({ status: "already_enrolled" });
    await redis.set(key, JSON.stringify({
      email, name, sector,
      touchIndex: 0,
      enrolledAt: Date.now(),
      nextSendAt: Date.now(),
      status: "active",
      opens: 0,
      replies: 0
    }));
    return res.status(200).json({ status: "enrolled" });
  }

  if (action === "process") {
    const keys = await redis.keys("lead:*");
    const now = Date.now();
    const results = [];
    for (const key of keys) {
      const raw = await redis.get(key);
      const lead = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!lead || lead.status !== "active") continue;
      if (lead.nextSendAt > now) continue;
      const seq = SEQUENCES[lead.sector] || SEQUENCES.default;
      if (lead.touchIndex >= seq.length) {
        await redis.set(key, JSON.stringify({ ...lead, status: "completed" }));
        continue;
      }
      const touch = seq[lead.touchIndex];
      const bodies = BODIES[touch.type];
      const body = (bodies && bodies[lead.sector]) ? bodies[lead.sector] : bodies.default;
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.RESEND_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "Blue Owl Cleaning Ltd <" + process.env.RESEND_FROM + ">",
          to: [lead.email],
          subject: touch.subject,
          text: body
        })
      });
      const emailData = await emailRes.json();
      const nextTouch = seq[lead.touchIndex + 1];
      const daysDiff = nextTouch ? (nextTouch.day - touch.day) : 0;
      const nextSendAt = nextTouch ? now + (daysDiff * 24 * 60 * 60 * 1000) : now;
      await redis.set(key, JSON.stringify({
        ...lead,
        touchIndex: lead.touchIndex + 1,
        lastSentAt: now,
        nextSendAt,
        status: lead.touchIndex + 1 >= seq.length ? "completed" : "active",
        lastEmailId: emailData.id || null
      }));
      results.push({ email: lead.email, touch: touch.type, success: !!emailData.id });
    }
    return res.status(200).json({ processed: results.length, results });
  }

  if (action === "stats") {
    const keys = await redis.keys("lead:*");
    const leads = await Promise.all(keys.map(async k => {
      const raw = await redis.get(k);
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    }));
    return res.status(200).json({
      total: leads.length,
      active: leads.filter(l => l && l.status === "active").length,
      completed: leads.filter(l => l && l.status === "completed").length,
      leads: leads.slice(0, 20)
    });
  }

  res.status(400).json({ error: "Unknown action" });
}
