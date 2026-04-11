import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════
const T = {
  navy: "#0A1F44", gold: "#C9A84C", cream: "#FAF8F3",
  light: "#F0EDE6", muted: "#6B6A7A", white: "#FFFFFF",
  green: "#2A7A2A", red: "#C0392B", blue: "#1A5FA8",
  purple: "#6B3FA0",
};

// ═══════════════════════════════════════════════════════════
// SIMPLE HASH (for frontend demo — backend will use bcrypt)
// ═══════════════════════════════════════════════════════════
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
};

const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();
const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 6);

// ═══════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════
const STORE_KEY = "cleanmanager_v2";

const persist = async (data) => {
  const json = JSON.stringify(data);
  try { await window.storage.set(STORE_KEY, json); } catch { try { localStorage.setItem(STORE_KEY, json); } catch {} }
};

const hydrate = async () => {
  try {
    const r = await window.storage.get(STORE_KEY);
    if (r?.value) return JSON.parse(r.value);
  } catch {}
  try {
    const d = localStorage.getItem(STORE_KEY);
    if (d) return JSON.parse(d);
  } catch {}
  return null;
};

// ═══════════════════════════════════════════════════════════
// INITIAL DATA
// ═══════════════════════════════════════════════════════════
const buildInitialData = () => ({
  version: 2,
  businesses: [
    {
      id: "blueowl",
      name: "Blue Owl Cleaning Ltd",
      email: "office@blueowlcleanings.co.uk",
      phone: "07472539762",
      address: "E14, London",
      website: "www.blueowlcleanings.com",
      companyNo: "16415837",
      plan: "free",
      passwordHash: simpleHash("BlueOwl2026!"),
      pin: simpleHash("1234"),
      isOwner: true,
      isAdmin: false,
      suspended: false,
      exemptFromSubscription: false,
      createdAt: "2026-01-01",
      trialEnds: null,
    },
    {
      id: "admin",
      name: "CleanManager Admin",
      email: "admin@cleanmanager.pro",
      phone: "",
      plan: "admin",
      passwordHash: simpleHash("Admin@2026!"),
      pin: simpleHash("0000"),
      isOwner: false,
      isAdmin: true,
      suspended: false,
      exemptFromSubscription: false,
      createdAt: "2026-01-01",
    },
  ],
  clients: {
    blueowl: [
      { id: "c1", name: "Jing Hu", phone: "07543084722", email: "jing@email.com", address: "E14 0RF", type: "Domestic", notes: "2-bed flat, prefers mornings", pin: generatePin(), pinHash: "", createdAt: "2026-03-01" },
      { id: "c2", name: "Philip Masters", phone: "07700900001", email: "philip@company.com", address: "SW6 1AA", type: "Commercial", notes: "Monthly deep clean", pin: generatePin(), pinHash: "", createdAt: "2026-02-15" },
      { id: "c3", name: "Paul Bark — VSS Dev", phone: "07700900002", email: "paul@vssdevelopments.com", address: "NW8 7AB", type: "Commercial", notes: "Builder's clean", pin: generatePin(), pinHash: "", createdAt: "2026-02-01" },
    ],
  },
  jobs: {
    blueowl: [
      { id: "j1", clientId: "c1", title: "Deep Clean + Carpet + Oven", date: "2026-04-11", time: "09:00", status: "Confirmed", value: 410, notes: "2-bed E14 0RF", staffIds: ["s1"], photos: [], recurring: null, checkins: [] },
      { id: "j2", clientId: "c2", title: "Monthly Deep Clean", date: "2026-04-14", time: "08:00", status: "Pending", value: 750, notes: "SW6 office", staffIds: [], photos: [], recurring: "monthly", checkins: [] },
      { id: "j3", clientId: "c3", title: "Builder's Clean", date: "2026-06-01", time: "07:00", status: "Quoted", value: 900, notes: "117 Broadley Street NW8", staffIds: [], photos: [], recurring: null, checkins: [] },
      { id: "j4", clientId: "c1", title: "Window Clean", date: "2026-03-15", time: "10:00", status: "Completed", value: 80, notes: "", staffIds: ["s1"], photos: [], recurring: null, checkins: [] },
      { id: "j5", clientId: "c2", title: "Office Deep Clean", date: "2026-03-20", time: "08:00", status: "Completed", value: 650, notes: "", staffIds: ["s1", "s2"], photos: [], recurring: null, checkins: [] },
    ],
  },
  staff: {
    blueowl: [
      { id: "s1", name: "Ola Aina", role: "Director", phone: "07472539762", email: "office@blueowlcleanings.co.uk", status: "Active" },
      { id: "s2", name: "Sarah James", role: "Cleaner", phone: "07700900010", email: "sarah@email.com", status: "Active" },
    ],
  },
  invoices: {
    blueowl: [
      { id: "i1", jobId: "j1", clientId: "c1", amount: 410, deposit: 205, status: "Deposit Paid", issued: "2026-04-02", due: "2026-04-11" },
      { id: "i2", jobId: "j2", clientId: "c2", amount: 750, deposit: 0, status: "Unpaid", issued: "2026-04-03", due: "2026-04-14" },
      { id: "i3", jobId: "j4", clientId: "c1", amount: 80, deposit: 0, status: "Paid", issued: "2026-03-15", due: "2026-03-15" },
      { id: "i4", jobId: "j5", clientId: "c2", amount: 650, deposit: 325, status: "Paid", issued: "2026-03-20", due: "2026-03-20" },
    ],
  },
  expenses: {
    blueowl: [
      { id: "e1", category: "Equipment", description: "Vacuum cleaner", amount: 120, date: "2026-03-15" },
      { id: "e2", category: "Supplies", description: "Cleaning products bulk order", amount: 45, date: "2026-04-01" },
      { id: "e3", category: "Transport", description: "Fuel — March", amount: 60, date: "2026-03-28" },
      { id: "e4", category: "Insurance", description: "Public liability renewal", amount: 280, date: "2026-01-01" },
    ],
  },
  notifications: { blueowl: [] },
});

// ═══════════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════════
const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: T.white, borderRadius: 14, padding: 18, boxShadow: "0 2px 14px rgba(10,31,68,0.07)", border: `1px solid ${T.light}`, cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant = "primary", small, full, disabled, style = {} }) => {
  const v = {
    primary: { background: T.navy, color: T.white },
    gold: { background: T.gold, color: T.navy },
    ghost: { background: "transparent", color: T.navy, border: `1.5px solid ${T.navy}` },
    danger: { background: T.red, color: T.white },
    green: { background: T.green, color: T.white },
    light: { background: T.light, color: T.navy },
    purple: { background: T.purple, color: T.white },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ border: "none", borderRadius: 9, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: small ? 12 : 14, padding: small ? "6px 13px" : "10px 20px", width: full ? "100%" : "auto", opacity: disabled ? 0.5 : 1, transition: "opacity 0.15s", ...v[variant], ...style }}>
      {children}
    </button>
  );
};

const Inp = ({ label, value, onChange, placeholder, type = "text", style = {}, hint }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", border: `1.5px solid ${T.light}`, borderRadius: 9, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", color: T.navy, background: T.cream, outline: "none", boxSizing: "border-box", ...style }} />
    {hint && <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{hint}</div>}
  </div>
);

const Sel = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", border: `1.5px solid ${T.light}`, borderRadius: 9, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", color: T.navy, background: T.cream, outline: "none", boxSizing: "border-box" }}>
      {options.map(o => typeof o === "string" ? <option key={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

const Badge = ({ status }) => {
  const colors = { Confirmed: T.green, Pending: "#b87c00", Quoted: T.blue, Completed: "#555", Cancelled: T.red, "Deposit Paid": T.green, Paid: T.green, Unpaid: T.red, Overdue: T.red, Active: T.green, Inactive: T.muted, pro: T.gold, free: T.muted, business: T.purple, admin: T.red, suspended: T.red };
  const c = colors[status] || T.muted;
  return <span style={{ background: c + "22", color: c, border: `1px solid ${c}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{status}</span>;
};

const SecTitle = ({ children, action }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
    <h3 style={{ color: T.navy, margin: 0, fontSize: 15, fontWeight: 800, borderLeft: `3px solid ${T.gold}`, paddingLeft: 10 }}>{children}</h3>
    {action}
  </div>
);

const Modal = ({ title, children, onClose, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
    <div style={{ background: T.white, borderRadius: "20px 20px 0 0", padding: "22px 18px 44px", width: "100%", maxWidth: wide ? 520 : 480, maxHeight: "92vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 style={{ color: T.navy, margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h3>
        <button onClick={onClose} style={{ background: T.light, border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16, color: T.navy }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Toast = ({ message, type = "success" }) => (
  <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: type === "success" ? T.green : type === "error" ? T.red : T.navy, color: T.white, padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", maxWidth: 360, textAlign: "center" }}>
  {message}
</div>
);

// ═══════════════════════════════════════════════════════════
// AUTH — LOGIN / SIGNUP
// ═══════════════════════════════════════════════════════════
function AuthScreen({ onLogin, data, handleCheckout }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loginMethod, setLoginMethod] = useState("password");
  const [bizName, setBizName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [plan, setPlan] = useState("free");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const login = () => {
    setError("");
    const biz = data.businesses.find(b => b.email.toLowerCase() === email.toLowerCase());
    if (!biz) { setError("No account found with that email address."); return; }
    if (biz.suspended) { setError("This account has been suspended. Please contact support."); return; }
    if (loginMethod === "password") {
      if (biz.passwordHash !== simpleHash(password)) { setError("Incorrect password."); return; }
    } else {
      if (biz.pin !== simpleHash(pin)) { setError("Incorrect PIN."); return; }
    }
    onLogin(biz);
  };

  const signup = () => {
    setError("");
    if (!bizName.trim() || !email.trim() || !phone.trim()) { setError("Please fill in all required fields."); return; }
    if (newPass.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPass !== confirmPass) { setError("Passwords do not match."); return; }
    if (newPin.length !== 4 || isNaN(newPin)) { setError("PIN must be exactly 4 digits."); return; }
    if (data.businesses.find(b => b.email.toLowerCase() === email.toLowerCase())) { setError("An account already exists with this email."); return; }
    const nb = { id: generateId(), name: bizName.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), address: address.trim(), website: "", companyNo: "", plan, passwordHash: simpleHash(newPass), pin: simpleHash(newPin), isOwner: false, isAdmin: false, suspended: false, exemptFromSubscription: false, createdAt: new Date().toISOString().split("T")[0], trialEnds: plan !== "free" ? new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0] : null };
    // For paid plans, redirect to Stripe before creating account
    if (plan !== "free") {
      localStorage.setItem("pendingBusiness", JSON.stringify(nb));
      localStorage.setItem("pendingBusinessData", JSON.stringify({ clients: {}, jobs: {}, staff: {}, invoices: {}, expenses: {}, notifications: {} }));
      const priceId = plan === "pro" ? import.meta.env.VITE_STRIPE_PRO_PRICE_ID : import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID;
      alert('Registration complete, calling checkout');
      handleCheckout(priceId);
      return;
    }
    onLogin(nb, nb);
  };

  const plans = [
    { id: "free", label: "Free", price: "£0/mo", desc: "Up to 5 clients, basic job tracking, invoicing", color: T.muted },
    { id: "pro", label: "Pro", price: "£19.99/mo", desc: "Unlimited clients, staff, quotes, reports, GPS, client portal", color: T.gold, popular: true },
    { id: "business", label: "Business", price: "£39.99/mo", desc: "Everything in Pro + multi-location, custom branding, API", color: T.purple },
  ];

  return (
    <div style={{ background: `linear-gradient(160deg, ${T.navy} 0%, #1a3060 100%)`, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: 68, height: 68, background: T.gold, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, marginBottom: 14, boxShadow: "0 8px 32px rgba(201,168,76,0.4)" }}>🦉</div>
      <h1 style={{ color: T.white, fontSize: 26, fontWeight: 800, margin: "0 0 4px", textAlign: "center" }}>CleanManager Pro</h1>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 36px", textAlign: "center" }}>Business management for cleaning companies</p>

      {mode === "plans" && (
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h2 style={{ color: T.white, fontSize: 18, fontWeight: 800, marginBottom: 16, textAlign: "center" }}>Choose Your Plan</h2>
          {plans.map(p => (
            <div key={p.id} onClick={() => setPlan(p.id)}
              style={{ background: plan === p.id ? T.white : "rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: `2px solid ${plan === p.id ? p.color : "transparent"}`, cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {p.popular && <span style={{ background: T.gold, color: T.navy, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>POPULAR</span>}
                  <span style={{ color: plan === p.id ? T.navy : T.white, fontWeight: 800, fontSize: 16 }}>{p.label}</span>
                </div>
                <span style={{ color: plan === p.id ? p.color : "rgba(255,255,255,0.6)", fontWeight: 800 }}>{p.price}</span>
              </div>
              <p style={{ color: plan === p.id ? T.muted : "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>{p.desc}</p>
              {p.id !== "free" && <p style={{ color: T.gold, fontSize: 11, fontWeight: 700, margin: "6px 0 0" }}>✓ 14-day free trial</p>}
            </div>
          ))}
          <Btn full variant="gold" onClick={() => setMode("signup")} style={{ marginTop: 8 }}>Continue with {plans.find(p => p.id === plan)?.label} →</Btn>
          <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", width: "100%", marginTop: 14, fontFamily: "inherit" }}>Already have an account? Sign in</button>
        </div>
      )}

      {mode === "signup" && (
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Plan: <strong style={{ color: T.gold }}>{plans.find(p => p.id === plan)?.label} — {plans.find(p => p.id === plan)?.price}</strong></span>
            <button onClick={() => setMode("plans")} style={{ background: "none", border: "none", color: T.gold, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>Change</button>
          </div>
          {[{ label: "Company Name *", val: bizName, set: setBizName, ph: "e.g. Blue Owl Cleaning Ltd" }, { label: "Email *", val: email, set: setEmail, ph: "office@yourcompany.com", type: "email" }, { label: "Phone *", val: phone, set: setPhone, ph: "07700 000000" }, { label: "Address", val: address, set: setAddress, ph: "e.g. E14, London" }].map(f => (
            <Inp key={f.label} label={f.label} value={f.val} onChange={f.set} placeholder={f.ph} type={f.type || "text"} style={{ background: "rgba(255,255,255,0.1)", color: T.white, border: "1.5px solid rgba(255,255,255,0.15)" }} />
          ))}
          <Inp label="Password * (min 8 characters)" value={newPass} onChange={setNewPass} placeholder="e.g. MyBusiness2026!" type={showPass ? "text" : "password"} style={{ background: "rgba(255,255,255,0.1)", color: T.white, border: "1.5px solid rgba(255,255,255,0.15)" }} />
          <Inp label="Confirm Password *" value={confirmPass} onChange={setConfirmPass} placeholder="Repeat password" type={showPass ? "text" : "password"} style={{ background: "rgba(255,255,255,0.1)", color: T.white, border: "1.5px solid rgba(255,255,255,0.15)" }} />
          <Inp label="4-Digit PIN * (for quick login)" value={newPin} onChange={v => setNewPin(v.slice(0, 4))} placeholder="e.g. 5678" type="number" style={{ background: "rgba(255,255,255,0.1)", color: T.white, border: "1.5px solid rgba(255,255,255,0.15)" }} hint={<span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>You will receive your PIN and login details by email on sign up</span>} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)} />
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Show passwords</span>
          </label>
          {error && <div style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", borderRadius: 8, padding: "8px 12px", color: "#ff8a80", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <Btn full variant="gold" onClick={signup}>Create Account</Btn>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", marginTop: 14 }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: 0 }}>📧 A welcome email with your PIN and login details will be sent automatically on sign up.</p>
          </div>
          <button onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", width: "100%", marginTop: 14, fontFamily: "inherit" }}>← Back to sign in</button>
        </div>
      )}

      {mode === "login" && (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {["password", "pin"].map(m => (
              <button key={m} onClick={() => setLoginMethod(m)}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${loginMethod === m ? T.gold : "rgba(255,255,255,0.1)"}`, background: loginMethod === m ? T.gold + "22" : "transparent", color: loginMethod === m ? T.gold : "rgba(255,255,255,0.5)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                {m === "password" ? "🔑 Password" : "🔢 PIN"}
              </button>
            ))}
          </div>
          <Inp label="Email" type="email" value={email} onChange={setEmail} placeholder="office@yourcompany.com" style={{ background: "rgba(255,255,255,0.08)", color: T.white, border: "1.5px solid rgba(255,255,255,0.15)" }} />
          {loginMethod === "password"
            ? <Inp label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" style={{ background: "rgba(255,255,255,0.08)", color: T.white, border: "1.5px solid rgba(255,255,255,0.15)" }} />
            : <Inp label="4-Digit PIN" type="number" value={pin} onChange={v => setPin(v.slice(0, 4))} placeholder="••••" style={{ background: "rgba(255,255,255,0.08)", color: T.white, border: "1.5px solid rgba(255,255,255,0.15)", fontSize: 22, letterSpacing: 8, textAlign: "center" }} />
          }
          {error && <div style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", borderRadius: 8, padding: "8px 12px", color: "#ff8a80", fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <Btn full variant="gold" onClick={login}>Sign In</Btn>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => setMode("plans")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>New business? Sign up free →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CLIENT PORTAL
// ═══════════════════════════════════════════════════════════
function ClientPortal({ biz, clients, jobs, onExit }) {
  const [step, setStep] = useState("method"); // method | pin | password | portal
  const [method, setMethod] = useState("pin");
  const [pinInput, setPinInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");
  const [client, setClient] = useState(null);

  const loginWithPin = () => {
    const found = clients.find(c => c.pin === pinInput);
    if (found) { setClient(found); setStep("portal"); setError(""); }
    else setError("PIN not recognised. Please contact " + biz.name + ".");
  };

  const loginWithEmail = () => {
    const found = clients.find(c => c.email.toLowerCase() === emailInput.toLowerCase());
    if (found) { setClient(found); setStep("portal"); setError(""); }
    else setError("Email not found. Please contact " + biz.name + ".");
  };

  if (step === "portal" && client) {
    const myJobs = jobs.filter(j => j.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date));
    const upcoming = myJobs.filter(j => !["Completed", "Cancelled"].includes(j.status));
    const past = myJobs.filter(j => j.status === "Completed");
    return (
      <div style={{ background: T.cream, minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ background: T.navy, padding: "16px 18px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: T.gold, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>Client Portal</div>
              <div style={{ color: T.white, fontWeight: 800, fontSize: 17 }}>Hi, {client.name.split(" ")[0]} 👋</div>
            </div>
            <button onClick={() => { setClient(null); setStep("method"); setPinInput(""); setEmailInput(""); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: T.white, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Sign Out</button>
          </div>
        </div>
        <div style={{ padding: "20px 16px 40px" }}>
          {upcoming.length > 0 && <>
            <h3 style={{ color: T.navy, fontSize: 15, fontWeight: 800, marginBottom: 12 }}>📅 Upcoming Bookings</h3>
            {upcoming.map(j => (
              <Card key={j.id} style={{ marginBottom: 10, borderLeft: `4px solid ${T.gold}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 800, color: T.navy, fontSize: 14, marginBottom: 4 }}>{j.title}</div>
                    <div style={{ fontSize: 13, color: T.muted }}>📅 {j.date} at {j.time}</div>
                    {j.notes && <div style={{ fontSize: 12, color: T.muted, marginTop: 4, fontStyle: "italic" }}>{j.notes}</div>}
                  </div>
                  <Badge status={j.status} />
                </div>
              </Card>
            ))}
          </>}
          {past.length > 0 && <>
            <h3 style={{ color: T.navy, fontSize: 15, fontWeight: 800, margin: "20px 0 12px" }}>✅ Previous Cleans</h3>
            {past.slice(0, 5).map(j => (
              <Card key={j.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: T.navy, fontSize: 13 }}>{j.title}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>📅 {j.date}</div>
                  </div>
                  <Badge status={j.status} />
                </div>
              </Card>
            ))}
          </>}
          {myJobs.length === 0 && <Card style={{ textAlign: "center", padding: 30 }}><div style={{ fontSize: 36, marginBottom: 10 }}>📋</div><p style={{ color: T.muted }}>No bookings yet. Contact us to arrange your first clean.</p></Card>}
          <Card style={{ marginTop: 24, textAlign: "center", background: T.navy }}>
            <div style={{ color: T.gold, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>Your Cleaning Company</div>
            <div style={{ color: T.white, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{biz.name}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>📞 {biz.phone}</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: `linear-gradient(160deg, ${T.navy} 0%, #1a3060 100%)`, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ width: 56, height: 56, background: T.gold, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 14 }}>🦉</div>
      <h2 style={{ color: T.white, margin: "0 0 4px", textAlign: "center", fontSize: 20, fontWeight: 800 }}>{biz.name}</h2>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 28px", textAlign: "center" }}>Client Portal</p>
      <div style={{ width: "100%", maxWidth: 320 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {["pin", "email"].map(m => (
            <button key={m} onClick={() => { setMethod(m); setError(""); }}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${method === m ? T.gold : "rgba(255,255,255,0.1)"}`, background: method === m ? T.gold + "22" : "transparent", color: method === m ? T.gold : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {m === "pin" ? "🔢 PIN" : "📧 Email"}
            </button>
          ))}
        </div>
        {method === "pin" ? (
          <>
            <Inp type="number" value={pinInput} onChange={v => setPinInput(v.slice(0, 4))} placeholder="Enter your 4-digit PIN" style={{ background: "rgba(255,255,255,0.1)", color: T.white, border: "1.5px solid rgba(255,255,255,0.2)", fontSize: 22, letterSpacing: 8, textAlign: "center" }} />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textAlign: "center", margin: "-6px 0 12px" }}>Your PIN was sent to you by {biz.name}</p>
          </>
        ) : (
          <Inp label="Your Email Address" type="email" value={emailInput} onChange={setEmailInput} placeholder="you@email.com" style={{ background: "rgba(255,255,255,0.1)", color: T.white, border: "1.5px solid rgba(255,255,255,0.2)" }} />
        )}
        {error && <div style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", borderRadius: 8, padding: "8px 12px", color: "#ff8a80", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <Btn full variant="gold" onClick={method === "pin" ? loginWithPin : loginWithEmail}>Access My Bookings</Btn>
        <button onClick={onExit} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 13, cursor: "pointer", width: "100%", marginTop: 14, fontFamily: "inherit" }}>← Back</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════════
function AdminPanel({ data, onDataChange, onLogout }) {
  const [tab, setTab] = useState("overview");
  const businesses = data.businesses.filter(b => !b.isAdmin);
  const totalClients = Object.values(data.clients).flat().length;
  const totalJobs = Object.values(data.jobs).flat().length;
  const totalRevenue = Object.values(data.invoices).flat().filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);

  const suspend = (id) => {
    onDataChange({ ...data, businesses: data.businesses.map(b => b.id === id ? { ...b, suspended: !b.suspended } : b) });
  };

  const upgradePlan = (id, plan) => {
    onDataChange({ ...data, businesses: data.businesses.map(b => b.id === id ? { ...b, plan } : b) });
  };

  return (
    <div style={{ background: T.cream, minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: "#1a0533", padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: T.purple, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>Admin Panel</div>
            <div style={{ color: T.white, fontWeight: 800, fontSize: 15 }}>CleanManager Pro</div>
          </div>
          <Btn small variant="ghost" onClick={onLogout} style={{ color: T.white, border: "1px solid rgba(255,255,255,0.3)" }}>Sign Out</Btn>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${T.light}`, background: T.white }}>
        {["overview", "businesses", "plans"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "12px 4px", border: "none", background: "none", color: tab === t ? T.navy : T.muted, fontWeight: tab === t ? 800 : 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit", borderBottom: tab === t ? `2px solid ${T.purple}` : "2px solid transparent", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "16px 14px 40px" }}>
        {tab === "overview" && <>
          <h2 style={{ color: T.navy, fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Platform Overview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["Businesses", businesses.length, "🏢"], ["Total Clients", totalClients, "👥"], ["Total Jobs", totalJobs, "🧹"], ["Platform Revenue", `£${totalRevenue.toLocaleString()}`, "💰"]].map(([l, v, i]) => (
              <Card key={l} style={{ textAlign: "center", padding: 14 }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{i}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>{v}</div>
                <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" }}>{l}</div>
              </Card>
            ))}
          </div>
          <Card>
            <SecTitle>Plan Breakdown</SecTitle>
            {["free", "pro", "business"].map(p => {
              const count = businesses.filter(b => b.plan === p).length;
              return (
                <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Badge status={p} />
                  <div style={{ flex: 1, height: 6, background: T.light, borderRadius: 3, margin: "0 12px" }}>
                    <div style={{ height: 6, background: T.navy, borderRadius: 3, width: businesses.length ? `${(count / businesses.length) * 100}%` : "0%" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{count}</span>
                </div>
              );
            })}
          </Card>
        </>}

        {tab === "businesses" && <>
          <h2 style={{ color: T.navy, fontSize: 18, fontWeight: 800, marginBottom: 16 }}>All Businesses ({businesses.length})</h2>
          {businesses.map(b => (
            <Card key={b.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: T.navy }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{b.email}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{b.phone} · Joined {b.createdAt}</div>
                  {b.trialEnds && <div style={{ fontSize: 11, color: T.gold, fontWeight: 600 }}>Trial ends: {b.trialEnds}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <Badge status={b.plan} />
                  {b.suspended && <Badge status="suspended" />}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Btn small variant={b.suspended ? "green" : "danger"} onClick={() => suspend(b.id)}>{b.suspended ? "Reinstate" : "Suspend"}</Btn>
                {["free", "pro", "business"].filter(p => p !== b.plan).map(p => (
                  <Btn key={p} small variant="ghost" onClick={() => upgradePlan(b.id, p)}>→ {p}</Btn>
                ))}
              </div>
            </Card>
          ))}
        </>}

        {tab === "plans" && <>
          <h2 style={{ color: T.navy, fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Pricing Plans</h2>
          {[{ plan: "free", price: "£0", clients: 5, features: ["Basic job tracking", "Invoice generation", "1 staff member"] }, { plan: "pro", price: "£19.99/mo", clients: "Unlimited", features: ["Everything in Free", "Unlimited clients & staff", "Quote generator", "Expense tracker", "Reporting & analytics", "Client portal", "GPS check-in", "Review automation"] }, { plan: "business", price: "£39.99/mo", clients: "Unlimited", features: ["Everything in Pro", "Multi-location", "Custom branding", "Priority support", "API access"] }].map(p => (
            <Card key={p.plan} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Badge status={p.plan} />
                <span style={{ fontWeight: 800, color: T.navy, fontSize: 15 }}>{p.price}</span>
              </div>
              <div style={{ fontSize: 12, color: T.muted }}>Max clients: {p.clients}</div>
              {p.features.map(f => <div key={f} style={{ fontSize: 12, color: T.navy, marginTop: 3 }}>✓ {f}</div>)}
            </Card>
          ))}
          <Card style={{ background: T.navy }}>
            <div style={{ color: T.gold, fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Monthly Revenue Projection</div>
            {[5, 20, 50, 100].map(n => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: T.white, marginBottom: 4 }}>
                <span>{n} Pro customers</span>
                <span style={{ color: T.gold, fontWeight: 700 }}>£{(n * 19.99).toFixed(0)}/mo</span>
              </div>
            ))}
          </Card>
        </>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CLIENT MANAGEMENT WITH PIN SHARING
// ═══════════════════════════════════════════════════════════
function Clients({ clients, setClients }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", type: "Domestic", notes: "", pin: "" });
  const [editing, setEditing] = useState(null);
  const [showPinFor, setShowPinFor] = useState(null);
  const [copied, setCopied] = useState(false);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.address || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  const save = () => {
    if (!form.name.trim()) return;
    const pin = form.pin || generatePin();
    if (editing) {
      setClients(clients.map(c => c.id === editing ? { ...form, pin, id: editing } : c));
    } else {
      const newClient = { ...form, pin, id: generateId(), createdAt: new Date().toISOString().split("T")[0] };
      setClients([...clients, newClient]);
      // NOTE FOR DEVELOPER: Send client welcome email here
      // POST /api/email/client-welcome { to: newClient.email, clientName: newClient.name, pin: pin, bizName: biz.name }
      setShowPinFor(newClient.id);
    }
    setShowForm(false); setEditing(null);
  };

  const sharePin = (client) => {
    const msg = `Hi ${client.name.split(" ")[0]} 👋\n\nYour client portal PIN for Blue Owl Cleaning is:\n\n🔢 PIN: ${client.pin}\n\nUse this to access your bookings at any time.\n\nBlue Owl Cleaning Ltd 🦉`;
    navigator.clipboard?.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ color: T.navy, margin: 0, fontSize: 20, fontWeight: 800 }}>Clients ({clients.length})</h2>
        <Btn onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", phone: "", email: "", address: "", type: "Domestic", notes: "", pin: "" }); }}>+ Add</Btn>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 14, borderLeft: `4px solid ${T.gold}` }}>
          <SecTitle>{editing ? "Edit Client" : "New Client"}</SecTitle>
          <Inp label="Full Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. John Smith" />
          <Inp label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="+44 7700 000000" />
          <Inp label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="email@example.com" />
          <Inp label="Address / Postcode" value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="e.g. E14 5AB" />
          <Sel label="Client Type" value={form.type} onChange={v => setForm({ ...form, type: v })} options={["Domestic", "Commercial"]} />
          <Inp label="Notes" value={form.notes} onChange={v => setForm({ ...form, notes: v })} placeholder="Any useful notes..." />
          <Inp label="Portal PIN (leave blank to auto-generate)" value={form.pin} onChange={v => setForm({ ...form, pin: v.slice(0, 4) })} placeholder="Auto-generated if blank" type="number" hint="Client uses this PIN to log into their portal and view their bookings" />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={save}>Save Client</Btn>
            <Btn variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Btn>
          </div>
        </Card>
      )}

      <Inp placeholder="🔍 Search by name, address or phone..." value={search} onChange={setSearch} />

      {filtered.map(c => {
        const pinVisible = showPinFor === c.id;
        return (
          <Card key={c.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: T.navy }}>{c.name}</span>
                  <span style={{ background: c.type === "Commercial" ? T.navy + "22" : T.gold + "33", color: c.type === "Commercial" ? T.navy : "#8B6914", fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 10 }}>{c.type}</span>
                </div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
                  {c.phone && <span>📞 {c.phone}<br /></span>}
                  {c.email && <span>✉️ {c.email}<br /></span>}
                  {c.address && <span>📍 {c.address}</span>}
                </div>
                {c.notes && <div style={{ fontSize: 12, color: T.muted, marginTop: 6, fontStyle: "italic" }}>"{c.notes}"</div>}

                {/* PIN section */}
                <div style={{ marginTop: 10, background: T.cream, borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.navy, textTransform: "uppercase", letterSpacing: 1 }}>Portal PIN</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.gold, letterSpacing: 4, marginTop: 2 }}>{pinVisible ? c.pin : "••••"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small variant="light" onClick={() => setShowPinFor(pinVisible ? null : c.id)}>{pinVisible ? "Hide" : "Show"}</Btn>
                      <Btn small variant="gold" onClick={() => sharePin(c)}>{copied ? "Copied ✓" : "Share"}</Btn>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>WhatsApp this PIN to the client so they can access their booking portal</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 5, flexShrink: 0, marginLeft: 8 }}>
                <Btn small variant="ghost" onClick={() => { setForm({ ...c, pin: c.pin || "" }); setEditing(c.id); setShowForm(true); }}>Edit</Btn>
                <Btn small variant="danger" onClick={() => setClients(clients.filter(x => x.id !== c.id))}>✕</Btn>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// JOBS
// ═══════════════════════════════════════════════════════════
function Jobs({ jobs, setJobs, clients, setClients, staff, addNotification }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [clientMode, setClientMode] = useState("existing");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [gpsModal, setGpsModal] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [form, setForm] = useState({ clientId: clients[0]?.id || "", title: "", date: "", time: "09:00", status: "Pending", value: "", notes: "", staffIds: [], recurring: "none" });
  const fileRef = useRef();

  const filtered = filter === "All" ? jobs : jobs.filter(j => j.status === filter);

  const save = () => {
    if (!form.title.trim()) return;
    let cId = form.clientId;
    if (clientMode === "new" && newClientName.trim()) {
      const nc = { id: generateId(), name: newClientName.trim(), phone: newClientPhone.trim(), email: "", address: "", type: "Domestic", notes: "", pin: generatePin(), createdAt: new Date().toISOString().split("T")[0] };
      setClients(prev => [...prev, nc]);
      cId = nc.id;
    }
    const d = { ...form, clientId: cId, value: Number(form.value) };
    if (editing) {
      setJobs(jobs.map(j => j.id === editing ? { ...d, id: editing, photos: j.photos, checkins: j.checkins } : j));
    } else {
      setJobs([...jobs, { ...d, id: generateId(), photos: [], checkins: [] }]);
      addNotification(`New job added: ${form.title}`);
    }
    setShowForm(false); setEditing(null); setClientMode("existing"); setNewClientName(""); setNewClientPhone("");
  };

  const addPhoto = (jobId, file) => {
    const url = URL.createObjectURL(file);
    setJobs(jobs.map(j => j.id === jobId ? { ...j, photos: [...(j.photos || []), { url, name: file.name, time: new Date().toLocaleTimeString(), type: "general" }] } : j));
  };

  const gpsCheckin = (jobId, type) => {
    setGpsLoading(true);
    const record = (lat, lng, manual = false) => {
      const entry = { type, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString("en-GB"), lat, lng, manual };
      setJobs(jobs.map(j => j.id === jobId ? { ...j, checkins: [...(j.checkins || []), entry] } : j));
      setGpsLoading(false);
      setGpsModal(null);
      addNotification(`Staff clocked ${type === "in" ? "in" : "out"}: ${jobs.find(j => j.id === jobId)?.title}`);
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => record(pos.coords.latitude.toFixed(5), pos.coords.longitude.toFixed(5)),
        () => record("N/A", "N/A", true),
        { timeout: 8000 }
      );
    } else { record("N/A", "N/A", true); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ color: T.navy, margin: 0, fontSize: 20, fontWeight: 800 }}>Jobs</h2>
        <Btn onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ clientId: clients[0]?.id || "", title: "", date: "", time: "09:00", status: "Pending", value: "", notes: "", staffIds: [], recurring: "none" }); }}>+ Add</Btn>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 14, borderLeft: `4px solid ${T.gold}` }}>
          <SecTitle>{editing ? "Edit Job" : "New Job"}</SecTitle>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: "uppercase", letterSpacing: 1 }}>Client</label>
              <button onClick={() => setClientMode(clientMode === "existing" ? "new" : "existing")} style={{ fontSize: 11, fontWeight: 700, color: T.gold, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>{clientMode === "existing" ? "+ New client" : "← Existing"}</button>
            </div>
            {clientMode === "new" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Client name *" style={{ width: "100%", border: `1.5px solid ${T.gold}`, borderRadius: 9, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", color: T.navy, background: T.cream, outline: "none", boxSizing: "border-box" }} />
                <input value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="Phone number" style={{ width: "100%", border: `1.5px solid ${T.light}`, borderRadius: 9, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", color: T.navy, background: T.cream, outline: "none", boxSizing: "border-box" }} />
              </div>
            ) : (
              <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} style={{ width: "100%", border: `1.5px solid ${T.light}`, borderRadius: 9, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", color: T.navy, background: T.cream, outline: "none", boxSizing: "border-box" }}>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
          <Inp label="Job Title *" value={form.title} onChange={v => setForm({ ...form, title: v })} placeholder="e.g. Deep Clean + Carpet" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Inp label="Date" type="date" value={form.date} onChange={v => setForm({ ...form, date: v })} />
            <Inp label="Time" type="time" value={form.time} onChange={v => setForm({ ...form, time: v })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Sel label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={["Pending", "Confirmed", "Quoted", "Completed", "Cancelled"]} />
            <Inp label="Value £" type="number" value={form.value} onChange={v => setForm({ ...form, value: v })} placeholder="0" />
          </div>
          <Sel label="Recurring" value={form.recurring} onChange={v => setForm({ ...form, recurring: v })} options={["none", "weekly", "fortnightly", "monthly"]} />
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Assign Staff</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {staff.map(s => {
                const sel = form.staffIds.includes(s.id);
                return <div key={s.id} onClick={() => setForm({ ...form, staffIds: sel ? form.staffIds.filter(x => x !== s.id) : [...form.staffIds, s.id] })} style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${sel ? T.gold : T.light}`, background: sel ? T.gold + "22" : T.white, cursor: "pointer", fontSize: 12, fontWeight: 600, color: T.navy }}>{s.name}</div>;
              })}
            </div>
          </div>
          <Inp label="Notes" value={form.notes} onChange={v => setForm({ ...form, notes: v })} placeholder="Any job notes..." />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={save}>Save Job</Btn>
            <Btn variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        {["All", "Confirmed", "Pending", "Quoted", "Completed", "Cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ border: `1.5px solid ${filter === s ? T.navy : T.light}`, background: filter === s ? T.navy : T.white, color: filter === s ? T.white : T.muted, borderRadius: 20, padding: "4px 11px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{s}</button>
        ))}
      </div>

      {gpsModal && (
        <Modal title="GPS Check-in / Check-out" onClose={() => setGpsModal(null)}>
          <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>📍</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: T.navy, marginBottom: 4 }}>{gpsModal.title}</div>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>{clients.find(c => c.id === gpsModal.clientId)?.name} · {gpsModal.date}</div>
            {gpsLoading ? <div style={{ color: T.muted, fontSize: 14 }}>Getting location...</div> : (
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Btn variant="green" onClick={() => gpsCheckin(gpsModal.id, "in")}>🟢 Clock In</Btn>
                <Btn variant="danger" onClick={() => gpsCheckin(gpsModal.id, "out")}>🔴 Clock Out</Btn>
              </div>
            )}
            {(gpsModal.checkins || []).length > 0 && (
              <div style={{ marginTop: 16, textAlign: "left" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: "uppercase", marginBottom: 6 }}>History</div>
                {gpsModal.checkins.slice(-6).map((c, i) => (
                  <div key={i} style={{ fontSize: 12, color: T.muted, marginBottom: 3 }}>
                    {c.type === "in" ? "🟢" : "🔴"} {c.type === "in" ? "Clock in" : "Clock out"} — {c.time}, {c.date} {c.manual ? "(manual)" : `📍 ${c.lat}, ${c.lng}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {filtered.map(j => {
        const client = clients.find(c => c.id === j.clientId);
        const aStaff = staff.filter(s => j.staffIds?.includes(s.id));
        const exp = expanded === j.id;
        const latestCheckin = [...(j.checkins || [])].reverse().find(c => c.type === "in");
        const latestCheckout = [...(j.checkins || [])].reverse().find(c => c.type === "out");
        const isCheckedIn = latestCheckin && (!latestCheckout || (j.checkins || []).lastIndexOf(latestCheckin) > (j.checkins || []).lastIndexOf(latestCheckout));

        return (
          <Card key={j.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setExpanded(exp ? null : j.id)}>
                <div style={{ fontWeight: 800, fontSize: 14, color: T.navy, marginBottom: 2 }}>{j.title}</div>
                <div style={{ fontSize: 12, color: T.muted }}>👤 {client?.name} · 📅 {j.date} {j.time}</div>
                {j.recurring && j.recurring !== "none" && <div style={{ fontSize: 11, color: T.gold, fontWeight: 600, marginTop: 2 }}>🔁 {j.recurring}</div>}
                {isCheckedIn && <div style={{ fontSize: 11, color: T.green, fontWeight: 600, marginTop: 2 }}>📍 Staff currently on site</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <Badge status={j.status} />
                <span style={{ fontSize: 14, fontWeight: 800, color: T.gold }}>£{j.value}</span>
              </div>
            </div>

            {exp && (
              <div style={{ marginTop: 12, borderTop: `1px solid ${T.light}`, paddingTop: 12 }}>
                {aStaff.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 4, textTransform: "uppercase" }}>Staff Assigned</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{aStaff.map(s => <span key={s.id} style={{ fontSize: 12, background: T.navy + "11", color: T.navy, padding: "3px 10px", borderRadius: 10, fontWeight: 600 }}>{s.name}</span>)}</div>
                  </div>
                )}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 6, textTransform: "uppercase" }}>
                    Photos ({j.photos?.length || 0})
                    <span style={{ color: T.muted, fontWeight: 400, marginLeft: 4, textTransform: "none" }}>— before & after</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {j.photos?.map((p, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={p.url} alt="" style={{ width: 58, height: 58, borderRadius: 8, objectFit: "cover", border: `1px solid ${T.light}` }} />
                        <div style={{ position: "absolute", bottom: 2, left: 2, background: "rgba(0,0,0,0.6)", color: T.white, fontSize: 8, padding: "1px 4px", borderRadius: 4 }}>{p.time}</div>
                      </div>
                    ))}
                    <div onClick={() => { fileRef.current.dataset.jid = j.id; fileRef.current.click(); }}
                      style={{ width: 58, height: 58, borderRadius: 8, border: `2px dashed ${T.light}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22, color: T.muted }}>+</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {["Confirmed", "Completed", "Cancelled"].map(s => (
                    <Btn key={s} small variant={s === "Completed" ? "green" : s === "Cancelled" ? "danger" : "ghost"}
                      onClick={() => { setJobs(jobs.map(x => x.id === j.id ? { ...x, status: s } : x)); if (s === "Completed") addNotification(`Job completed: ${j.title}`); }}>
                      {s}
                    </Btn>
                  ))}
                  <Btn small variant="light" onClick={() => setGpsModal(jobs.find(x => x.id === j.id))}>📍 GPS</Btn>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn small variant="ghost" onClick={() => { setForm({ ...j, value: String(j.value), staffIds: j.staffIds || [], recurring: j.recurring || "none", clientId: j.clientId }); setEditing(j.id); setShowForm(true); setExpanded(null); }}>Edit</Btn>
                  <Btn small variant="danger" onClick={() => setJobs(jobs.filter(x => x.id !== j.id))}>Delete</Btn>
                </div>
              </div>
            )}
          </Card>
        );
      })}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const jid = e.target.dataset.jid; if (e.target.files[0]) addPhoto(jid, e.target.files[0]); e.target.value = ""; }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// QUOTE GENERATOR
// ═══════════════════════════════════════════════════════════
function QuoteGen({ clients, setJobs, setInvoices, addNotification }) {
  const [step, setStep] = useState(1);
  const [clientMode, setClientMode] = useState("existing");
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [newClientName, setNewClientName] = useState("");
  const [q, setQ] = useState({ propType: "Flat / Apartment", beds: "2", baths: "1", floors: "1", cleanType: "Deep Clean", frequency: "One-off", oven: false, carpet: false, carpetRooms: "2", windows: false, windowsType: "Internal only", communal: false, date: "", notes: "" });
  const [quote, setQuote] = useState(null);
  const [saved, setSaved] = useState(false);

  const commercial = ["Office", "Restaurant / Café", "Retail / Shop", "School / College", "University", "Hospital / Clinic", "Care Home", "Gym / Leisure Centre", "Hotel", "Warehouse / Industrial", "Church / Place of Worship", "Community Centre", "Construction Site", "Government Building", "Airport / Transport Hub", "Other"].includes(q.propType);
  // ── LONDON MARKET RATES (researched April 2026) ──────────
  // Domestic: fixed price by property size — competitive mid-market London rates
  // Source: Cleaners of London, Samyx, eMop, Magic Pro, Cleaner Cleaner (20+ companies)

  const EOT = { "Studio": 210, "1": 260, "2": 320, "3": 390, "4": 480, "5": 560, "6+": 650 };
  const DEEP = { "Studio": 175, "1": 220, "2": 285, "3": 350, "4": 430, "5": 510, "6+": 600 };
  const REGULAR_HOURLY = 23; // per hour — London agency rate
  const ONOFF_HOURLY = 25;   // one-off clean per hour
  const MIN_HOURS = { "Studio": 2, "1": 3, "2": 4, "3": 5, "4": 6, "5": 7, "6+": 8 };

  // Extras (per unit)
  const EXTRAS = {
    oven: 65, hob: 20, carpet: 45, winInt: 35, winExt: 55, winBoth: 80,
    communal: 130, upholstery: 60, mattress: 40, fridge: 30, dishwasher: 25,
  };

  // Frequency discounts
  const DISC = { "One-off": 1, "Weekly": 0.82, "Fortnightly": 0.88, "Monthly": 0.93 };

  // Commercial — price on assessment message
  const ASSESSMENT_TYPES = [
    "Builder's / Post-Construction Clean", "Specialist Clean", "Emergency Clean"
  ];

  const calc = () => {
    let base = 0, bd = [];
    const beds = q.beds;

    // Assessment-only services
    if (ASSESSMENT_TYPES.includes(q.cleanType) || commercial) {
      setQuote({ assessment: true });
      setStep(3);
      return;
    }

    // End of tenancy — fixed by beds
    if (q.cleanType === "End of Tenancy / Move-out" || q.cleanType === "Move-in Clean") {
      const price = EOT[beds] || 320;
      base += price;
      bd.push({ item: `${q.cleanType} — ${beds} bed${beds !== "1" && beds !== "Studio" ? "s" : ""}`, price });
      bd.push({ item: "Includes: all rooms, kitchen, bathrooms, skirting, internal windows", price: 0, note: true });
    }
    // Deep clean / spring clean — fixed by beds
    else if (q.cleanType === "Deep Clean" || q.cleanType === "Spring Clean") {
      const price = DEEP[beds] || 285;
      base += price;
      bd.push({ item: `${q.cleanType} — ${beds} bed${beds !== "1" && beds !== "Studio" ? "s" : ""}`, price });
    }
    // Regular / one-off — hourly
    else {
      const rate = q.cleanType === "Regular Clean" ? REGULAR_HOURLY : ONOFF_HOURLY;
      const hours = MIN_HOURS[beds] || 3;
      const price = rate * hours;
      base += price;
      bd.push({ item: `${q.cleanType} — ${hours} hours @ £${rate}/hr`, price });
    }

    // Bathroom supplement (extra bathrooms beyond 1)
    const extraBaths = Math.max(0, Number(q.baths) - 1);
    if (extraBaths > 0) {
      const bthExtra = extraBaths * 30;
      base += bthExtra;
      bd.push({ item: `Additional bathroom${extraBaths > 1 ? "s" : ""} (${extraBaths})`, price: bthExtra });
    }

    // Extras
    if (q.oven) { base += EXTRAS.oven; bd.push({ item: "Oven & hob deep clean", price: EXTRAS.oven }); }
    if (q.carpet) { const c = EXTRAS.carpet * Number(q.carpetRooms); base += c; bd.push({ item: `Carpet clean — ${q.carpetRooms} room${q.carpetRooms > 1 ? "s" : ""}`, price: c }); }
    if (q.windows) { const wp = q.windowsType === "Internal only" ? EXTRAS.winInt : q.windowsType === "External only" ? EXTRAS.winExt : EXTRAS.winBoth; base += wp; bd.push({ item: `Window clean (${q.windowsType})`, price: wp }); }
    if (q.communal) { base += EXTRAS.communal; bd.push({ item: "Communal area clean", price: EXTRAS.communal }); }

    // Frequency discount
    const disc = DISC[q.frequency] || 1;
    if (disc < 1) {
      const sv = Math.round(base * (1 - disc));
      base = Math.round(base * disc);
      bd.push({ item: `${q.frequency} contract discount (${Math.round((1 - disc) * 100)}% off)`, price: -sv });
    }

    const total = Math.ceil(base / 5) * 5;
    setQuote({ breakdown: bd, total, deposit: Math.round(total * 0.5), assessment: false });
    setStep(3);
  };

  const save = () => {
    const cId = clientMode === "new" ? generateId() : clientId;
    const j = { id: generateId(), clientId: cId, title: `${q.cleanType} — ${q.propType}`, date: q.date, time: "09:00", status: "Quoted", value: quote.total, notes: q.notes, staffIds: [], photos: [], recurring: q.frequency !== "One-off" ? q.frequency.toLowerCase() : null, checkins: [] };
    setJobs(p => [...p, j]);
    setInvoices(p => [...p, { id: generateId(), jobId: j.id, clientId: cId, amount: quote.total, deposit: quote.deposit, status: "Unpaid", issued: new Date().toISOString().split("T")[0], due: q.date }]);
    const name = clientMode === "new" ? newClientName : clients.find(c => c.id === clientId)?.name;
    addNotification(`Quote created: £${quote.total} for ${name}`);
    setSaved(true);
  };

  if (saved) return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
      <h2 style={{ color: T.navy }}>Quote Saved!</h2>
      <p style={{ color: T.muted, marginBottom: 4 }}>Job created · Invoice raised</p>
      <p style={{ color: T.gold, fontSize: 22, fontWeight: 800, marginBottom: 24 }}>£{quote.total}</p>
      <Btn variant="gold" onClick={() => { setSaved(false); setStep(1); setQuote(null); }}>New Quote</Btn>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: T.navy, margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>Quote Generator</h2>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 14 }}>Build an accurate price in seconds.</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {["Property", "Extras", "Quote"].map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{ height: 4, borderRadius: 2, background: step > i ? T.gold : step === i + 1 ? T.navy : T.light, marginBottom: 3 }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: step === i + 1 ? T.navy : T.muted, textTransform: "uppercase", textAlign: "center" }}>{s}</div>
          </div>
        ))}
      </div>

      {step === 1 && <Card>
        <SecTitle>Property Details</SecTitle>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: "uppercase", letterSpacing: 1 }}>Client</label>
            <button onClick={() => setClientMode(clientMode === "existing" ? "new" : "existing")} style={{ fontSize: 11, fontWeight: 700, color: T.gold, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>{clientMode === "existing" ? "+ New client" : "← Existing"}</button>
          </div>
          {clientMode === "new"
            ? <input value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Client name *" style={{ width: "100%", border: `1.5px solid ${T.gold}`, borderRadius: 9, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", color: T.navy, background: T.cream, outline: "none", boxSizing: "border-box" }} />
            : <select value={clientId} onChange={e => setClientId(e.target.value)} style={{ width: "100%", border: `1.5px solid ${T.light}`, borderRadius: 9, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", color: T.navy, background: T.cream, outline: "none", boxSizing: "border-box" }}>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          }
        </div>
        <Sel label="Property Type" value={q.propType} onChange={v => setQ({ ...q, propType: v })} options={[
          "Flat / Apartment", "House", "Studio", "HMO / Shared House",
          "Office", "Restaurant / Café", "Retail / Shop", "School / College",
          "University", "Hospital / Clinic", "Care Home", "Gym / Leisure Centre",
          "Hotel", "Warehouse / Industrial", "Church / Place of Worship",
          "Community Centre", "Construction Site", "Government Building",
          "Airport / Transport Hub", "Other"
        ]} />
        {!commercial ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Sel label="Bedrooms" value={q.beds} onChange={v => setQ({ ...q, beds: v })} options={["1", "2", "3", "4", "5", "6+"]} />
            <Sel label="Bathrooms" value={q.baths} onChange={v => setQ({ ...q, baths: v })} options={["1", "2", "3", "4+"]} />
          </div>
        ) : <Sel label="Floors" value={q.floors} onChange={v => setQ({ ...q, floors: v })} options={["1", "2", "3", "4", "5", "6+"]} />}
        <Sel label="Type of Clean" value={q.cleanType} onChange={v => setQ({ ...q, cleanType: v })} options={[
          "Deep Clean", "Regular Clean", "End of Tenancy / Move-out",
          "Move-in Clean", "Builder's / Post-Construction Clean",
          "One-off Clean", "Spring Clean", "Communal Area Clean",
          "Emergency Clean", "Specialist Clean"
        ]} />
        <Sel label="Frequency" value={q.frequency} onChange={v => setQ({ ...q, frequency: v })} options={["One-off", "Weekly", "Fortnightly", "Monthly"]} />
        <Inp label="Preferred Date" type="date" value={q.date} onChange={v => setQ({ ...q, date: v })} />
        <Btn full onClick={() => setStep(2)}>Next: Extras →</Btn>
      </Card>}

      {step === 2 && <Card>
        <SecTitle>Additional Services</SecTitle>
        {[{ k: "oven", l: "🍳 Oven & Hob Clean", p: "£70" }, { k: "carpet", l: "🧺 Carpet Cleaning", p: "£42/room" }, { k: "windows", l: "🪟 Window Cleaning", p: "from £30" }, { k: "communal", l: "🏢 Communal Areas", p: "£120" }].map(({ k, l, p }) => (
          <div key={k} onClick={() => setQ({ ...q, [k]: !q[k] })}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 13px", borderRadius: 10, border: `1.5px solid ${q[k] ? T.gold : T.light}`, background: q[k] ? T.gold + "18" : T.white, marginBottom: 8, cursor: "pointer" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: T.navy }}>{l}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: T.muted }}>{p}</span>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: q[k] ? T.gold : T.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: q[k] ? T.navy : T.muted }}>{q[k] ? "✓" : ""}</div>
            </div>
          </div>
        ))}
        {q.carpet && <Sel label="Carpet Rooms" value={q.carpetRooms} onChange={v => setQ({ ...q, carpetRooms: v })} options={["1", "2", "3", "4", "5"]} />}
        {q.windows && <Sel label="Window Type" value={q.windowsType} onChange={v => setQ({ ...q, windowsType: v })} options={["Internal only", "External only", "Internal & External"]} />}
        <Inp label="Notes" value={q.notes} onChange={v => setQ({ ...q, notes: v })} placeholder="Special requirements..." />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
          <Btn onClick={calc} style={{ flex: 1 }}>Calculate →</Btn>
        </div>
      </Card>}

      {step === 3 && quote && <Card>
        {quote.assessment ? (
          <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
            <h3 style={{ color: T.navy, marginBottom: 8 }}>Price on Assessment</h3>
            <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              {commercial ? "Commercial cleaning" : "Post-construction, emergency and specialist cleaning"} is priced after a site assessment. We'll visit the property, assess the scope of work and provide a tailored quote.
            </p>
            <div style={{ background: T.cream, borderRadius: 10, padding: 14, marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 13, color: T.navy, fontWeight: 700, marginBottom: 8 }}>To arrange a site assessment:</div>
              <div style={{ fontSize: 13, color: T.muted }}>📞 Call / WhatsApp: 07472 539 762</div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>✉️ office@blueowlcleanings.co.uk</div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <Btn variant="ghost" onClick={() => setStep(2)}>← Back</Btn>
              <Btn variant="gold" onClick={save}>Save as Enquiry</Btn>
            </div>
          </div>
        ) : (
          <>
            <SecTitle>Quote Summary</SecTitle>
            <div style={{ background: T.cream, borderRadius: 10, padding: 14, marginBottom: 14 }}>
              {quote.breakdown?.map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < quote.breakdown.length - 1 ? `1px solid ${T.light}` : "none", opacity: b.note ? 0.6 : 1 }}>
                  <span style={{ fontSize: b.note ? 11 : 13, color: T.navy, fontStyle: b.note ? "italic" : "normal" }}>{b.item}</span>
                  {!b.note && <span style={{ fontSize: 13, fontWeight: 700, color: b.price < 0 ? T.green : T.navy }}>£{b.price}</span>}
                </div>
              ))}
            </div>
            <div style={{ background: T.navy, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: T.white, fontWeight: 700 }}>Total</span>
                <span style={{ color: T.gold, fontSize: 28, fontWeight: 800 }}>£{quote.total}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>50% Deposit to confirm</span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700 }}>£{quote.deposit}</span>
              </div>
            </div>
            <div style={{ background: T.gold + "18", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: T.navy, fontWeight: 600 }}>💡 London mid-market rate — competitive and fair for a fully insured, company-registered service.</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setStep(2)}>← Adjust</Btn>
              <Btn variant="gold" onClick={save} style={{ flex: 1 }}>Save & Create Job</Btn>
            </div>
          </>
        )}
      </Card>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════════════════
function Invoices({ invoices, setInvoices, clients, addNotification }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: clients[0]?.id || "", amount: "", deposit: "0", status: "Unpaid", issued: new Date().toISOString().split("T")[0], due: "" });
  const [editing, setEditing] = useState(null);
  const total = invoices.reduce((s, i) => s + i.amount, 0);
  const paid = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);

  const save = () => {
    if (!form.amount) return;
    const d = { ...form, amount: Number(form.amount), deposit: Number(form.deposit), clientId: form.clientId };
    if (editing) setInvoices(invoices.map(i => i.id === editing ? { ...d, id: editing } : i));
    else setInvoices([...invoices, { ...d, id: generateId() }]);
    setShowForm(false); setEditing(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ color: T.navy, margin: 0, fontSize: 20, fontWeight: 800 }}>Invoices</h2>
        <Btn onClick={() => { setShowForm(!showForm); setEditing(null); }}>+ Add</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[["Total", total, T.navy], ["Paid", paid, T.green], ["Owed", total - paid, T.gold]].map(([l, v, c]) => (
          <Card key={l} style={{ textAlign: "center", padding: 12 }}><div style={{ fontSize: 16, fontWeight: 800, color: c }}>£{v.toLocaleString()}</div><div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" }}>{l}</div></Card>
        ))}
      </div>
      {showForm && <Card style={{ marginBottom: 14, borderLeft: `4px solid ${T.gold}` }}>
        <SecTitle>{editing ? "Edit Invoice" : "New Invoice"}</SecTitle>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.navy, marginBottom: 3, textTransform: "uppercase", letterSpacing: 1 }}>Client</label>
          <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} style={{ width: "100%", border: `1.5px solid ${T.light}`, borderRadius: 9, padding: "10px 13px", fontSize: 14, fontFamily: "inherit", color: T.navy, background: T.cream, outline: "none", boxSizing: "border-box" }}>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inp label="Amount £" type="number" value={form.amount} onChange={v => setForm({ ...form, amount: v })} />
          <Inp label="Deposit £" type="number" value={form.deposit} onChange={v => setForm({ ...form, deposit: v })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inp label="Issued" type="date" value={form.issued} onChange={v => setForm({ ...form, issued: v })} />
          <Inp label="Due" type="date" value={form.due} onChange={v => setForm({ ...form, due: v })} />
        </div>
        <Sel label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={["Unpaid", "Deposit Paid", "Paid", "Overdue"]} />
        <div style={{ display: "flex", gap: 8 }}><Btn onClick={save}>Save</Btn><Btn variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Btn></div>
      </Card>}
      {invoices.map((inv, idx) => {
        const client = clients.find(c => c.id === inv.clientId);
        return (
          <Card key={inv.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div><div style={{ fontWeight: 800, fontSize: 13, color: T.navy }}>INV-{String(idx + 1).padStart(3, "0")} · {client?.name}</div><div style={{ fontSize: 12, color: T.muted }}>Due: {inv.due || "TBC"}{inv.deposit > 0 ? ` · Deposit: £${inv.deposit}` : ""}</div></div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                <Badge status={inv.status} />
                <span style={{ fontSize: 15, fontWeight: 800, color: T.gold }}>£{inv.amount}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {inv.status !== "Paid" && <Btn small variant="gold" onClick={() => { setInvoices(invoices.map(i => i.id === inv.id ? { ...i, status: "Paid" } : i)); addNotification(`Payment received: £${inv.amount}`); }}>Paid</Btn>}
                  <Btn small variant="ghost" onClick={() => { setForm({ ...inv, amount: String(inv.amount), deposit: String(inv.deposit) }); setEditing(inv.id); setShowForm(true); }}>Edit</Btn>
                  <Btn small variant="danger" onClick={() => setInvoices(invoices.filter(i => i.id !== inv.id))}>✕</Btn>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STAFF
// ═══════════════════════════════════════════════════════════
function StaffMgmt({ staff, setStaff, jobs }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "Cleaner", phone: "", email: "", status: "Active" });
  const [editing, setEditing] = useState(null);
  const save = () => { if (!form.name) return; if (editing) setStaff(staff.map(s => s.id === editing ? { ...form, id: editing } : s)); else setStaff([...staff, { ...form, id: generateId() }]); setShowForm(false); setEditing(null); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ color: T.navy, margin: 0, fontSize: 20, fontWeight: 800 }}>Staff ({staff.length})</h2>
        <Btn onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: "", role: "Cleaner", phone: "", email: "", status: "Active" }); }}>+ Add</Btn>
      </div>
      {showForm && <Card style={{ marginBottom: 14, borderLeft: `4px solid ${T.gold}` }}>
        <SecTitle>{editing ? "Edit" : "New Staff Member"}</SecTitle>
        <Inp label="Name *" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Sarah James" />
        <Sel label="Role" value={form.role} onChange={v => setForm({ ...form, role: v })} options={["Director", "Manager", "Senior Cleaner", "Cleaner", "Trainee"]} />
        <Inp label="Phone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
        <Inp label="Email" value={form.email} onChange={v => setForm({ ...form, email: v })} />
        <Sel label="Status" value={form.status} onChange={v => setForm({ ...form, status: v })} options={["Active", "Inactive"]} />
        <div style={{ display: "flex", gap: 8 }}><Btn onClick={save}>Save</Btn><Btn variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Btn></div>
      </Card>}
      {staff.map(s => {
        const assigned = jobs.filter(j => j.staffIds?.includes(s.id)).length;
        return (
          <Card key={s.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", color: T.gold, fontWeight: 800, fontSize: 15 }}>{s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                <div><div style={{ fontWeight: 800, fontSize: 14, color: T.navy }}>{s.name}</div><div style={{ fontSize: 12, color: T.muted }}>{s.role} · {assigned} job{assigned !== 1 ? "s" : ""}</div><div style={{ fontSize: 12, color: T.muted }}>{s.phone}</div></div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                <Badge status={s.status} />
                <div style={{ display: "flex", gap: 4 }}>
                  <Btn small variant="ghost" onClick={() => { setForm(s); setEditing(s.id); setShowForm(true); }}>Edit</Btn>
                  <Btn small variant="danger" onClick={() => setStaff(staff.filter(x => x.id !== s.id))}>✕</Btn>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════
function Expenses({ expenses, setExpenses }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ category: "Supplies", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
  const cats = ["All", "Supplies", "Equipment", "Transport", "Insurance", "Marketing", "Staff", "Other"];
  const filtered = filter === "All" ? expenses : expenses.filter(e => e.category === filter);
  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const save = () => { if (!form.description || !form.amount) return; setExpenses([...expenses, { ...form, id: generateId(), amount: Number(form.amount) }]); setForm({ category: "Supplies", description: "", amount: "", date: new Date().toISOString().split("T")[0] }); setShowForm(false); };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ color: T.navy, margin: 0, fontSize: 20, fontWeight: 800 }}>Expenses</h2>
        <Btn onClick={() => setShowForm(!showForm)}>+ Add</Btn>
      </div>
      <Card style={{ textAlign: "center", marginBottom: 14, padding: 14 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: T.red }}>£{total.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase" }}>{filter === "All" ? "Total Expenses" : `${filter}`}</div>
      </Card>
      {showForm && <Card style={{ marginBottom: 14, borderLeft: `4px solid ${T.gold}` }}>
        <SecTitle>New Expense</SecTitle>
        <Sel label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} options={cats.slice(1)} />
        <Inp label="Description *" value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="e.g. Cleaning supplies" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inp label="Amount £ *" type="number" value={form.amount} onChange={v => setForm({ ...form, amount: v })} />
          <Inp label="Date" type="date" value={form.date} onChange={v => setForm({ ...form, date: v })} />
        </div>
        <div style={{ display: "flex", gap: 8 }}><Btn onClick={save}>Save</Btn><Btn variant="ghost" onClick={() => setShowForm(false)}>Cancel</Btn></div>
      </Card>}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}>
        {cats.map(c => <button key={c} onClick={() => setFilter(c)} style={{ border: `1.5px solid ${filter === c ? T.navy : T.light}`, background: filter === c ? T.navy : T.white, color: filter === c ? T.white : T.muted, borderRadius: 20, padding: "4px 11px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>)}
      </div>
      {filtered.map(e => (
        <Card key={e.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{e.description}</div><div style={{ fontSize: 11, color: T.muted }}>{e.category} · {e.date}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.red }}>-£{e.amount}</span>
              <Btn small variant="danger" onClick={() => setExpenses(expenses.filter(x => x.id !== e.id))}>✕</Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REPORTING
// ═══════════════════════════════════════════════════════════
function Reporting({ jobs, clients, invoices, expenses }) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRev = months.map((_, i) => {
    const key = `2026-${String(i + 1).padStart(2, "0")}`;
    return invoices.filter(inv => inv.status === "Paid" && inv.issued?.startsWith(key)).reduce((s, inv) => s + inv.amount, 0);
  });
  const totalRev = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalOwed = invoices.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const maxM = Math.max(...monthlyRev, 1);
  const topClients = clients.map(c => ({ ...c, rev: invoices.filter(i => i.clientId === c.id && i.status === "Paid").reduce((s, i) => s + i.amount, 0), jobs: jobs.filter(j => j.clientId === c.id).length })).sort((a, b) => b.rev - a.rev).slice(0, 5);
  const expCats = {}; expenses.forEach(e => { expCats[e.category] = (expCats[e.category] || 0) + Number(e.amount); });
  const statusCount = s => jobs.filter(j => j.status === s).length;

  return (
    <div>
      <h2 style={{ color: T.navy, margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>Reports & Analytics</h2>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 16 }}>Year to date — 2026</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[["Revenue", `£${totalRev.toLocaleString()}`, T.green], ["Outstanding", `£${totalOwed.toLocaleString()}`, T.gold], ["Expenses", `£${totalExp.toLocaleString()}`, T.red], ["Net Profit", `£${(totalRev - totalExp).toLocaleString()}`, (totalRev - totalExp) >= 0 ? T.green : T.red]].map(([l, v, c]) => (
          <Card key={l} style={{ textAlign: "center", padding: 14 }}><div style={{ fontSize: 19, fontWeight: 800, color: c }}>{v}</div><div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" }}>{l}</div></Card>
        ))}
      </div>
      <Card style={{ marginBottom: 14 }}>
        <SecTitle>Monthly Revenue — 2026</SecTitle>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 110, padding: "0 2px" }}>
          {monthlyRev.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              {v > 0 && <div style={{ fontSize: 8, color: T.muted, fontWeight: 600 }}>£{v}</div>}
              <div style={{ width: "100%", background: i === new Date().getMonth() ? T.gold : T.navy + "55", borderRadius: "3px 3px 0 0", height: `${Math.max((v / maxM) * 78, v > 0 ? 4 : 0)}px`, minHeight: v > 0 ? 4 : 0 }} />
              <div style={{ fontSize: 8, color: T.muted, fontWeight: 600 }}>{months[i]}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{ marginBottom: 14 }}>
        <SecTitle>Job Status</SecTitle>
        {["Confirmed", "Pending", "Quoted", "Completed", "Cancelled"].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Badge status={s} />
            <div style={{ flex: 1, height: 6, background: T.light, borderRadius: 3 }}><div style={{ height: 6, background: T.navy, borderRadius: 3, width: jobs.length ? `${(statusCount(s) / jobs.length) * 100}%` : "0%" }} /></div>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.navy, minWidth: 20 }}>{statusCount(s)}</span>
          </div>
        ))}
      </Card>
      <Card style={{ marginBottom: 14 }}>
        <SecTitle>Top Clients by Revenue</SecTitle>
        {topClients.map((c, i) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < topClients.length - 1 ? `1px solid ${T.light}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.navy, color: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11 }}>{i + 1}</div>
              <div><div style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{c.name}</div><div style={{ fontSize: 11, color: T.muted }}>{c.jobs} job{c.jobs !== 1 ? "s" : ""}</div></div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.gold }}>£{c.rev.toLocaleString()}</span>
          </div>
        ))}
      </Card>
      <Card>
        <SecTitle>Expense Breakdown</SecTitle>
        {Object.entries(expCats).map(([cat, amt]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: T.navy, fontWeight: 600, minWidth: 90 }}>{cat}</span>
            <div style={{ flex: 1, height: 6, background: T.light, borderRadius: 3 }}><div style={{ height: 6, background: T.red, borderRadius: 3, width: `${(amt / totalExp) * 100}%` }} /></div>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.red }}>£{amt}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════
function Reviews({ jobs, clients, biz }) {
  const [sel, setSel] = useState(null);
  const [copied, setCopied] = useState(false);
  const completed = jobs.filter(j => j.status === "Completed");
  const msg = (j) => {
    const c = clients.find(x => x.id === j.clientId);
    return `Hi ${c?.name?.split(" ")[0] || "there"} 👋\n\nThank you so much for choosing ${biz.name} for your ${j.title.toLowerCase()}. It was a pleasure working for you!\n\nWould you mind leaving us a quick Google review? It makes a huge difference to a small business like ours 🙏\n\n👉 https://g.page/r/YOUR-GOOGLE-LINK\n\nThank you in advance!\n\nOla — ${biz.name} 🦉\n${biz.phone}`;
  };
  return (
    <div>
      <h2 style={{ color: T.navy, margin: "0 0 4px", fontSize: 20, fontWeight: 800 }}>Review Requests</h2>
      <p style={{ color: T.muted, fontSize: 13, marginBottom: 16 }}>Auto-generate WhatsApp review requests after completed jobs.</p>
      {completed.length === 0 && <Card style={{ textAlign: "center", padding: 30 }}><div style={{ fontSize: 36, marginBottom: 10 }}>⭐</div><p style={{ color: T.muted }}>Mark jobs as Completed to generate review requests.</p></Card>}
      {completed.map(j => {
        const client = clients.find(c => c.id === j.clientId);
        const isOpen = sel === j.id;
        const m = msg(j);
        return (
          <Card key={j.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isOpen ? 12 : 0 }}>
              <div><div style={{ fontWeight: 700, fontSize: 14, color: T.navy }}>{client?.name}</div><div style={{ fontSize: 12, color: T.muted }}>{j.title} · {j.date}</div></div>
              <Btn small variant="gold" onClick={() => setSel(isOpen ? null : j.id)}>{isOpen ? "Hide" : "Generate"}</Btn>
            </div>
            {isOpen && <>
              <div style={{ background: T.cream, borderRadius: 10, padding: 14, fontSize: 13, color: T.navy, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 10, border: `1px solid ${T.light}` }}>{m}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn small variant="gold" onClick={() => { navigator.clipboard?.writeText(m); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? "Copied ✓" : "Copy"}</Btn>
                <a href={`https://wa.me/${client?.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"><Btn small variant="green">WhatsApp</Btn></a>
              </div>
            </>}
          </Card>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
function Dashboard({ biz, clients, jobs, invoices, expenses, notifications, setTab }) {
  const paid = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const owed = invoices.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const exp = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const upcoming = jobs.filter(j => ["Confirmed", "Pending"].includes(j.status)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const alerts = jobs.filter(j => { const d = (new Date(j.date) - new Date()) / 86400000; return d >= 0 && d <= 3 && !["Completed", "Cancelled"].includes(j.status); }).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ color: T.navy, fontSize: 20, fontWeight: 800, margin: 0 }}>{greeting}, {biz.name?.split(" ")[0]} 👋</h2>
            <p style={{ color: T.muted, fontSize: 13, margin: "3px 0 0" }}>{biz.name}</p>
          </div>
          <Badge status={biz.plan} />
        </div>
      </div>

      {alerts > 0 && (
        <div onClick={() => setTab("jobs")} style={{ background: T.gold + "22", border: `1.5px solid ${T.gold}`, borderRadius: 12, padding: "11px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.navy }}>{alerts} job{alerts > 1 ? "s" : ""} in the next 3 days</div>
            <div style={{ fontSize: 11, color: T.muted }}>Tap to view</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[{ l: "Clients", v: clients.length, i: "👥", t: "clients" }, { l: "Active Jobs", v: jobs.filter(j => !["Completed", "Cancelled"].includes(j.status)).length, i: "🧹", t: "jobs" }, { l: "Outstanding", v: `£${owed.toLocaleString()}`, i: "💰", t: "invoices" }, { l: "Net Profit", v: `£${(paid - exp).toLocaleString()}`, i: "📈", t: "reports" }].map(s => (
          <Card key={s.l} style={{ cursor: "pointer", textAlign: "center", padding: 14 }} onClick={() => setTab(s.t)}>
            <div style={{ fontSize: 20, marginBottom: 3 }}>{s.i}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>{s.v}</div>
            <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.l}</div>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ color: T.navy, margin: 0, fontSize: 14, fontWeight: 800 }}>Upcoming Jobs</h3>
          <Btn small variant="ghost" onClick={() => setTab("jobs")}>View all</Btn>
        </div>
        {upcoming.length === 0 && <p style={{ color: T.muted, fontSize: 13 }}>No upcoming jobs.</p>}
        {upcoming.map(j => {
          const client = clients.find(c => c.id === j.clientId);
          const diff = Math.ceil((new Date(j.date) - new Date()) / 86400000);
          return (
            <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.light}` }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{j.title}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{client?.name} · {j.date} {j.time}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                <Badge status={j.status} />
                <span style={{ fontSize: 11, color: diff <= 1 ? T.red : T.gold, fontWeight: 700 }}>{diff === 0 ? "Today!" : diff === 1 ? "Tomorrow" : `${diff}d`}</span>
              </div>
            </div>
          );
        })}
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <h3 style={{ color: T.navy, margin: "0 0 10px", fontSize: 14, fontWeight: 800 }}>Financials</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Revenue", paid, T.green], ["Expenses", exp, T.red], ["Profit", paid - exp, paid - exp >= 0 ? T.green : T.red]].map(([l, v, c]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: c }}>£{v.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: T.muted, textTransform: "uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ background: T.navy }}>
        <div style={{ color: T.gold, fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["💷 New Quote", "quote"], ["🧹 Add Job", "jobs"], ["👥 Add Client", "clients"], ["📊 View Reports", "reports"]].map(([l, t]) => (
            <button key={t} onClick={() => setTab(t)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px", cursor: "pointer", color: T.white, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>{l}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════
function NotifPanel({ notifications, jobs, clients, onDismiss, onClose }) {
  const upcoming = jobs.filter(j => { const d = (new Date(j.date) - new Date()) / 86400000; return d >= 0 && d <= 3 && !["Completed", "Cancelled"].includes(j.status); });
  return (
    <Modal title={`Notifications (${notifications.length + upcoming.length})`} onClose={onClose}>
      {upcoming.map(j => {
        const client = clients.find(c => c.id === j.clientId);
        const diff = Math.ceil((new Date(j.date) - new Date()) / 86400000);
        return (
          <Card key={j.id} style={{ marginBottom: 10, borderLeft: `4px solid ${T.gold}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 2 }}>🔔 Upcoming Job</div>
            <div style={{ fontSize: 13, color: T.navy }}>{j.title}</div>
            <div style={{ fontSize: 12, color: T.muted }}>{client?.name} · {j.date} at {j.time}</div>
            <div style={{ fontSize: 12, color: T.gold, fontWeight: 700, marginTop: 4 }}>{diff === 0 ? "Today!" : diff === 1 ? "Tomorrow" : `In ${diff} days`}</div>
          </Card>
        );
      })}
      {notifications.map((n, i) => (
        <Card key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div><div style={{ fontSize: 13, color: T.navy, fontWeight: 600 }}>{n.message}</div><div style={{ fontSize: 11, color: T.muted }}>{n.time}</div></div>
            <button onClick={() => onDismiss(i)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>
        </Card>
      ))}
      {!notifications.length && !upcoming.length && <p style={{ color: T.muted, textAlign: "center", padding: 20 }}>All clear — no notifications.</p>}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════
function Pricing({ biz, onUpgrade, onLogout, handleCheckout }) {
  const plans = [
    {
      name: "Pro",
      price: "£19.99",
      period: "/month",
      description: "Perfect for small teams",
      features: [
        "Unlimited clients & staff",
        "Quote generator",
        "Expense tracker",
        "Reporting & analytics",
        "Client portal",
        "GPS check-in"
      ],
      priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
      recommended: false
    },
    {
      name: "Business",
      price: "£39.99",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Everything in Pro",
        "Multi-location support",
        "Custom branding",
        "Priority support",
        "API access",
        "Advanced reporting"
      ],
      priceId: import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID,
      recommended: true
    }
  ];

  return (
    <div style={{ background: T.cream, minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {/* TOP BAR */}
      <div style={{ background: T.navy, padding: "13px 16px 11px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: T.gold, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🦉</div>
            <div>
              <div style={{ color: T.white, fontWeight: 800, fontSize: 13, lineHeight: 1.2 }}>CleanManager Pro</div>
              <div style={{ color: T.gold, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase" }}>Choose a Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, padding: "20px 16px 80px", overflow: "auto" }}>
        <h2 style={{ color: T.navy, margin: "0 0 8px", fontSize: 24, fontWeight: 800, textAlign: "center" }}>Upgrade Your Plan</h2>
        <p style={{ color: T.muted, textAlign: "center", marginBottom: 24, fontSize: 14 }}>Unlock powerful features to grow your cleaning business</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 24 }}>
          {plans.map((plan) => (
            <Card key={plan.name} style={{ position: "relative", border: plan.recommended ? `2px solid ${T.gold}` : "none", paddingTop: plan.recommended ? 28 : 16 }}>
              {plan.recommended && (
                <div style={{ position: "absolute", top: -12, left: 16, background: T.gold, color: T.navy, padding: "4px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  Recommended
                </div>
              )}
              <h3 style={{ color: T.navy, margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>{plan.name}</h3>
              <p style={{ color: T.muted, margin: "0 0 12px", fontSize: 12 }}>{plan.description}</p>
              
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ color: T.navy, fontSize: 28, fontWeight: 800 }}>{plan.price}</span>
                  <span style={{ color: T.muted, fontSize: 14 }}>{plan.period}</span>
                </div>
              </div>

              <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0 }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{ color: T.navy, fontSize: 13, marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: T.green, marginTop: 2 }}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button onClick={() => handleCheckout(plan.priceId)} style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: plan.recommended ? T.gold : T.blue, 
                color: plan.recommended ? T.navy : T.white, 
                border: "none", 
                borderRadius: 8, 
                fontSize: 14, 
                fontWeight: 700, 
                cursor: "pointer",
                transition: "opacity 0.2s"
              }} onMouseOver={(e) => e.target.style.opacity = "0.9"} onMouseOut={(e) => e.target.style.opacity = "1"}>
                Subscribe Now
              </button>
            </Card>
          ))}
        </div>

        <Card style={{ background: "rgba(107, 63, 160, 0.05)", borderLeft: `3px solid ${T.purple}` }}>
          <div style={{ fontSize: 13, color: T.navy }}>
            <strong style={{ display: "block", marginBottom: 8 }}>💳 First 14 days free</strong>
            <p style={{ margin: 0, color: T.muted, fontSize: 12, lineHeight: 1.6 }}>
              Try either plan risk-free for 14 days. No credit card charges until your trial ends. Cancel anytime.
            </p>
          </div>
        </Card>
      </div>

      {/* BOTTOM BUTTONS */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 480, margin: "0 auto", background: T.cream, padding: "12px 16px", borderTop: `1px solid ${T.light}`, display: "flex", gap: 8 }}>
        <button onClick={onLogout} style={{ flex: 1, padding: "12px 16px", background: "none", border: `1px solid ${T.light}`, borderRadius: 8, color: T.navy, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════
function Settings({ biz, onLogout, handleCheckout, onUpdate }) {
  return (
    <div>
      <h2 style={{ color: T.navy, margin: "0 0 16px", fontSize: 20, fontWeight: 800 }}>Settings</h2>
      <Card style={{ marginBottom: 12 }}>
        <SecTitle>Account</SecTitle>
        <div style={{ fontSize: 14, color: T.navy, marginBottom: 4 }}><strong>{biz.name}</strong></div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 2 }}>✉️ {biz.email}</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 2 }}>📞 {biz.phone}</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>Joined: {biz.createdAt}</div>
        <Badge status={biz.plan} />
        {biz.plan === "free" && !biz.exemptFromSubscription && (
          <button onClick={() => handleCheckout(import.meta.env.VITE_STRIPE_PRO_PRICE_ID)} style={{ width: "100%", padding: "10px 14px", marginTop: 12, background: T.gold, color: T.navy, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            💳 Upgrade Plan
          </button>
        )}
      </Card>
      {biz.isOwner && (
        <Card style={{ marginBottom: 12 }}>
          <SecTitle>Subscription</SecTitle>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={biz.exemptFromSubscription || false} onChange={(e) => onUpdate({ exemptFromSubscription: e.target.checked })} style={{ cursor: "pointer", width: 18, height: 18 }} />
            <span style={{ fontSize: 13, color: T.navy, flex: 1 }}>Skip subscription requirement</span>
          </label>
          <p style={{ fontSize: 11, color: T.muted, margin: "8px 0 0", lineHeight: 1.5, paddingLeft: 28 }}>When enabled, you can use the app without upgrading to a paid plan.</p>
        </Card>
      )}
      <Btn full variant="danger" onClick={onLogout}>Sign Out</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [biz, setBiz] = useState(null);
  const handleCheckout = async (p) => {
    setLoading(true);
    alert('Fetching...');
    try {
      const r = await fetch('https://cleanmanager-pro.vercel.app/api/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ priceId: p })
      });
      alert('Response status: ' + r.status);
      if (!r.ok) {
        const error = await r.json();
        throw new Error(error.error || `HTTP ${r.status}: ${r.statusText}`);
      }
      const { url } = await r.json();
      window.location.replace(url);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [clientPortal, setClientPortal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const dataStr = localStorage.getItem("cleanmanager_data");
    const data = dataStr ? JSON.parse(dataStr) : buildInitialData();

    const search = window.location.search || "";
    if (search.includes("success=true")) {
      const pendingDataStr = localStorage.getItem("pendingBusinessData");
      if (pendingDataStr) {
        try {
          const pendingData = JSON.parse(pendingDataStr);
          const newBiz = { ...pendingData, plan: "pro" };
          const updatedData = {
            ...data,
            businesses: [...data.businesses, newBiz],
            clients: { ...data.clients, [newBiz.id]: [] },
            jobs: { ...data.jobs, [newBiz.id]: [] },
            staff: { ...data.staff, [newBiz.id]: [] },
            invoices: { ...data.invoices, [newBiz.id]: [] },
            expenses: { ...data.expenses, [newBiz.id]: [] },
            notifications: { ...data.notifications, [newBiz.id]: [] }
          };
          setData(updatedData);
          localStorage.setItem("cleanmanager_data", JSON.stringify(updatedData));
          setBiz(newBiz);
          setTab("dashboard");
          localStorage.removeItem("pendingBusinessData");
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (e) {
          console.error("Failed to process pending business:", e);
        }
      }
    } else {
      setData(data);
    }
    setLoading(false);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const update = useCallback((key, val) => {
    setData(prev => {
      if (!prev || !biz) return prev;
      const next = { ...prev, [key]: { ...prev[key], [biz.id]: typeof val === "function" ? val(prev[key]?.[biz.id] || []) : val } };
      setSaving(true);
      persist(next).then(() => setSaving(false));
      return next;
    });
  }, [biz]);

  const updateData = useCallback((newData) => {
    setData(newData);
    persist(newData);
  }, []);

  const bizId = biz?.id;
  const clients = data?.clients?.[bizId] || [];
  const jobs = data?.jobs?.[bizId] || [];
  const invoices = data?.invoices?.[bizId] || [];
  const expenses = data?.expenses?.[bizId] || [];
  const staff = data?.staff?.[bizId] || [];
  const notifications = data?.notifications?.[bizId] || [];

  const setClients = v => update("clients", v);
  const setJobs = v => update("jobs", v);
  const setInvoices = v => update("invoices", v);
  const setExpenses = v => update("expenses", v);
  const setStaff = v => update("staff", v);

  const addNotification = (message) => {
    update("notifications", prev => [...(prev || []), { message, time: new Date().toLocaleTimeString() }]);
    showToast(message);
  };
  const dismissNotification = (i) => update("notifications", prev => prev.filter((_, idx) => idx !== i));

  const handleLogin = (bizObj, newBiz, selectedPlan) => {
    // Force business plan for demo account
    if (bizObj?.email === "office@blueowlcleanings.co.uk") {
      bizObj = { ...bizObj, plan: "business" };
    }
    if (newBiz?.email === "office@blueowlcleanings.co.uk") {
      newBiz = { ...newBiz, plan: "business" };
    }
    
    if (newBiz) {
      const newData = { ...data, businesses: [...data.businesses, newBiz], clients: { ...data.clients, [newBiz.id]: [] }, jobs: { ...data.jobs, [newBiz.id]: [] }, staff: { ...data.staff, [newBiz.id]: [] }, invoices: { ...data.invoices, [newBiz.id]: [] }, expenses: { ...data.expenses, [newBiz.id]: [] }, notifications: { ...data.notifications, [newBiz.id]: [] } };
      setData(newData); persist(newData);
      // For paid plan registrations, trigger Stripe checkout immediately without loading app
      if (newBiz.plan === "pro") {
        handleCheckout(import.meta.env.VITE_STRIPE_PRO_PRICE_ID);
        return;
      } else if (newBiz.plan === "business") {
        handleCheckout(import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID);
        return;
      }
      setBiz(newBiz);
    } else {
      setBiz(bizObj);
    }
    setTab("dashboard");
  };

  const handleLogout = () => { setBiz(null); setTab("dashboard"); setMoreOpen(false); };

  const updateBusiness = (updates) => {
    const updated = { ...biz, ...updates };
    setBiz(updated);
    const newBusinesses = data.businesses.map(b => b.id === biz.id ? updated : b);
    const newData = { ...data, businesses: newBusinesses };
    persist(newData);
  };

  if (loading) return (
    <div style={{ background: T.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🦉</div>
        <div style={{ color: T.white, fontSize: 16, fontWeight: 700 }}>Loading CleanManager Pro...</div>
      </div>
    </div>
  );

  if (processingPayment) return (
    <div style={{ background: T.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🦉</div>
        <div style={{ color: T.white, fontSize: 16, fontWeight: 700 }}>Processing your payment...</div>
      </div>
    </div>
  );

  if (!biz) return <AuthScreen onLogin={handleLogin} data={data} handleCheckout={handleCheckout} />;
  if (biz.isAdmin) return <AdminPanel data={data} onDataChange={updateData} onLogout={handleLogout} />;
  if (clientPortal) return <ClientPortal biz={biz} clients={clients} jobs={jobs} onExit={() => setClientPortal(false)} />;
  if (biz.plan === "free" && !biz.exemptFromSubscription) return <Pricing biz={biz} onLogout={handleLogout} handleCheckout={handleCheckout} />;

  const mainTabs = [{ id: "dashboard", l: "Home", i: "🏠" }, { id: "quote", l: "Quote", i: "💷" }, { id: "jobs", l: "Jobs", i: "🧹" }, { id: "clients", l: "Clients", i: "👥" }, { id: "more", l: "More", i: "⚙️" }];
  const moreTabs = [{ id: "invoices", l: "Invoices", i: "💰" }, { id: "staff", l: "Staff", i: "👷" }, { id: "expenses", l: "Expenses", i: "🧾" }, { id: "reports", l: "Reports", i: "📊" }, { id: "reviews", l: "Reviews", i: "⭐" }, { id: "portal", l: "Client Portal", i: "🔐" }, { id: "settings", l: "Settings", i: "⚙️" }];
  const inMore = moreTabs.some(t => t.id === tab);
  const totalNotifs = notifications.length + jobs.filter(j => { const d = (new Date(j.date) - new Date()) / 86400000; return d >= 0 && d <= 3 && !["Completed", "Cancelled"].includes(j.status); }).length;

  return (
    <div style={{ background: T.cream, minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* TOP BAR */}
      <div style={{ background: T.navy, padding: "13px 16px 11px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: T.gold, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🦉</div>
            <div>
              <div style={{ color: T.white, fontWeight: 800, fontSize: 13, lineHeight: 1.2, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biz.name}</div>
              <div style={{ color: T.gold, fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase" }}>CleanManager Pro</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {saving && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>saving...</span>}
            <button onClick={() => setShowNotif(true)} style={{ position: "relative", background: "none", border: "none", color: T.white, fontSize: 20, cursor: "pointer", padding: 0 }}>
              🔔
              {totalNotifs > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: T.red, color: T.white, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{totalNotifs}</span>}
            </button>
          </div>
        </div>
      </div>

      {showNotif && <NotifPanel notifications={notifications} jobs={jobs} clients={clients} onDismiss={dismissNotification} onClose={() => setShowNotif(false)} />}

      {/* MORE MENU */}
      {moreOpen && (
        <div style={{ position: "fixed", bottom: 62, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: T.white, zIndex: 200, boxShadow: "0 -8px 30px rgba(10,31,68,0.15)", borderRadius: "20px 20px 0 0", padding: "18px 14px 12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {moreTabs.map(t => (
              <button key={t.id} onClick={() => { if (t.id === "portal") { setClientPortal(true); setMoreOpen(false); } else { setTab(t.id); setMoreOpen(false); } }}
                style={{ border: `1.5px solid ${tab === t.id ? T.gold : T.light}`, background: tab === t.id ? T.gold + "22" : T.white, borderRadius: 12, padding: "12px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit" }}>
                <span style={{ fontSize: 20 }}>{t.i}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{t.l}</span>
              </button>
            ))}
          </div>
          <Btn full variant="ghost" onClick={() => setMoreOpen(false)}>Close</Btn>
        </div>
      )}

      {/* CONTENT */}
      <div style={{ flex: 1, padding: "16px 13px 85px", overflowY: "auto" }}>
        {tab === "dashboard" && <Dashboard biz={biz} clients={clients} jobs={jobs} invoices={invoices} expenses={expenses} notifications={notifications} setTab={setTab} />}
        {tab === "quote" && <QuoteGen clients={clients} setJobs={setJobs} setInvoices={setInvoices} addNotification={addNotification} />}
        {tab === "jobs" && <Jobs jobs={jobs} setJobs={setJobs} clients={clients} setClients={setClients} staff={staff} addNotification={addNotification} />}
        {tab === "clients" && <Clients clients={clients} setClients={setClients} />}
        {tab === "invoices" && <Invoices invoices={invoices} setInvoices={setInvoices} clients={clients} addNotification={addNotification} />}
        {tab === "staff" && <StaffMgmt staff={staff} setStaff={setStaff} jobs={jobs} />}
        {tab === "expenses" && <Expenses expenses={expenses} setExpenses={setExpenses} />}
        {tab === "reports" && <Reporting jobs={jobs} clients={clients} invoices={invoices} expenses={expenses} />}
        {tab === "reviews" && <Reviews jobs={jobs} clients={clients} biz={biz} />}
        {tab === "settings" && <Settings biz={biz} onLogout={handleLogout} handleCheckout={handleCheckout} onUpdate={updateBusiness} />}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: T.white, borderTop: `1px solid ${T.light}`, display: "flex", zIndex: 100, boxShadow: "0 -4px 20px rgba(10,31,68,0.08)" }}>
        {mainTabs.map(t => {
          const active = tab === t.id || (t.id === "more" && inMore);
          return (
            <button key={t.id} onClick={() => t.id === "more" ? setMoreOpen(!moreOpen) : (setTab(t.id), setMoreOpen(false))}
              style={{ flex: 1, border: "none", background: "none", padding: "9px 4px 7px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 19 }}>{t.i}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 800 : 500, color: active ? T.navy : T.muted, fontFamily: "inherit" }}>{t.l}</span>
              {active && <div style={{ width: 18, height: 2.5, background: T.gold, borderRadius: 2 }} />}
            </button>
          );
        })}
      </div>
    </div>  
     );
}
