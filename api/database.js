import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { action, table, data, id, business_id } = req.body || {};

  try {
    if (action === "get") {
      const { data: rows, error } = await supabase
        .from(table)
        .select("*")
        .eq("business_id", business_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return res.status(200).json({ rows });
    }

    if (action === "insert") {
      const { data: row, error } = await supabase
        .from(table)
        .insert({ ...data, business_id })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ row });
    }

    if (action === "update") {
      const { data: row, error } = await supabase
        .from(table)
        .update(data)
        .eq("id", id)
        .eq("business_id", business_id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json({ row });
    }

    if (action === "delete") {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id)
        .eq("business_id", business_id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    res.status(400).json({ error: "Unknown action" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
