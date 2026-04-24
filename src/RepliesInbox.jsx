import { useState, useEffect } from "react";

const T = { navy: "#0A1F44", gold: "#C9A84C", green: "#27ae60", red: "#e74c3c", white: "#ffffff", light: "#f5f5f5", muted: "#888" };

export default function RepliesInbox() {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("/api/replies-inbox")
      .then(r => r.json())
      .then(data => { setReplies(data.replies || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (selected) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", background: T.light, minHeight: "100vh", paddingBottom: 100 }}>
        <div style={{ background: T.navy, padding: "20px 16px 16px" }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: T.gold, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>← Back</button>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.white }}>{selected.subject}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>From: {selected.from}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{new Date(selected.receivedAt).toLocaleString("en-GB")}</div>
        </div>
        <div style={{ margin: 16, background: T.white, borderRadius: 14, padding: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: "#333", whiteSpace: "pre-wrap" }}>{selected.body}</div>
        </div>
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          <a href={"mailto:" + selected.from} style={{
            display: "block", padding: 14, background: T.gold, color: T.navy,
            borderRadius: 12, textAlign: "center", fontWeight: 700, fontSize: 14,
            textDecoration: "none"
          }}>📧 Reply to this email</a>
          <a href={"mailto:" + selected.from + "?subject=Re: " + selected.subject + "&body=Dear Sir/Madam,%0A%0AThank you for your response. I would love to arrange a free site visit at your earliest convenience.%0A%0AKind regards,%0AOla Aina%0ADirector — Blue Owl Cleaning Ltd%0A07472 539 762"} style={{
            display: "block", padding: 14, background: T.navy, color: T.white,
            borderRadius: 12, textAlign: "center", fontWeight: 700, fontSize: 14,
            textDecoration: "none"
          }}>✨ Reply with site visit template</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: T.light, minHeight: "100vh", paddingBottom: 100 }}>
      <div style={{ background: T.navy, padding: "20px 16px 16px" }}>
        <div style={{ fontSize: 11, color: T.gold, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>Blue Owl</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.white, marginBottom: 4 }}>Replies Inbox</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{replies.length} replies received</div>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: T.muted }}>Loading inbox...</div>}

      {!loading && replies.length === 0 && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 8 }}>No replies yet</div>
          <div style={{ fontSize: 13, color: T.muted }}>When businesses reply to your outreach emails they will appear here</div>
        </div>
      )}

      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {replies.map((reply, i) => (
          <button key={i} onClick={() => setSelected(reply)} style={{
            background: reply.read ? T.white : "#fff9e6",
            border: "1px solid " + (reply.read ? "#eee" : T.gold),
            borderRadius: 14, padding: 14, textAlign: "left",
            cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            borderLeft: "4px solid " + (reply.read ? "#eee" : T.gold)
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{reply.from}</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 2, fontWeight: reply.read ? 400 : 600 }}>{reply.subject}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{reply.body?.substring(0, 80)}...</div>
              </div>
              <div style={{ fontSize: 10, color: T.muted, marginLeft: 8, whiteSpace: "nowrap" }}>
                {new Date(reply.receivedAt).toLocaleDateString("en-GB")}
              </div>
            </div>
            {!reply.read && <div style={{ marginTop: 8, display: "inline-block", background: T.gold, color: T.navy, fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase" }}>New</div>}
          </button>
        ))}
      </div>
    </div>
  );
}
