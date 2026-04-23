export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  const { to, subject, body } = req.body;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from: "Blue Owl Cleaning Ltd <" + process.env.RESEND_FROM + ">", to: [to], subject: subject, text: body })
  });
  const data = await response.json();
  if (data.id) { res.status(200).json({ success: true, id: data.id }); }
  else { res.status(400).json({ success: false, error: data }); }
}