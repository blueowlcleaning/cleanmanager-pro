export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const keys = await redis.keys("lead:*");
  const leads = await Promise.all(keys.map(async k => {
    const raw = await redis.get(k);
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  }));

  const total = leads.length;
  const active = leads.filter(l => l && l.status === "active").length;
  const completed = leads.filter(l => l && l.status === "completed").length;
  const touch0 = leads.filter(l => l && l.touchIndex === 0).length;
  const touch1 = leads.filter(l => l && l.touchIndex === 1).length;
  const touch2 = leads.filter(l => l && l.touchIndex === 2).length;
  const touch3 = leads.filter(l => l && l.touchIndex >= 3).length;

  const sectorBreakdown = {};
  leads.forEach(l => {
    if (!l) return;
    sectorBreakdown[l.sector] = (sectorBreakdown[l.sector] || 0) + 1;
  });

  const sectorText = Object.entries(sectorBreakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([sector, count]) => sector + ": " + count + " leads")
    .join("\n");

  const report = `BLUE OWL CLEANING LTD
Weekly Outreach Report
Week ending: ${new Date().toLocaleDateString("en-GB")}

PIPELINE SUMMARY
================
Total leads enrolled: ${total}
Active sequences: ${active}
Completed sequences: ${completed}

SEQUENCE STAGES
===============
Touch 1 (Cold email): ${touch0} leads
Touch 2 (Follow-up): ${touch1} leads  
Touch 3 (Value email): ${touch2} leads
Touch 4 (Final chase): ${touch3} leads

SECTOR BREAKDOWN
================
${sectorText}

ACTION REQUIRED
===============
${touch1 > 0 ? "- " + touch1 + " businesses have received follow-up emails — check for replies" : ""}
${touch2 > 0 ? "- " + touch2 + " businesses are at value email stage — warm leads" : ""}
${touch3 > 0 ? "- " + touch3 + " businesses are at final chase stage — consider calling directly" : ""}

Keep going Ola. The agent is working.

Blue Owl Outreach Agent
cleanmanager-pro.vercel.app`;

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "Blue Owl Agent <" + process.env.RESEND_FROM + ">",
      to: ["ola@blueowlcleanings.com", "office@blueowlcleanings.co.uk"],
      subject: "Weekly Outreach Report — Blue Owl Agent — " + new Date().toLocaleDateString("en-GB"),
      text: report
    })
  });

  const data = await emailRes.json();
  res.status(200).json({ success: !!data.id, report });
}
