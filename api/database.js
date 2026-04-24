export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action, table, data, id, business_id } = req.body || {};
  const url = process.env.SUPABASE_URL + "/rest/v1/" + table;
  const headers = {
    "Content-Type": "application/json",
    "apikey": process.env.SUPABASE_SERVICE_KEY,
    "Authorization": "Bearer " + process.env.SUPABASE_SERVICE_KEY,
    "Prefer": "return=representation"
  };

  try {
    if (action === "get") {
      const r = await fetch(url + "?business_id=eq." + business_id + "&order=created_at.desc", { headers });
      const rows = await r.json();
      return res.status(200).json({ rows });
    }

    if (action === "insert") {
      const r = await fetch(url, {
        method: "POST", headers,
        body: JSON.stringify({ ...data, business_id })
      });
      const row = await r.json();
      return res.status(200).json({ row });
    }

    if (action === "update") {
      const r = await fetch(url + "?id=eq." + id + "&business_id=eq." + business_id, {
        method: "PATCH", headers,
        body: JSON.stringify(data)
      });
      const row = await r.json();
      return res.status(200).json({ row });
    }

    if (action === "delete") {
      await fetch(url + "?id=eq." + id + "&business_id=eq." + business_id, {
        method: "DELETE", headers
      });
      return res.status(200).json({ success: true });
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
