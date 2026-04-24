import { useState, useEffect } from "react";

export default function HotLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("https://cleanmanager-pro.vercel.app/api/sequence-engine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stats" })
    })
    .then(r => r.json())
    .then(data => {
      setLeads(data.leads || []);
      setLoading(false);
    });
  }, []);

  const T = { navy: "#0A1F44", gold: "#C9A84C", green: "#27ae60", red: "#e74c3c", orange: "#f39c12", white: "#ffffff", light: "#f5f5f5", muted: "#888" };

  const hot = leads.filter(l => l.opens > 0 || l.touchIndex >= 2);
  const warm = leads.filter(l => l.touchIndex === 1 && l.opens === 0);
  const cold = leads.filter(l => l.touchIndex === 0);

  const displayed = filter === "hot" ? hot : filter === "warm" ? warm : filter === "cold" ? cold : [...hot, ...warm, ...cold];

  const priorityColor = (lead) => {
    if (lead.opens > 0) return T.red;
    if (lead.touchIndex >= 2) return T.orange;
    if (lead.touchIndex === 1) return "#4a9eff";
    return T.muted;
  };

  const priorityLabel = (lead) => {
    if (lead.opens > 0) return "🔥 Hot — Call Now";
    if (lead.touchIndex >= 3) return "⚡ Final Chase";
    if (lead.touchIndex >= 2) return "♨️ Warm";
    if (lead.touchIndex === 1) return "📧 Follow-up Sent";
    return "❄️ Cold";
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: T.light, minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ background: T.navy, padding: "20px 16px 16px" }}>
        <div style={{ fontSize: 11, color: T.gold, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>Blue Owl</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.white, marginBottom: 4 }}>Lead Pipeline</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{leads.length} total leads · {hot.length} hot</div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "12px 16px" }}>
        {[
          { label: "🔥 Hot", value: "hot", count: hot.length, color: T.red },
          { label: "♨️ Warm", value: "warm", count: warm.length, color: T.orange },
          { label: "❄️ Cold", value: "cold", count: cold.length, color: "#4a9eff" },
          { label: "All", value: "all", count: leads.length, color: T.muted },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            flex: 1, padding: "8px 4px", borderRadius: 10,
            background: filter === f.value ? T.navy : T.white,
            border: "1px solid " + (filter === f.value ? T.navy : "#ddd"),
            color: filter === f.value ? T.white : T.muted,
            fontSize: 10, fontWeight: 700, cursor: "pointer"
          }}>
            {f.label}
            <div style={{ fontSize: 14, fontWeight: 800, color: filter === f.value ? T.white : f.color }}>{f.count}</div>
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: T.muted }}>Loading pipeline...</div>}

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {displayed.slice(0, 50).map((lead, i) => (
          <div key={i} style={{ background: T.white, borderRadius: 14, padding: 14, boxShadow: "0 2px 6px rgba(0,0,0,0.05)", borderLeft: "4px solid " + priorityColor(lead) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{lead.name}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{lead.sector}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{lead.email}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: priorityColor(lead), background: priorityColor(lead) + "18", borderRadius: 100, padding: "3px 10px", whiteSpace: "nowrap", marginLeft: 8 }}>
                {priorityLabel(lead)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1, background: T.light, borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.navy }}>{lead.touchIndex}</div>
                <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase" }}>Touch</div>
              </div>
              <div style={{ flex: 1, background: T.light, borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: lead.opens > 0 ? T.red : T.navy }}>{lead.opens || 0}</div>
                <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase" }}>Opens</div>
              </div>
              <div style={{ flex: 1, background: T.light, borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: lead.replies > 0 ? T.green : T.navy }}>{lead.replies || 0}</div>
                <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase" }}>Replies</div>
              </div>
            </div>
            {lead.phone && (
              <a href={"tel:" + lead.phone} style={{ display: "block", marginTop: 10, padding: "8px", background: T.gold, color: T.navy, borderRadius: 8, textAlign: "center", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
                📞 Call Now
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
