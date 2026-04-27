export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { name, email, company } = req.body || {};
  if (!email) return res.status(400).json({ error: "Missing email" });
  const firstName = name?.split(" ")[0] || "there";
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FAF8F3;font-family:Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;padding:40px 20px;"><div style="background:#0A1F44;border-radius:16px 16px 0 0;padding:40px 32px;text-align:center;"><div style="font-size:48px;margin-bottom:12px;">🦉</div><h1 style="color:#C9A84C;margin:0;font-size:28px;font-weight:800;">Welcome to CleanManager Pro</h1><p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:16px;">Your cleaning business just got smarter</p></div><div style="background:#ffffff;padding:32px;border-left:1px solid #F0EDE6;border-right:1px solid #F0EDE6;"><p style="color:#0A1F44;font-size:18px;font-weight:700;margin:0 0 8px;">Hi ${firstName} 👋</p><p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">${company ? company + " is now live on CleanManager Pro." : "Your account is now live on CleanManager Pro."} You are joining a growing community of cleaning professionals using AI to win more contracts, manage their teams, and grow their revenue.</p><div style="background:#F8F7F3;border-radius:12px;padding:24px;margin-bottom:24px;"><p style="color:#0A1F44;font-weight:800;font-size:16px;margin:0 0 16px;">🚀 Get started in 3 steps:</p><p style="color:#0A1F44;margin:0 0 8px;"><strong>1. Add your first client</strong> — Go to Clients and add their details</p><p style="color:#0A1F44;margin:0 0 8px;"><strong>2. Create your first job</strong> — Go to Jobs and schedule your first clean</p><p style="color:#0A1F44;margin:0;"><strong>3. Activate your AI Agent</strong> — Go to the Agent tab and watch it find leads automatically</p></div><div style="text-align:center;margin-bottom:24px;"><a href="https://cleanmanager-pro.vercel.app" style="display:inline-block;background:#C9A84C;color:#0A1F44;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:800;font-size:16px;">Open CleanManager Pro →</a></div><div style="border-top:1px solid #F0EDE6;padding-top:20px;"><p style="color:#555;font-size:14px;line-height:1.6;margin:0;">Need help? Reply to this email and Ola will get back to you personally.<br><strong>Ola Aina</strong> — Founder, Blue Owl Cleaning Ltd</p></div></div><div style="background:#0A1F44;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;"><p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;">Blue Owl Cleaning Ltd · Company No. 16415837 · office@blueowlcleanings.co.uk</p></div></div></body></html>`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "CleanManager Pro <ola@blueowlcleanings.com>",
        to: [email],
        subject: "Welcome to CleanManager Pro " + firstName + "! 🦉",
        html,
        text: "Hi " + firstName + ", welcome to CleanManager Pro! Your account is live. Open the app at https://cleanmanager-pro.vercel.app"
      })
    });
    const d = await r.json();
    return res.status(200).json({ success: true, id: d.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}