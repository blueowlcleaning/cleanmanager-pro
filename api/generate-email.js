export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { sector } = req.body;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 300, system: 'You are the outreach agent for Blue Owl Cleaning Ltd, a professional commercial cleaning company in East London. Write concise cold emails under 120 words. Sign off as: Ola Aina | Blue Owl Cleaning Ltd | office@blueowlcleanings.co.uk. Write ONLY the email body starting with the greeting.', messages: [{ role: 'user', content: `Write a cold outreach email to a ${sector} in London offering commercial cleaning services.` }] })
  });
  const data = await response.json();
  res.status(200).json({ text: data.content?.[0]?.text || 'Error generating email.' });
}
