import{useState,useEffect,useRef}from"react";
const SECTORS=[{label:"Restaurants",icon:"🍽️"},{label:"Hospitals",icon:"🏥"},{label:"Care Homes",icon:"🏠"},{label:"Warehouses",icon:"🏭"},{label:"Supermarkets",icon:"🛒"},{label:"Cafes",icon:"☕"},{label:"Event Halls",icon:"🎪"},{label:"Banks",icon:"🏦"},{label:"Corporates",icon:"🏢"},{label:"Offices",icon:"💼"},{label:"Residential",icon:"🏘️"},{label:"Hotels",icon:"🏨"},{label:"Pubs",icon:"🍺"},{label:"Cinemas",icon:"🎬"},{label:"Stadiums",icon:"🏟️"},{label:"Schools",icon:"🏫"},{label:"Universities",icon:"🎓"},{label:"Gyms",icon:"💪"},{label:"Shopping Centres",icon:"🛍️"},{label:"Law Firms",icon:"⚖️"},{label:"Accounting Firms",icon:"📊"}];
const SC={sent:"#4a9eff",opened:"#f5c842",replied:"#3ddc84"};
const SL={sent:"Sent",opened:"Opened",replied:"Replied"};
const T={gold:"#C9A84C",blue:"#4a9eff",green:"#3ddc84",yellow:"#f5c842",text:"#e8e8e8",muted:"#666"};
function Dot({on}){return<span style={{width:9,height:9,borderRadius:"50%",background:on?T.green:"#444",display:"inline-block",animation:on?"pulse 1.4s ease-out infinite":"none",boxShadow:on?"0 0 0 0 rgba(61,220,132,0.6)":"none"}}/>}
function Card({label,value,accent}){return<div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"14px 16px",flex:1}}><div style={{fontSize:24,fontWeight:700,color:accent,fontFamily:"monospace"}}>{value}</div><div style={{fontSize:10,color:T.muted,marginTop:2,textTransform:"uppercase",letterSpacing:1}}>{label}</div></div>}
const agentCache = {};
export default function OutreachAgent({bizId="blueowl",bizName="My Business",bizEmail="ola@blueowlcleanings.com"}){
const[on,setOn]=useState(false);
const[stats,setStats]=useState({total:0,active:0,sent:0,opens:0,replies:0});
const[leads,setLeads]=useState([]);
const[loading,setLoading]=useState(true);
const[tab,setTab]=useState("Activity");
const[generating,setGenerating]=useState(false);
const[preview,setPreview]=useState("");
const[target,setTarget]=useState("Restaurant");
const[sectors,setSectors]=useState(SECTORS.map(s=>s.label));const[page,setPage]=useState(20);
const ref=useRef(null);

const fetchStats=async(force=false)=>{
  const now = Date.now();
  const cache = agentCache[bizId];
  if (!force && cache && (now - cache.time) < 300000) {
    const d = cache.data;
    setStats({total:d.total||0,active:d.active||0,sent:d.total||0,opens:0,replies:0});
    setLeads([...d.leads].sort((a,b)=>(b.lastSentAt||0)-(a.lastSentAt||0)));
    setLoading(false);
    return;
  }
  setLoading(true);
  console.log("Agent fetching for bizId:", bizId);
  try{
    const r=await fetch("/api/sequence-engine",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"stats",business_id:bizId})});
    const d=await r.json();
    const ls=d.leads||[];
    const sent=ls.filter(l=>l.touchIndex>=1).length;
    const opens=ls.filter(l=>l.opens>0).length;
    const replies=ls.filter(l=>l.replies>0).length;
    setStats({total:d.total||0,active:d.active||0,sent:d.total||0,opens,replies});
    agentCache[bizId] = {data: {...d, leads: ls}, time: Date.now()};
    setLeads([...ls].sort((a,b)=>(b.lastSentAt||0)-(a.lastSentAt||0)));
    setLoading(false);
  }catch(e){setLoading(false);}
};

useEffect(()=>{delete agentCache[bizId];fetchStats();const i=setInterval(fetchStats,30000);return()=>clearInterval(i);},[bizId]);

useEffect(()=>{
  if(on){ref.current=setInterval(fetchStats,15000);}
  else{clearInterval(ref.current);}
  return()=>clearInterval(ref.current);
},[on]);

const toggle=l=>setSectors(p=>p.includes(l)?p.filter(s=>s!==l):[...p,l]);

const generate=async()=>{
  setGenerating(true);setPreview("");
  try{
    const r=await fetch("/api/generate-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sector:target})});
    const d=await r.json();
    setPreview(d.text||"Error.");
  }catch(e){setPreview("Network error.");}
  setGenerating(false);
};

const sendTest=async()=>{
  const r=await fetch("/api/send-emails",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to:bizEmail,subject:"Test - Outreach Agent",body:preview||"Test email"})});
  const d=await r.json();
  alert(d.success?"Email sent!":"Error sending email.");
};

const touchLabel=(idx)=>{
  if(idx===0)return{label:"Cold",color:T.blue};
  if(idx===1)return{label:"Follow-up",color:T.yellow};
  if(idx===2)return{label:"Value",color:T.green};
  return{label:"Final",color:"#e74c3c"};
};

return(
<div style={{background:"#0a0a0f",minHeight:"100vh",fontFamily:"system-ui,sans-serif",color:T.text,maxWidth:430,margin:"0 auto"}}>
<style>{`@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(61,220,132,0.6)}70%{box-shadow:0 0 0 10px rgba(61,220,132,0)}100%{box-shadow:0 0 0 0 rgba(61,220,132,0)}}`}</style>
<div style={{position:"relative",zIndex:1,paddingBottom:100}}>

<div style={{padding:"52px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{fontSize:28}}>🦉</div>
<div><div style={{fontSize:10,color:T.gold,textTransform:"uppercase",letterSpacing:2,fontWeight:700}}>{bizName}</div><div style={{fontSize:19,fontWeight:700}}>Outreach Agent</div></div>
</div>
<div style={{fontSize:10,color:T.green,background:"rgba(61,220,132,0.08)",border:"1px solid rgba(61,220,132,0.3)",borderRadius:100,padding:"6px 12px",display:"flex",alignItems:"center",gap:6,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>
<Dot on={true}/>Running
</div>
</div>

<div style={{padding:"20px 20px 0",display:"flex",gap:10}}>
<Card label="Total Leads" value={stats.total.toLocaleString()} accent={T.blue}/>
<Card label="Emailed" value={stats.sent.toLocaleString()} accent={T.yellow}/>
<Card label="Replies" value={stats.replies} accent={T.green}/>
</div>

<div style={{padding:"10px 20px 0",display:"flex",gap:10}}>
<div style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:12,color:T.muted}}>Opens</span>
<span style={{fontSize:14,fontWeight:700,color:T.yellow,fontFamily:"monospace"}}>{stats.opens}</span>
</div>
<div style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:12,color:T.muted}}>Active</span>
<span style={{fontSize:14,fontWeight:700,color:T.green,fontFamily:"monospace"}}>{stats.active}</span>
</div>
</div>

<div style={{padding:"14px 20px 0",display:"flex",gap:6}}>
{["Activity","Preview","Sectors"].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"8px 0",background:tab===t?"rgba(74,158,255,0.12)":"transparent",border:"1px solid "+(tab===t?"rgba(74,158,255,0.4)":"rgba(255,255,255,0.07)"),borderRadius:10,color:tab===t?T.blue:"#555",fontSize:10,fontWeight:600,cursor:"pointer",textTransform:"uppercase",letterSpacing:0.8}}>{t}</button>))}
</div>

<div style={{padding:"16px 20px 0"}}>
{tab==="Activity"&&<div>
<div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span>Live Feed — {leads.length} of {stats.total} leads</span>
<button onClick={()=>fetchStats(true)} style={{fontSize:10,color:T.blue,background:"none",border:"none",cursor:"pointer"}}>↻ Refresh</button>
</div>
{loading&&leads.length===0&&<div style={{textAlign:"center",padding:20,color:T.muted,fontSize:12}}>Fetching live data... 🦉</div>}
{leads.slice(0,page).map((lead,i)=>{
const tl=touchLabel(lead.touchIndex);
const lastSent=lead.lastSentAt?new Date(lead.lastSentAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"Not sent";
return(
<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
<div style={{width:36,height:36,borderRadius:10,background:"rgba(74,158,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
{SECTORS.find(s=>s.label===lead.sector)?.icon||"📧"}
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:13,color:T.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lead.name}</div>
<div style={{fontSize:10,color:"#444",marginTop:2}}>{lead.sector} · {lastSent}</div>
</div>
<div style={{fontSize:10,fontWeight:700,color:tl.color,background:tl.color+"18",borderRadius:100,padding:"3px 8px",whiteSpace:"nowrap",flexShrink:0}}>{tl.label}</div>
</div>
);
})}
</div>}

{leads.length>page&&<button onClick={()=>setPage(p=>p+20)} style={{width:"100%",padding:"12px",background:"rgba(74,158,255,0.08)",border:"1px solid rgba(74,158,255,0.2)",borderRadius:12,color:"#4a9eff",fontSize:13,fontWeight:600,cursor:"pointer",marginTop:12}}>Load more ({leads.length-page} remaining)</button>}{tab==="Preview"&&<div>
<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
{["Restaurant","Hospital","Care Home","Office","Warehouse","Cafe","Corporate","Hotel","School","Gym","Law Firm"].map(s=>(<button key={s} onClick={()=>setTarget(s)} style={{padding:"6px 12px",background:target===s?"rgba(74,158,255,0.15)":"rgba(255,255,255,0.04)",border:"1px solid "+(target===s?"rgba(74,158,255,0.4)":"rgba(255,255,255,0.08)"),borderRadius:100,color:target===s?T.blue:"#555",fontSize:11,cursor:"pointer"}}>{s}</button>))}
</div>
<button onClick={generate} disabled={generating} style={{width:"100%",padding:"12px",background:"rgba(74,158,255,0.12)",border:"1px solid rgba(74,158,255,0.3)",borderRadius:12,color:T.blue,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:10}}>{generating?"Generating...":"Generate Email Preview"}</button>
<button onClick={sendTest} disabled={!preview} style={{width:"100%",padding:"12px",background:"rgba(61,220,132,0.12)",border:"1px solid rgba(61,220,132,0.3)",borderRadius:12,color:T.green,fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:14,opacity:preview?1:0.5}}>Send Test Email</button>
{preview&&<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:18,fontSize:13,lineHeight:1.7,color:"#ccc",whiteSpace:"pre-wrap"}}>{preview}</div>}
</div>}

{tab==="Sectors"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
<div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Target Sectors ({sectors.length} active)</div>
{SECTORS.map(s=>{const a=sectors.includes(s.label);return(
<button key={s.label} onClick={()=>toggle(s.label)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:a?"rgba(74,158,255,0.06)":"rgba(255,255,255,0.02)",border:"1px solid "+(a?"rgba(74,158,255,0.25)":"rgba(255,255,255,0.06)"),borderRadius:12,padding:"14px 16px",cursor:"pointer"}}>
<div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:20}}>{s.icon}</span><span style={{fontSize:13,color:a?T.text:"#555",fontWeight:500}}>{s.label}</span></div>
<div style={{width:22,height:22,borderRadius:"50%",background:a?T.blue:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#000",fontWeight:800}}>{a?"✓":""}</div>
</button>);
})}
</div>}
</div>
</div>
</div>
);
}
