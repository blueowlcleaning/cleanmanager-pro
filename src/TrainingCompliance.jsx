import { useState } from "react";

const TRAININGS = [
  { id: "coshh", name: "COSHH", full: "Control of Substances Hazardous to Health", renewMonths: 12, icon: "⚗️" },
  { id: "manual", name: "Manual Handling", full: "Safe lifting and carrying techniques", renewMonths: 12, icon: "💪" },
  { id: "hs", name: "Health & Safety Induction", full: "General workplace health and safety", renewMonths: 12, icon: "🦺" },
  { id: "fire", name: "Fire Safety", full: "Fire awareness and evacuation procedures", renewMonths: 12, icon: "🔥" },
  { id: "infection", name: "Infection Control", full: "Infection control and hygiene standards", renewMonths: 12, icon: "🧫" },
  { id: "height", name: "Working at Height", full: "Safe working at height procedures", renewMonths: 12, icon: "🪜" },
  { id: "ppe", name: "PPE Usage", full: "Personal protective equipment training", renewMonths: 12, icon: "🥽" },
  { id: "lone", name: "Lone Worker Safety", full: "Safety procedures for lone workers", renewMonths: 12, icon: "👤" },
  { id: "firstaid", name: "First Aid Awareness", full: "Basic first aid awareness training", renewMonths: 36, icon: "🩺" },
  { id: "colour", name: "Colour Coding", full: "Cleaning colour coding system", renewMonths: 12, icon: "🎨" },
  { id: "waste", name: "Waste Management", full: "Correct waste disposal procedures", renewMonths: 12, icon: "♻️" },
  { id: "gdpr", name: "GDPR & Confidentiality", full: "Data protection and confidentiality", renewMonths: 12, icon: "🔒" },
  { id: "dbs", name: "DBS Check", full: "Disclosure and Barring Service check", renewMonths: 36, icon: "📋" },
  { id: "equipment", name: "Equipment Operation", full: "Safe use and maintenance of cleaning equipment", renewMonths: 12, icon: "🧹" },
  { id: "chemical", name: "Chemical Handling", full: "Safe handling and storage of cleaning chemicals", renewMonths: 12, icon: "🧪" },
];

const T = {
  navy: "#0A1F44", gold: "#C9A84C", green: "#27ae60",
  red: "#e74c3c", orange: "#f39c12", white: "#ffffff",
  light: "#f5f5f5", muted: "#888",
};

function getStatus(dateStr) {
  if (!dateStr) return "missing";
  const date = new Date(dateStr);
  const now = new Date();
  const daysLeft = Math.floor((date - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 30) return "expiring";
  return "valid";
}

function statusColor(status) {
  if (status === "valid") return T.green;
  if (status === "expiring") return T.orange;
  if (status === "expired") return T.red;
  return T.muted;
}

function statusLabel(status) {
  if (status === "valid") return "Valid";
  if (status === "expiring") return "Expiring Soon";
  if (status === "expired") return "Expired";
  return "Not Set";
}

export default function TrainingCompliance({ staff = [] }) {
  const defaultStaff = staff.length > 0 ? staff : [
    { id: "1", name: "Staff Member 1" },
    { id: "2", name: "Staff Member 2" },
  ];

  const [selectedStaff, setSelectedStaff] = useState(defaultStaff[0]?.id || "1");
  const [records, setRecords] = useState({});
  const [editing, setEditing] = useState(null);
  const [dateInput, setDateInput] = useState("");
  const [filter, setFilter] = useState("all");

  const key = (staffId, trainingId) => staffId + "_" + trainingId;

  const getRecord = (staffId, trainingId) => records[key(staffId, trainingId)] || null;

  const saveRecord = (staffId, trainingId, date) => {
    setRecords(prev => ({ ...prev, [key(staffId, trainingId)]: date }));
    setEditing(null);
    setDateInput("");
  };

  const filteredTrainings = TRAININGS.filter(t => {
    if (filter === "all") return true;
    const rec = getRecord(selectedStaff, t.id);
    const status = getStatus(rec);
    return status === filter;
  });

  const allStatuses = TRAININGS.map(t => getStatus(getRecord(selectedStaff, t.id)));
  const counts = {
    valid: allStatuses.filter(s => s === "valid").length,
    expiring: allStatuses.filter(s => s === "expiring").length,
    expired: allStatuses.filter(s => s === "expired").length,
    missing: allStatuses.filter(s => s === "missing").length,
  };

  const complianceScore = Math.round((counts.valid / TRAININGS.length) * 100);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: T.light, minHeight: "100vh", paddingBottom: 100 }}>
      
      {/* Header */}
      <div style={{ background: T.navy, padding: "20px 16px 16px" }}>
        <div style={{ fontSize: 11, color: T.gold, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>Blue Owl Cleaning Ltd</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.white, marginBottom: 16 }}>Training & Compliance</div>
        
        {/* Staff selector */}
        <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} style={{
          width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.1)", color: T.white, fontSize: 14, fontFamily: "inherit"
        }}>
          {defaultStaff.map(s => <option key={s.id} value={s.id} style={{ color: "#000" }}>{s.name}</option>)}
        </select>
      </div>

      {/* Compliance score */}
      <div style={{ background: T.white, margin: 16, borderRadius: 16, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Compliance Score</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: complianceScore >= 80 ? T.green : complianceScore >= 50 ? T.orange : T.red }}>
            {complianceScore}%
          </div>
        </div>
        <div style={{ height: 8, background: T.light, borderRadius: 100, overflow: "hidden" }}>
          <div style={{ height: "100%", width: complianceScore + "%", background: complianceScore >= 80 ? T.green : complianceScore >= 50 ? T.orange : T.red, borderRadius: 100, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {[
            { label: "Valid", count: counts.valid, color: T.green },
            { label: "Expiring", count: counts.expiring, color: T.orange },
            { label: "Expired", count: counts.expired, color: T.red },
            { label: "Missing", count: counts.missing, color: T.muted },
          ].map(item => (
            <div key={item.label} style={{ flex: 1, textAlign: "center", background: T.light, borderRadius: 10, padding: "8px 4px" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.count}</div>
              <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, padding: "0 16px", marginBottom: 12 }}>
        {["all", "valid", "expiring", "expired", "missing"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flex: 1, padding: "6px 0", borderRadius: 8,
            background: filter === f ? T.navy : T.white,
            border: "1px solid " + (filter === f ? T.navy : "#ddd"),
            color: filter === f ? T.white : T.muted,
            fontSize: 9, fontWeight: 600, cursor: "pointer",
            textTransform: "capitalize"
          }}>{f}</button>
        ))}
      </div>

      {/* Training list */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredTrainings.map(training => {
          const rec = getRecord(selectedStaff, training.id);
          const status = getStatus(rec);
          const isEditing = editing === training.id;

          return (
            <div key={training.id} style={{ background: T.white, borderRadius: 14, padding: 14, boxShadow: "0 2px 6px rgba(0,0,0,0.05)", borderLeft: "4px solid " + statusColor(status) }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <div style={{ fontSize: 24 }}>{training.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{training.name}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{training.full}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Renews every {training.renewMonths} months</div>
                    {rec && <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Completed: {new Date(rec).toLocaleDateString("en-GB")}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: statusColor(status), background: statusColor(status) + "18", borderRadius: 100, padding: "3px 10px", whiteSpace: "nowrap" }}>
                    {statusLabel(status)}
                  </div>
                  <button onClick={() => { setEditing(isEditing ? null : training.id); setDateInput(rec || ""); }} style={{
                    fontSize: 11, color: T.navy, background: T.light, border: "none", borderRadius: 8,
                    padding: "4px 10px", cursor: "pointer", fontWeight: 600
                  }}>{isEditing ? "Cancel" : rec ? "Update" : "Add Date"}</button>
                </div>
              </div>
              {isEditing && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid " + T.gold,
                    fontSize: 13, fontFamily: "inherit", outline: "none"
                  }} />
                  <button onClick={() => saveRecord(selectedStaff, training.id, dateInput)} style={{
                    padding: "8px 16px", background: T.gold, color: T.navy, border: "none",
                    borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13
                  }}>Save</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
