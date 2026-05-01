import { useState, useEffect } from "react";

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

const LEARN_MATERIALS = {
  "COSHH": {
    description: "Control of Substances Hazardous to Health — mandatory for all cleaning staff",
    keyPoints: ["Always read product labels before use", "Wear appropriate PPE for each chemical", "Store chemicals in original containers", "Never mix chemicals", "Know emergency procedures for spills", "Complete COSHH assessment for each substance"],
    videos: [
      { title: "COSHH Explained for Cleaners", url: "https://www.youtube.com/results?search_query=COSHH+training+cleaning", duration: "8 min" },
      { title: "Chemical Safety in the Workplace", url: "https://www.youtube.com/results?search_query=chemical+safety+workplace+cleaning", duration: "12 min" },
    ],
    resources: [
      { title: "HSE COSHH Guidance", url: "https://www.hse.gov.uk/coshh/", type: "Official Guide" },
    ]
  },
  "Manual Handling": {
    description: "Safe lifting and carrying to prevent injury — required annually",
    keyPoints: ["Assess the load before lifting", "Keep back straight and bend knees", "Hold load close to body", "Avoid twisting while carrying", "Use equipment where possible", "Team lift for heavy items"],
    videos: [
      { title: "Manual Handling Training for Cleaners", url: "https://www.youtube.com/results?search_query=manual+handling+training+cleaning", duration: "10 min" },
    ],
    resources: [
      { title: "HSE Manual Handling Guide", url: "https://www.hse.gov.uk/pubns/indg143.pdf", type: "PDF Guide" },
    ]
  },
  "Fire Safety": {
    description: "Fire awareness and evacuation procedures — required annually",
    keyPoints: ["Know fire escape routes", "Locate fire extinguishers and alarms", "Never prop fire doors open", "Report fire hazards immediately", "Know assembly point location", "Do not use lifts during evacuation"],
    videos: [
      { title: "Fire Safety Training", url: "https://www.youtube.com/results?search_query=fire+safety+training+workplace", duration: "15 min" },
    ],
    resources: [
      { title: "Fire Safety in the Workplace", url: "https://www.gov.uk/workplace-fire-safety-your-responsibilities", type: "Official Guide" },
    ]
  },
  "Infection Control": {
    description: "Infection control and hygiene standards — critical for all cleaning operatives",
    keyPoints: ["Wash hands for 20 seconds minimum", "Use correct PPE for each task", "Colour coding prevents cross contamination", "Dispose of waste safely", "Clean from high to low, clean to dirty", "Report any symptoms immediately"],
    videos: [
      { title: "Infection Control for Cleaners", url: "https://www.youtube.com/results?search_query=infection+control+cleaning+training", duration: "12 min" },
    ],
    resources: [
      { title: "NHS Infection Control Guidelines", url: "https://www.england.nhs.uk/infection-prevention/", type: "Official Guide" },
    ]
  },
  "PPE Usage": {
    description: "Personal protective equipment — mandatory before handling chemicals or equipment",
    keyPoints: ["Select correct PPE for each task", "Check PPE before use for damage", "Wear gloves, apron, goggles as required", "Dispose of single-use PPE safely", "Store PPE correctly after use", "Report damaged PPE immediately"],
    videos: [
      { title: "PPE Training for Cleaning Staff", url: "https://www.youtube.com/results?search_query=PPE+training+cleaning+staff", duration: "9 min" },
    ],
    resources: [
      { title: "HSE PPE at Work Guide", url: "https://www.hse.gov.uk/pubns/indg174.pdf", type: "PDF Guide" },
    ]
  },
  "GDPR & Confidentiality": {
    description: "Data protection and client confidentiality — required for all staff",
    keyPoints: ["Never share client information", "Do not photograph premises without permission", "Report data breaches immediately", "Access only data needed for your role", "Lock screens when unattended", "Dispose of documents securely"],
    videos: [
      { title: "GDPR Training for Staff", url: "https://www.youtube.com/results?search_query=GDPR+training+staff+UK", duration: "15 min" },
    ],
    resources: [
      { title: "ICO GDPR Guide", url: "https://ico.org.uk/for-organisations/guide-to-data-protection/", type: "Official Guide" },
    ]
  },
  "First Aid Awareness": {
    description: "Basic first aid awareness — renews every 3 years",
    keyPoints: ["Call 999 for emergencies", "Know location of first aid kit", "Do not move injured person unless in danger", "Apply pressure to bleeding wounds", "Recovery position for unconscious person", "Document all first aid given"],
    videos: [
      { title: "First Aid Awareness Training", url: "https://www.youtube.com/results?search_query=first+aid+awareness+training+UK", duration: "20 min" },
    ],
    resources: [
      { title: "Red Cross First Aid Guide", url: "https://www.redcross.org.uk/first-aid", type: "Official Guide" },
    ]
  },
  "Health & Safety Induction": {
    description: "General workplace health and safety — required for all new starters",
    keyPoints: ["Report all accidents and near misses", "Use equipment only if trained", "Keep walkways clear", "Report damaged equipment", "Know first aid contacts", "Follow risk assessments"],
    videos: [
      { title: "Health and Safety Induction", url: "https://www.youtube.com/results?search_query=health+safety+induction+training", duration: "20 min" },
    ],
    resources: [
      { title: "HSE New Worker Guide", url: "https://www.hse.gov.uk/workers/index.htm", type: "Official Guide" },
    ]
  },
};

const COURSES = [
  {
    provider: "Highfield Qualifications",
    title: "Level 2 Award in Cleaning Principles",
    type: "Accredited",
    location: "Various UK locations",
    format: "Face-to-face",
    duration: "1 day",
    price: "Price on application",
    url: "https://www.highfieldqualifications.com/search?keyword=cleaning",
    accreditation: "Ofqual regulated"
  },
  {
    provider: "BICS",
    title: "Professional Cleaning Operator",
    type: "Industry Accredited",
    location: "London & nationwide",
    format: "Face-to-face + online",
    duration: "2 days",
    price: "Price on application",
    url: "https://training.bics.org.uk/collections",
    accreditation: "BICS accredited"
  },
  {
    provider: "NCFE",
    title: "Level 2 Certificate in Cleaning Principles",
    type: "Nationally Recognised",
    location: "Online + supported learning",
    format: "Blended learning",
    duration: "6-8 weeks",
    price: "Price on application",
    url: "https://www.ncfe.org.uk/qualification-search/qualification-detail/ncfe-level-2-certificate-in-cleaning-principles-1098",
    accreditation: "Ofqual regulated"
  },
  {
    provider: "NCFE",
    title: "Health & Safety for Cleaning Industry",
    type: "Specialist",
    location: "Online + supported learning",
    format: "Blended learning",
    duration: "4-6 weeks",
    price: "Price on application",
    url: "https://www.ncfe.org.uk/qualification-search/qualification-detail/health-and-safety-for-the-cleaning-and-support-services-industry-690",
    accreditation: "Ofqual regulated"
  },
  {
    provider: "NCFE",
    title: "Cleaning Decontamination & Waste Management",
    type: "Specialist",
    location: "Online + supported learning",
    format: "Blended learning",
    duration: "4-6 weeks",
    price: "Price on application",
    url: "https://www.ncfe.org.uk/qualification-search/qualification-detail/cleaning-decontamination-and-waste-management-1867",
    accreditation: "Ofqual regulated"
  },
  {
    provider: "Reed.co.uk",
    title: "Cleaning Courses & Training",
    type: "Various",
    location: "Online & UK venues",
    format: "Online & face-to-face",
    duration: "Various",
    price: "From £25",
    url: "https://www.reed.co.uk/courses/cleaning",
    accreditation: "CPD & accredited options"
  },
  {
    provider: "Learndirect",
    title: "Online Cleaning Course",
    type: "Online",
    location: "Online — study anywhere",
    format: "Online self-paced",
    duration: "Flexible",
    price: "From £29",
    url: "https://www.learndirect.com/course/cleaning",
    accreditation: "CPD certified"
  },
  {
    provider: "St John Ambulance",
    title: "First Aid at Work",
    type: "Regulated",
    location: "London venues",
    format: "Face-to-face",
    duration: "3 days",
    price: "Price on application",
    url: "https://www.sja.org.uk/courses/workplace-first-aid/hse-first-aid-at-work/book-faw/",
    accreditation: "HSE approved"
  },
];

const T = {
  navy: "#0A1F44", gold: "#C9A84C", green: "#27ae60",
  red: "#e74c3c", orange: "#f39c12", white: "#ffffff",
  light: "#f5f5f5", muted: "#888", blue: "#2980b9",
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
  return { valid: T.green, expiring: T.orange, expired: T.red, missing: T.muted }[status] || T.muted;
}

function statusLabel(status) {
  return { valid: "Valid", expiring: "Expiring Soon", expired: "Expired", missing: "Not Set" }[status] || "Not Set";
}

export default function TrainingCompliance({ staff = [] }) {
  const defaultStaff = staff.length > 0 ? staff : [{ id: "1", name: "Staff Member 1" }, { id: "2", name: "Staff Member 2" }];
  const [tab, setTab] = useState("compliance");
  const [selectedStaff, setSelectedStaff] = useState(defaultStaff[0]?.id || "1");
  const [records, setRecords] = useState({});
  const [editing, setEditing] = useState(null);
  const [dateInput, setDateInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedLearn, setSelectedLearn] = useState(null);
  const [searchCourse, setSearchCourse] = useState("");

  const key = (staffId, trainingId) => staffId + "_" + trainingId;
  const getRecord = (staffId, trainingId) => records[key(staffId, trainingId)] || null;
  const saveRecord = (staffId, trainingId, date) => {
    setRecords(prev => ({ ...prev, [key(staffId, trainingId)]: date }));
    setEditing(null); setDateInput("");
  };

  const filteredTrainings = TRAININGS.filter(t => {
    if (filter === "all") return true;
    return getStatus(getRecord(selectedStaff, t.id)) === filter;
  });

  const allStatuses = TRAININGS.map(t => getStatus(getRecord(selectedStaff, t.id)));
  const counts = { valid: allStatuses.filter(s => s === "valid").length, expiring: allStatuses.filter(s => s === "expiring").length, expired: allStatuses.filter(s => s === "expired").length, missing: allStatuses.filter(s => s === "missing").length };
  const complianceScore = Math.round((counts.valid / TRAININGS.length) * 100);

  const filteredCourses = COURSES.filter(c =>
    searchCourse === "" || c.title.toLowerCase().includes(searchCourse.toLowerCase()) || c.provider.toLowerCase().includes(searchCourse.toLowerCase()) || c.type.toLowerCase().includes(searchCourse.toLowerCase())
  );

  const learnTopics = Object.keys(LEARN_MATERIALS);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: T.light, minHeight: "100vh", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: T.navy, padding: "20px 16px 0" }}>
        <div style={{ fontSize: 11, color: T.gold, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>Blue Owl Cleaning Ltd</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.white, marginBottom: 16 }}>Training Academy</div>
        <div style={{ display: "flex", gap: 0, borderBottom: "none" }}>
          {[["compliance","📋","Compliance"],["learn","📚","Learn"],["courses","🎓","Courses"]].map(([id,icon,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "10px 4px", border: "none", background: "transparent", color: tab === id ? T.gold : "rgba(255,255,255,0.5)", fontWeight: tab === id ? 800 : 500, fontSize: 12, cursor: "pointer", borderBottom: tab === id ? "3px solid " + T.gold : "3px solid transparent", fontFamily: "inherit" }}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* COMPLIANCE TAB */}
      {tab === "compliance" && (
        <div>
          <div style={{ padding: "16px 16px 0" }}>
            <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: T.white, fontSize: 14, fontFamily: "inherit", color: T.navy }}>
              {defaultStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ background: T.white, margin: 16, borderRadius: 16, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Compliance Score</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: complianceScore >= 80 ? T.green : complianceScore >= 50 ? T.orange : T.red }}>{complianceScore}%</div>
            </div>
            <div style={{ height: 8, background: T.light, borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: complianceScore + "%", background: complianceScore >= 80 ? T.green : complianceScore >= 50 ? T.orange : T.red, borderRadius: 100, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {[{ label: "Valid", count: counts.valid, color: T.green }, { label: "Expiring", count: counts.expiring, color: T.orange }, { label: "Expired", count: counts.expired, color: T.red }, { label: "Missing", count: counts.missing, color: T.muted }].map(item => (
                <div key={item.label} style={{ flex: 1, textAlign: "center", background: T.light, borderRadius: 10, padding: "8px 4px" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.count}</div>
                  <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, padding: "0 16px", marginBottom: 12 }}>
            {["all","valid","expiring","expired","missing"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: "6px 0", borderRadius: 8, background: filter === f ? T.navy : T.white, border: "1px solid " + (filter === f ? T.navy : "#ddd"), color: filter === f ? T.white : T.muted, fontSize: 9, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
            ))}
          </div>
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
                      <div style={{ fontSize: 10, fontWeight: 700, color: statusColor(status), background: statusColor(status) + "18", borderRadius: 100, padding: "3px 10px", whiteSpace: "nowrap" }}>{statusLabel(status)}</div>
                      <button onClick={() => { setEditing(isEditing ? null : training.id); setDateInput(rec || ""); }} style={{ fontSize: 11, color: T.navy, background: T.light, border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>{isEditing ? "Cancel" : rec ? "Update" : "Add Date"}</button>
                    </div>
                  </div>
                  {isEditing && (
                    <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)} style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid " + T.gold, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
                      <button onClick={() => saveRecord(selectedStaff, training.id, dateInput)} style={{ padding: "8px 16px", background: T.gold, color: T.navy, border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Save</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEARN TAB */}
      {tab === "learn" && (
        <div style={{ padding: 16 }}>
          {!selectedLearn ? (
            <>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 16, lineHeight: 1.5 }}>📚 Select a training topic to access learning materials, key points and video resources. All content is sourced from official UK bodies and updated regularly.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {learnTopics.map(topic => {
                  const training = TRAININGS.find(t => t.name === topic || topic.includes(t.name));
                  return (
                    <button key={topic} onClick={() => setSelectedLearn(topic)} style={{ display: "flex", alignItems: "center", gap: 14, background: T.white, border: "none", borderRadius: 14, padding: 16, cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.05)", textAlign: "left" }}>
                      <span style={{ fontSize: 28 }}>{training?.icon || "📖"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{topic}</div>
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{LEARN_MATERIALS[topic].description.split("—")[0]}</div>
                      </div>
                      <span style={{ color: T.muted, fontSize: 18 }}>›</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div>
              <button onClick={() => setSelectedLearn(null)} style={{ background: "none", border: "none", color: T.navy, fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to topics</button>
              <div style={{ background: T.white, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.navy, marginBottom: 4 }}>{selectedLearn}</div>
                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{LEARN_MATERIALS[selectedLearn].description}</div>
              </div>
              <div style={{ background: T.white, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 12 }}>✅ Key Learning Points</div>
                {LEARN_MATERIALS[selectedLearn].keyPoints.map((point, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.gold, color: T.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5, paddingTop: 2 }}>{point}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: T.white, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 12 }}>🎥 Training Videos</div>
                {LEARN_MATERIALS[selectedLearn].videos.map((video, i) => (
                  <a key={i} href={video.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < LEARN_MATERIALS[selectedLearn].videos.length - 1 ? "1px solid #f0f0f0" : "none", textDecoration: "none" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ff000015", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>▶️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{video.title}</div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>⏱ {video.duration} · YouTube</div>
                    </div>
                    <span style={{ color: T.muted }}>›</span>
                  </a>
                ))}
              </div>
              <div style={{ background: T.white, borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 12 }}>📄 Official Resources</div>
                {LEARN_MATERIALS[selectedLearn].resources.map((res, i) => (
                  <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < LEARN_MATERIALS[selectedLearn].resources.length - 1 ? "1px solid #f0f0f0" : "none", textDecoration: "none" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "#0A1F4415", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📄</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{res.title}</div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{res.type}</div>
                    </div>
                    <span style={{ color: T.muted }}>›</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* COURSES TAB */}
      {tab === "courses" && (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 12, lineHeight: 1.5 }}>🎓 Accredited face-to-face and online training courses from UK providers. Updated regularly by our AI agent.</div>
          <div style={{ fontSize: 11, color: T.muted, background: "#FEF9E7", border: "1px solid #F9E79F", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>⚠️ Course details and prices are for guidance only. Tap View & Book for current availability and pricing direct from the provider.</div>
          <input value={searchCourse} onChange={e => setSearchCourse(e.target.value)} placeholder="🔍 Search courses..." style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 14, fontFamily: "inherit", marginBottom: 14, boxSizing: "border-box", outline: "none" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredCourses.map((course, i) => (
              <div key={i} style={{ background: T.white, borderRadius: 16, padding: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.05)", borderLeft: "4px solid " + T.gold }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.navy }}>{course.title}</div>
                    <div style={{ fontSize: 12, color: T.gold, fontWeight: 600, marginTop: 2 }}>{course.provider}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.navy, background: T.gold + "22", borderRadius: 100, padding: "3px 10px", marginLeft: 8, whiteSpace: "nowrap" }}>{course.type}</div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {[["📍", course.location], ["⏱", course.duration], ["💷", course.price], ["🎓", course.accreditation], ["📋", course.format]].map(([icon, val]) => (
                    <div key={val} style={{ fontSize: 11, color: "#555", background: T.light, borderRadius: 6, padding: "3px 8px" }}>{icon} {val}</div>
                  ))}
                </div>
                <a href={course.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", background: T.navy, color: T.white, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>View & Book →</a>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, background: "#E8F5E9", borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, color: T.navy, fontWeight: 700, marginBottom: 4 }}>🤖 AI Content Updates</div>
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>Course listings are reviewed and updated weekly by our AI agent. New courses from Trained Up, Direct Learning, BICS, NCFE and City & Guilds are added automatically when published.</div>
          </div>
        </div>
      )}
    </div>
  );
}