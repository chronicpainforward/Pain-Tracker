import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY   = "cpf-entries-v5";
const TAX_KEY       = "cpf-tax-v1";
const SETTINGS_KEY  = "cpf-settings-v1";
const KM_RATE       = 0.71;
const TABS          = ["Log Today","Trends","Year","Doctor Report","Tax","Settings"];

const PAIN_COLORS  = ["#FAECE7","#F5C4B3","#F0997B","#EF8060","#D85A30","#C04820","#993C1D","#7a2e13","#5a1f0a","#3d1005"];
const PAIN_LABELS  = ["No pain","Barely there","Mild","Noticeable","Moderate","Uncomfortable","Severe","Very severe","Excruciating","Worst possible"];
const MOOD_LABELS  = ["Very low","Low","Low-mid","Neutral","Neutral+","Moderate","Good","Very good","Great","Excellent"];
const SLEEP_LABELS = ["Terrible","Very poor","Poor","Below avg","Fair","Decent","Good","Very good","Great","Excellent"];
const SOCIAL_LABELS= ["None","Minimal","Very low","Low","Some","Moderate","Active","Very active","Highly active","Full"];
const MONTHS       = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PAIN_TYPES   = ["Burning","Stabbing","Aching","Throbbing","Shooting","Radiating","Cramping","Pressing","Tingling","Numbness"];
const TRIGGERS     = ["Stress","Poor sleep","Weather change","Overexertion","Sitting long","Standing long","Cold/damp","Certain foods","Alcohol","Dehydration","Emotional distress","Travel"];
const WEATHER_OPTS = ["Sunny","Cloudy","Rainy","Stormy","Humid","Cold","Hot","Windy","Snowy"];
const PRACTITIONER_TYPES = ["Family doctor","Specialist","Physiotherapist","Massage therapist","Chiropractor","Psychologist","Occupational therapist","Naturopath","Acupuncturist","Other"];

const CM = {
  purple:{fill:"#EEEDFE",border:"#534AB7",text:"#26215C"},
  teal:  {fill:"#E1F5EE",border:"#1D9E75",text:"#04342C"},
  coral: {fill:"#FAECE7",border:"#D85A30",text:"#4A1B0C"},
  blue:  {fill:"#E6F1FB",border:"#185FA5",text:"#042C53"},
};

// ── Storage ───────────────────────────────────────────────────────────────
const stor = {
  get: async (k:string) => { try{ const r=await (window as any).storage.get(k); return r?JSON.parse(r.value):null; }catch{return null;} },
  set: async (k:string,v:any) => { try{ await (window as any).storage.set(k,JSON.stringify(v)); }catch{} },
};

// ── Body regions ──────────────────────────────────────────────────────────
const BODY_F = [
  {id:"frontal",   label:"Frontal",      path:"M110,18 C94,18 80,32 80,50 L140,50 C140,32 126,18 110,18 Z"},
  {id:"ltemporal", label:"L temporal",   path:"M80,50 C80,62 84,72 90,79 L110,65 L110,50 Z"},
  {id:"rtemporal", label:"R temporal",   path:"M140,50 C140,62 136,72 130,79 L110,65 L110,50 Z"},
  {id:"face",      label:"Face",         path:"M90,79 C96,84 103,87 110,87 C117,87 124,84 130,79 L110,65 Z"},
  {id:"neck",      label:"Neck",         path:"M101,87 L119,87 L121,108 L99,108 Z"},
  {id:"lshoulder", label:"L shoulder",   path:"M72,108 C60,108 48,115 44,125 L62,155 L72,155 Z"},
  {id:"rshoulder", label:"R shoulder",   path:"M148,108 C160,108 172,115 176,125 L158,155 L148,155 Z"},
  {id:"lchest",    label:"L chest",      path:"M72,108 L110,108 L110,172 L72,172 Z"},
  {id:"rchest",    label:"R chest",      path:"M110,108 L148,108 L148,172 L110,172 Z"},
  {id:"labdomen",  label:"L abdomen",    path:"M72,172 L110,172 L110,218 L73,218 Z"},
  {id:"rabdomen",  label:"R abdomen",    path:"M110,172 L148,172 L147,218 L110,218 Z"},
  {id:"lhip",      label:"L hip",        path:"M73,218 L110,218 L110,256 L71,256 Z"},
  {id:"rhip",      label:"R hip",        path:"M110,218 L147,218 L149,256 L110,256 Z"},
  {id:"larm",      label:"L upper arm",  path:"M42,155 L62,155 L66,216 L38,216 Z"},
  {id:"rarm",      label:"R upper arm",  path:"M178,155 L158,155 L154,216 L182,216 Z"},
  {id:"lforearm",  label:"L forearm",    path:"M38,216 L66,216 L65,278 L35,278 Z"},
  {id:"rforearm",  label:"R forearm",    path:"M154,216 L182,216 L185,278 L159,278 Z"},
  {id:"lthigh",    label:"L thigh",      path:"M71,256 L110,256 L108,318 L65,318 Z"},
  {id:"rthigh",    label:"R thigh",      path:"M110,256 L149,256 L155,318 L112,318 Z"},
  {id:"lknee",     label:"L knee",       path:"M65,318 L108,318 L107,342 L64,342 Z"},
  {id:"rknee",     label:"R knee",       path:"M112,318 L155,318 L156,342 L113,342 Z"},
  {id:"lshin",     label:"L shin",       path:"M64,342 L107,342 L105,395 L61,395 Z"},
  {id:"rshin",     label:"R shin",       path:"M113,342 L156,342 L158,395 L112,395 Z"},
  {id:"lfoot",     label:"L foot",       path:"M57,395 L105,395 L104,415 L52,415 Z"},
  {id:"rfoot",     label:"R foot",       path:"M112,395 L160,395 L164,415 L117,415 Z"},
];
const BODY_B = [
  {id:"occipital", label:"Occipital",    path:"M80,72 C80,79 94,87 110,87 C126,87 140,79 140,72 L110,60 Z"},
  {id:"lparietal", label:"L parietal",   path:"M80,38 L80,72 L110,60 L110,18 C94,18 80,28 80,38 Z"},
  {id:"rparietal", label:"R parietal",   path:"M140,38 L140,72 L110,60 L110,18 C126,18 140,28 140,38 Z"},
  {id:"tophead",   label:"Top head",     path:"M80,38 L110,38 L140,38 C140,28 126,18 110,18 C94,18 80,28 80,38 Z"},
  {id:"bneck",     label:"Neck back",    path:"M101,87 L119,87 L121,108 L99,108 Z"},
  {id:"blshoulder",label:"L shoulder",   path:"M72,108 C60,108 48,115 44,125 L62,155 L72,155 Z"},
  {id:"brshoulder",label:"R shoulder",   path:"M148,108 C160,108 172,115 176,125 L158,155 L148,155 Z"},
  {id:"lupperback",label:"L upper back", path:"M72,108 L110,108 L110,172 L72,172 Z"},
  {id:"rupperback",label:"R upper back", path:"M110,108 L148,108 L148,172 L110,172 Z"},
  {id:"lmidback",  label:"L mid back",   path:"M72,172 L110,172 L110,198 L72,198 Z"},
  {id:"rmidback",  label:"R mid back",   path:"M110,172 L148,172 L147,198 L110,198 Z"},
  {id:"llowerback",label:"L lower back", path:"M72,198 L110,198 L110,218 L73,218 Z"},
  {id:"rlowerback",label:"R lower back", path:"M110,198 L147,198 L147,218 L110,218 Z"},
  {id:"lbuttock",  label:"L buttock",    path:"M71,218 L110,218 L110,260 L70,260 Z"},
  {id:"rbuttock",  label:"R buttock",    path:"M110,218 L149,218 L150,260 L110,260 Z"},
  {id:"blarm",     label:"L upper arm",  path:"M42,155 L62,155 L66,216 L38,216 Z"},
  {id:"brarm",     label:"R upper arm",  path:"M178,155 L158,155 L154,216 L182,216 Z"},
  {id:"blforearm", label:"L forearm",    path:"M38,216 L66,216 L65,278 L35,278 Z"},
  {id:"brforearm", label:"R forearm",    path:"M154,216 L182,216 L185,278 L159,278 Z"},
  {id:"lhamstring",label:"L hamstring",  path:"M70,260 L110,260 L108,320 L65,320 Z"},
  {id:"rhamstring",label:"R hamstring",  path:"M110,260 L150,260 L155,320 L112,320 Z"},
  {id:"lcalf",     label:"L calf",       path:"M65,320 L108,320 L106,395 L61,395 Z"},
  {id:"rcalf",     label:"R calf",       path:"M112,320 L155,320 L158,395 L113,395 Z"},
  {id:"lbackfoot", label:"L foot back",  path:"M57,395 L106,395 L104,415 L52,415 Z"},
  {id:"rbackfoot", label:"R foot back",  path:"M113,395 L158,395 L162,415 L118,415 Z"},
];
const LH_PALM = [
  {id:"lhp_thumb",label:"L thumb",  path:"M18,52 C12,46 10,36 12,28 C14,20 20,16 26,18 C30,20 30,28 28,36 L24,52 Z"},
  {id:"lhp_index",label:"L index",  path:"M28,52 L34,52 L35,22 C35,16 30,12 26,14 C22,16 21,22 23,28 Z"},
  {id:"lhp_mid",  label:"L middle", path:"M36,52 L42,52 L43,18 C43,12 38,8 34,10 C30,12 30,18 32,24 Z"},
  {id:"lhp_ring", label:"L ring",   path:"M44,52 L50,52 L51,22 C51,16 46,12 42,14 C38,16 38,22 40,28 Z"},
  {id:"lhp_pinky",label:"L pinky",  path:"M52,52 L57,52 L57,30 C57,24 53,20 49,22 C45,24 45,30 47,36 Z"},
  {id:"lhp_palm", label:"L palm",   path:"M24,52 L57,52 L60,88 C60,96 54,102 46,102 C38,102 28,96 26,88 Z"},
  {id:"lhp_wrist",label:"L wrist",  path:"M24,102 L62,102 L63,120 L23,120 Z"},
];
const LH_DORS = [
  {id:"lhd_thumb",label:"L thumb dors",  path:"M18,52 C12,46 10,36 12,28 C14,20 20,16 26,18 C30,20 30,28 28,36 L24,52 Z"},
  {id:"lhd_index",label:"L index dors",  path:"M28,52 L34,52 L35,22 C35,16 30,12 26,14 C22,16 21,22 23,28 Z"},
  {id:"lhd_mid",  label:"L mid dors",    path:"M36,52 L42,52 L43,18 C43,12 38,8 34,10 C30,12 30,18 32,24 Z"},
  {id:"lhd_ring", label:"L ring dors",   path:"M44,52 L50,52 L51,22 C51,16 46,12 42,14 C38,16 38,22 40,28 Z"},
  {id:"lhd_pinky",label:"L pinky dors",  path:"M52,52 L57,52 L57,30 C57,24 53,20 49,22 C45,24 45,30 47,36 Z"},
  {id:"lhd_dors", label:"L dorsum",      path:"M24,52 L57,52 L60,88 C60,96 54,102 46,102 C38,102 28,96 26,88 Z"},
  {id:"lhd_wrist",label:"L wrist dors",  path:"M24,102 L62,102 L63,120 L23,120 Z"},
];
const RH_PALM = [
  {id:"rhp_thumb",label:"R thumb",  path:"M82,52 C88,46 90,36 88,28 C86,20 80,16 74,18 C70,20 70,28 72,36 L76,52 Z"},
  {id:"rhp_index",label:"R index",  path:"M72,52 L66,52 L65,22 C65,16 70,12 74,14 C78,16 79,22 77,28 Z"},
  {id:"rhp_mid",  label:"R middle", path:"M64,52 L58,52 L57,18 C57,12 62,8 66,10 C70,12 70,18 68,24 Z"},
  {id:"rhp_ring", label:"R ring",   path:"M56,52 L50,52 L49,22 C49,16 54,12 58,14 C62,16 62,22 60,28 Z"},
  {id:"rhp_pinky",label:"R pinky",  path:"M48,52 L43,52 L43,30 C43,24 47,20 51,22 C55,24 55,30 53,36 Z"},
  {id:"rhp_palm", label:"R palm",   path:"M76,52 L43,52 L40,88 C40,96 46,102 54,102 C62,102 72,96 74,88 Z"},
  {id:"rhp_wrist",label:"R wrist",  path:"M76,102 L38,102 L37,120 L77,120 Z"},
];
const RH_DORS = [
  {id:"rhd_thumb",label:"R thumb dors",  path:"M82,52 C88,46 90,36 88,28 C86,20 80,16 74,18 C70,20 70,28 72,36 L76,52 Z"},
  {id:"rhd_index",label:"R index dors",  path:"M72,52 L66,52 L65,22 C65,16 70,12 74,14 C78,16 79,22 77,28 Z"},
  {id:"rhd_mid",  label:"R mid dors",    path:"M64,52 L58,52 L57,18 C57,12 62,8 66,10 C70,12 70,18 68,24 Z"},
  {id:"rhd_ring", label:"R ring dors",   path:"M56,52 L50,52 L49,22 C49,16 54,12 58,14 C62,16 62,22 60,28 Z"},
  {id:"rhd_pinky",label:"R pinky dors",  path:"M48,52 L43,52 L43,30 C43,24 47,20 51,22 C55,24 55,30 53,36 Z"},
  {id:"rhd_dors", label:"R dorsum",      path:"M76,52 L43,52 L40,88 C40,96 46,102 54,102 C62,102 72,96 74,88 Z"},
  {id:"rhd_wrist",label:"R wrist dors",  path:"M76,102 L38,102 L37,120 L77,120 Z"},
];
const LF_DORS = [
  {id:"lfd_big",    label:"L big toe",    path:"M30,55 C22,52 16,44 18,36 C20,28 28,24 36,28 C42,32 44,42 40,50 Z"},
  {id:"lfd_2",      label:"L 2nd toe",    path:"M44,52 C38,46 38,36 44,30 C50,24 58,26 60,34 C62,42 58,50 52,54 Z"},
  {id:"lfd_3",      label:"L 3rd toe",    path:"M56,56 C52,50 52,40 58,34 C64,28 72,30 73,38 C74,46 70,54 64,58 Z"},
  {id:"lfd_4",      label:"L 4th toe",    path:"M66,62 C64,56 65,46 71,40 C77,34 84,36 84,44 C84,52 80,60 74,64 Z"},
  {id:"lfd_little", label:"L little toe", path:"M76,70 C76,64 78,56 84,52 C90,48 96,50 95,58 C94,66 88,72 82,74 Z"},
  {id:"lfd_dors",   label:"L foot dorsum",path:"M30,55 L76,70 L82,74 L86,105 L22,112 L18,72 Z"},
  {id:"lfd_mid",    label:"L midfoot",    path:"M22,112 L86,105 L88,135 L20,138 Z"},
  {id:"lfd_ankle",  label:"L ankle",      path:"M20,138 L88,135 L85,152 C80,158 65,162 52,162 C38,162 24,158 20,152 Z"},
];
const LF_SOLE = [
  {id:"lfs_toes",label:"L toes sole", path:"M28,30 C24,30 18,38 20,48 C22,56 32,60 44,58 C56,56 64,48 62,40 C60,32 50,28 40,28 Z"},
  {id:"lfs_ball",label:"L ball",      path:"M20,48 L62,40 L68,75 L16,80 Z"},
  {id:"lfs_arch",label:"L arch",      path:"M16,80 L68,75 L66,115 L22,118 Z"},
  {id:"lfs_heel",label:"L heel sole", path:"M22,118 L66,115 L62,145 C56,155 40,158 28,155 C16,152 18,138 22,118 Z"},
];
const RF_DORS = [
  {id:"rfd_big",    label:"R big toe",    path:"M90,55 C98,52 104,44 102,36 C100,28 92,24 84,28 C78,32 76,42 80,50 Z"},
  {id:"rfd_2",      label:"R 2nd toe",    path:"M76,52 C82,46 82,36 76,30 C70,24 62,26 60,34 C58,42 62,50 68,54 Z"},
  {id:"rfd_3",      label:"R 3rd toe",    path:"M64,56 C68,50 68,40 62,34 C56,28 48,30 47,38 C46,46 50,54 56,58 Z"},
  {id:"rfd_4",      label:"R 4th toe",    path:"M54,62 C56,56 55,46 49,40 C43,34 36,36 36,44 C36,52 40,60 46,64 Z"},
  {id:"rfd_little", label:"R little toe", path:"M44,70 C44,64 42,56 36,52 C30,48 24,50 25,58 C26,66 32,72 38,74 Z"},
  {id:"rfd_dors",   label:"R foot dorsum",path:"M90,55 L44,70 L38,74 L34,105 L98,112 L102,72 Z"},
  {id:"rfd_mid",    label:"R midfoot",    path:"M98,112 L34,105 L32,135 L100,138 Z"},
  {id:"rfd_ankle",  label:"R ankle",      path:"M100,138 L32,135 L35,152 C40,158 55,162 68,162 C82,162 96,158 100,152 Z"},
];
const RF_SOLE = [
  {id:"rfs_toes",label:"R toes sole", path:"M82,30 C86,30 92,38 90,48 C88,56 78,60 66,58 C54,56 46,48 48,40 C50,32 60,28 70,28 Z"},
  {id:"rfs_ball",label:"R ball",      path:"M90,48 L48,40 L42,75 L94,80 Z"},
  {id:"rfs_arch",label:"R arch",      path:"M94,80 L42,75 L44,115 L88,118 Z"},
  {id:"rfs_heel",label:"R heel sole", path:"M88,118 L44,115 L48,145 C54,155 70,158 82,155 C94,152 92,138 88,118 Z"},
];
const ALL_REGIONS = [...BODY_F,...BODY_B,...LH_PALM,...LH_DORS,...RH_PALM,...RH_DORS,...LF_DORS,...LF_SOLE,...RF_DORS,...RF_SOLE];

// ── Shared components ─────────────────────────────────────────────────────
function Paths({ regions, painMap, sel, onClick }: any) {
  return regions.map((r:any) => {
    const lvl = painMap[r.id]?.score || 0;
    const s = sel === r.id;
    return (
      <path key={r.id} d={r.path}
        fill={lvl>0?PAIN_COLORS[lvl-1]:"#f5e6d8"}
        stroke={s?"#534AB7":"#c9a98a"} strokeWidth={s?2:0.5}
        style={{cursor:"pointer",opacity:lvl>0?0.92:0.75,transition:"all .15s"}}
        onClick={()=>onClick(r.id)}
      />
    );
  });
}

function Scale({ value, onChange, labels, color }: any) {
  const c = CM[color as keyof typeof CM];
  return (
    <div style={{marginTop:6}}>
      <div style={{display:"flex",gap:3,flexWrap:"wrap" as any}}>
        {[1,2,3,4,5,6,7,8,9,10].map(v=>(
          <button key={v} onClick={()=>onChange(v)} style={{minWidth:34,padding:"7px 2px",borderRadius:7,border:value===v?"2px solid "+c.border:"1px solid #d1d5db",background:value===v?c.fill:"transparent",cursor:"pointer",color:value===v?c.text:"#6b7280",textAlign:"center" as any}}>
            <div style={{fontSize:12,fontWeight:value===v?500:400}}>{v}</div>
          </button>
        ))}
      </div>
      {value>0 && <p style={{fontSize:11,color:"#6b7280",margin:"5px 0 0"}}>{value} — {labels[value-1]}</p>}
    </div>
  );
}

function Box({ title, children }: any) {
  return (
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
      <p style={{fontWeight:500,fontSize:13,color:"#6b7280",margin:"0 0 8px"}}>{title}</p>
      {children}
    </div>
  );
}

function Tags({ items, onChange, placeholder, color }: any) {
  const [inp,setInp] = useState("");
  const c = color==="purple"?{bg:"#EEEDFE",text:"#534AB7",border:"#AFA9EC"}:{bg:"#E1F5EE",text:"#0F6E56",border:"#5DCAA5"};
  const add = () => { const v=inp.trim(); if(v&&!items.includes(v)) onChange([...items,v]); setInp(""); };
  return (
    <div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap" as any,marginBottom:5}}>
        {items.map((x:string,i:number)=>(
          <span key={i} style={{display:"inline-flex",alignItems:"center",gap:3,background:c.bg,color:c.text,border:"1px solid "+c.border,borderRadius:20,padding:"2px 10px",fontSize:11}}>
            {x}<span onClick={()=>onChange(items.filter((_:any,j:number)=>j!==i))} style={{cursor:"pointer",fontSize:13,lineHeight:1,opacity:.7}}>x</span>
          </span>
        ))}
      </div>
      <div style={{display:"flex",gap:5}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder={placeholder}
          style={{flex:1,padding:"7px 9px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:12,boxSizing:"border-box" as any}}/>
        <button onClick={add} style={{padding:"7px 12px",borderRadius:7,border:"1px solid #e5e7eb",background:"transparent",fontSize:12,cursor:"pointer"}}>Add</button>
      </div>
    </div>
  );
}

function Chips({ options, selected, onChange, color }: any) {
  const c = color==="purple"?{bg:"#EEEDFE",text:"#534AB7",border:"#AFA9EC"}:color==="coral"?{bg:"#FAECE7",text:"#D85A30",border:"#F0997B"}:{bg:"#E1F5EE",text:"#0F6E56",border:"#5DCAA5"};
  return (
    <div style={{display:"flex",gap:5,flexWrap:"wrap" as any,marginTop:6}}>
      {options.map((o:string)=>{
        const on = selected.includes(o);
        return <button key={o} onClick={()=>onChange(on?selected.filter((x:string)=>x!==o):[...selected,o])}
          style={{padding:"4px 10px",borderRadius:20,border:"1px solid "+(on?c.border:"#e5e7eb"),background:on?c.bg:"transparent",color:on?c.text:"#6b7280",fontSize:11,cursor:"pointer"}}>{o}</button>;
      })}
    </div>
  );
}

// ── Body Map ──────────────────────────────────────────────────────────────
function BodyMap({ painMap, onChange }: any) {
  const [view,setView]     = useState("front");
  const [sel,setSel]       = useState<string|null>(null);
  const [score,setScore]   = useState<number|null>(null);
  const [showTypes,setShowTypes] = useState(false);

  const bodyR  = view==="front"?BODY_F:BODY_B;
  const lHandR = view==="front"?LH_PALM:LH_DORS;
  const rHandR = view==="front"?RH_PALM:RH_DORS;
  const lFootR = view==="front"?LF_DORS:LF_SOLE;
  const rFootR = view==="front"?RF_DORS:RF_SOLE;

  const clickRegion = (id:string) => {
    setSel(id);
    const cur = painMap[id];
    setScore(cur?.score||null);
    setShowTypes(!!cur);
  };
  const clickScore = (n:number) => {
    setScore(n);
    if(sel) {
      const cur = painMap[sel]||{};
      onChange({...painMap,[sel]:{...cur,score:n}});
      setShowTypes(true);
    }
  };
  const toggleType = (t:string) => {
    if(!sel) return;
    const cur = painMap[sel]||{};
    const types = cur.types||[];
    const updated = types.includes(t)?types.filter((x:string)=>x!==t):[...types,t];
    onChange({...painMap,[sel]:{...cur,types:updated}});
  };
  const marked = Object.entries(painMap).filter(([,v]:any)=>v?.score>0);
  const selInfo = sel?ALL_REGIONS.find(r=>r.id===sel):null;
  const selData = sel?painMap[sel]:null;

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        {["front","back"].map(v=>(
          <button key={v} onClick={()=>{setView(v);setSel(null);setScore(null);setShowTypes(false);}}
            style={{padding:"5px 14px",borderRadius:20,border:"1px solid #d1d5db",background:view===v?"#534AB7":"transparent",color:view===v?"#fff":"#6b7280",fontSize:12,cursor:"pointer",textTransform:"capitalize" as any}}>{v}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:4,alignItems:"flex-start"}}>
        <div style={{display:"flex",flexDirection:"column" as any,alignItems:"center",gap:3}}>
          <span style={{fontSize:9,color:"#b8956a"}}>{view==="front"?"L palm":"L dorsum"}</span>
          <svg viewBox="0 0 80 130" style={{width:58,cursor:"pointer"}} xmlns="http://www.w3.org/2000/svg">
            <Paths regions={lHandR} painMap={painMap} sel={sel} onClick={clickRegion}/>
          </svg>
          <span style={{fontSize:9,color:"#b8956a",marginTop:4}}>{view==="front"?"L dorsum":"L sole"}</span>
          <svg viewBox="0 0 110 170" style={{width:58,cursor:"pointer"}} xmlns="http://www.w3.org/2000/svg">
            <Paths regions={lFootR} painMap={painMap} sel={sel} onClick={clickRegion}/>
          </svg>
        </div>
        <svg viewBox="0 0 220 435" style={{width:118,cursor:"pointer"}} xmlns="http://www.w3.org/2000/svg">
          <Paths regions={bodyR} painMap={painMap} sel={sel} onClick={clickRegion}/>
          <line x1="110" y1="108" x2="110" y2="218" stroke="#c9a98a" strokeWidth="0.75" strokeDasharray="3,2"/>
          <text x="85" y="145" fontSize="7" fill="#b8956a" textAnchor="middle">L</text>
          <text x="135" y="145" fontSize="7" fill="#b8956a" textAnchor="middle">R</text>
        </svg>
        <div style={{display:"flex",flexDirection:"column" as any,alignItems:"center",gap:3}}>
          <span style={{fontSize:9,color:"#b8956a"}}>{view==="front"?"R palm":"R dorsum"}</span>
          <svg viewBox="0 0 100 130" style={{width:58,cursor:"pointer"}} xmlns="http://www.w3.org/2000/svg">
            <Paths regions={rHandR} painMap={painMap} sel={sel} onClick={clickRegion}/>
          </svg>
          <span style={{fontSize:9,color:"#b8956a",marginTop:4}}>{view==="front"?"R dorsum":"R sole"}</span>
          <svg viewBox="0 0 110 170" style={{width:58,cursor:"pointer"}} xmlns="http://www.w3.org/2000/svg">
            <Paths regions={rFootR} painMap={painMap} sel={sel} onClick={clickRegion}/>
          </svg>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{background:"#f9fafb",borderRadius:8,padding:"6px 8px",marginBottom:8,fontSize:11,color:"#6b7280"}}>
            {!sel&&"Tap a region, then pick a score"}
            {sel&&!score&&(selInfo?selInfo.label:"")+" — pick a score"}
            {sel&&score&&(selInfo?selInfo.label:"")+" — "+score+"/10"}
          </div>
          <p style={{fontSize:11,fontWeight:500,color:"#6b7280",margin:"0 0 4px"}}>Pain score</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:2,marginBottom:8}}>
            {[1,2,3,4,5,6,7,8,9,10].map(n=>(
              <button key={n} onClick={()=>clickScore(n)} style={{padding:"5px 2px",borderRadius:6,textAlign:"center" as any,border:score===n?"2px solid #534AB7":"1px solid #d1d5db",background:score===n?PAIN_COLORS[n-1]:"transparent",color:score===n?"#fff":"#6b7280",cursor:"pointer"}}>
                <div style={{fontSize:11,fontWeight:score===n?600:400}}>{n}</div>
                <div style={{fontSize:8,opacity:.8}}>{PAIN_LABELS[n-1].split(" ")[0]}</div>
              </button>
            ))}
          </div>
          {showTypes&&sel&&score&&(
            <div style={{marginBottom:8}}>
              <p style={{fontSize:11,fontWeight:500,color:"#6b7280",margin:"0 0 4px"}}>Pain type</p>
              <div style={{display:"flex",gap:4,flexWrap:"wrap" as any}}>
                {PAIN_TYPES.map(t=>{
                  const on=(selData?.types||[]).includes(t);
                  return <button key={t} onClick={()=>toggleType(t)} style={{padding:"3px 8px",borderRadius:20,border:"1px solid "+(on?"#D85A30":"#e5e7eb"),background:on?"#FAECE7":"transparent",color:on?"#D85A30":"#6b7280",fontSize:10,cursor:"pointer"}}>{t}</button>;
                })}
              </div>
            </div>
          )}
          {marked.length===0?(
            <p style={{fontSize:10,color:"#9ca3af",fontStyle:"italic"}}>No areas marked</p>
          ):(
            <div>
              <p style={{fontSize:11,fontWeight:500,color:"#6b7280",margin:"0 0 3px"}}>Marked</p>
              <div style={{maxHeight:160,overflowY:"auto" as any,display:"flex",flexDirection:"column" as any,gap:2}}>
                {marked.sort((a:any,b:any)=>b[1].score-a[1].score).map(([id,v]:any)=>{
                  const r=ALL_REGIONS.find(x=>x.id===id);
                  return (
                    <div key={id} onClick={()=>clickRegion(id)} style={{background:sel===id?"#EEEDFE":"#f9fafb",borderRadius:6,padding:"4px 6px",cursor:"pointer"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <span style={{fontSize:10}}>{r?r.label:id}</span>
                        <div style={{display:"flex",alignItems:"center",gap:3}}>
                          <span style={{width:8,height:8,borderRadius:1,background:PAIN_COLORS[v.score-1],display:"inline-block"}}></span>
                          <span style={{fontSize:10,fontWeight:500,color:PAIN_COLORS[Math.min(v.score,8)-1]}}>{v.score}/10</span>
                          <button onClick={(e)=>{e.stopPropagation();const m={...painMap};delete m[id];onChange(m);if(sel===id){setSel(null);setScore(null);setShowTypes(false);}}} style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:12,padding:"0 1px"}}>x</button>
                        </div>
                      </div>
                      {v.types&&v.types.length>0&&<div style={{display:"flex",gap:3,flexWrap:"wrap" as any,marginTop:2}}>{v.types.map((t:string)=><span key={t} style={{fontSize:9,background:"#FAECE7",color:"#D85A30",borderRadius:10,padding:"1px 6px"}}>{t}</span>)}</div>}
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>{onChange({});setSel(null);setScore(null);setShowTypes(false);}} style={{marginTop:4,fontSize:10,color:"#6b7280",background:"none",border:"1px solid #e5e7eb",borderRadius:5,padding:"3px 8px",cursor:"pointer"}}>Clear all</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Log Tab ───────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const blankEntry = () => ({
  date:todayStr(),pain:0,mood:0,sleep:0,social:0,
  exercise:"",exerciseMins:"",pharma:[],nonPharma:[],
  painMap:{},painTypes:[],triggers:[],weather:"",notes:"",
  apptPractitioner:"",apptKm:"",
});

function LogTab({ entries, setEntries }: any) {
  const d   = todayStr();
  const ex  = entries.find((e:any)=>e.date===d);
  const [form,setForm]   = useState(ex||blankEntry());
  const [saved,setSaved] = useState(!!ex);
  const set = (k:string,v:any) => { setForm((f:any)=>({...f,[k]:v})); setSaved(false); };

  const handlePainMap = (v:any) => {
    set("painMap",v);
    const vals = Object.values(v).map((x:any)=>x?.score||0).filter((x:number)=>x>0);
    if(vals.length>0){
      const suggested = Math.round(Math.max(...vals)*0.7+vals.reduce((a:number,b:number)=>a+b,0)/vals.length*0.3);
      set("pain",suggested);
    }
  };

  const save = () => { setEntries((p:any)=>[...p.filter((e:any)=>e.date!==d),form]); setSaved(true); };

  return (
    <div>
      <p style={{fontSize:12,color:"#6b7280",marginBottom:10,marginTop:0}}>{new Date().toLocaleDateString("en-CA",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>

      <Box title="Pain location">
        <BodyMap painMap={form.painMap||{}} onChange={handlePainMap}/>
      </Box>
      <Box title="Pain level (overall)">
        <p style={{fontSize:11,color:"#6b7280",margin:"0 0 6px"}}>Auto-suggested from body map. Adjust if needed.</p>
        <Scale value={form.pain} onChange={(v:any)=>set("pain",v)} labels={PAIN_LABELS} color="coral"/>
      </Box>

      <Box title="Triggers today">
        <p style={{fontSize:11,color:"#6b7280",margin:"0 0 4px"}}>What may have contributed to your pain today?</p>
        <Chips options={TRIGGERS} selected={form.triggers||[]} onChange={(v:any)=>set("triggers",v)} color="coral"/>
      </Box>

      <Box title="Weather today">
        <Chips options={WEATHER_OPTS} selected={form.weather?[form.weather]:[]} onChange={(v:any)=>set("weather",v[v.length-1]||"")} color="blue"/>
      </Box>

      <Box title="Mood"><Scale value={form.mood} onChange={(v:any)=>set("mood",v)} labels={MOOD_LABELS} color="purple"/></Box>
      <Box title="Sleep quality"><Scale value={form.sleep} onChange={(v:any)=>set("sleep",v)} labels={SLEEP_LABELS} color="blue"/></Box>
      <Box title="Social activity"><Scale value={form.social} onChange={(v:any)=>set("social",v)} labels={SOCIAL_LABELS} color="teal"/></Box>

      <Box title="Exercise / movement">
        <input placeholder="Activity" value={form.exercise} onChange={e=>set("exercise",e.target.value)} style={{width:"100%",marginBottom:6,padding:"7px 9px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:13,boxSizing:"border-box" as any}}/>
        <input placeholder="Minutes" type="number" value={form.exerciseMins} onChange={e=>set("exerciseMins",e.target.value)} style={{width:"100%",padding:"7px 9px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:13,boxSizing:"border-box" as any}}/>
      </Box>

      <Box title="Pharmacological interventions">
        <Tags items={form.pharma} onChange={(v:any)=>set("pharma",v)} placeholder="e.g. Ibuprofen 400mg" color="purple"/>
      </Box>
      <Box title="Non-pharmacological interventions">
        <Tags items={form.nonPharma} onChange={(v:any)=>set("nonPharma",v)} placeholder="e.g. Ice pack, TENS, physio" color="teal"/>
      </Box>

      <Box title="Appointment travel (tax)">
        <p style={{fontSize:11,color:"#6b7280",margin:"0 0 6px"}}>Log km to appointments for CRA medical expense claims</p>
        <div style={{display:"flex",gap:6,marginBottom:6}}>
          <input placeholder="Practitioner name" value={form.apptPractitioner||""} onChange={e=>set("apptPractitioner",e.target.value)}
            style={{flex:2,padding:"7px 9px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:12,boxSizing:"border-box" as any}}/>
          <input placeholder="Round-trip km" type="number" value={form.apptKm||""} onChange={e=>set("apptKm",e.target.value)}
            style={{flex:1,padding:"7px 9px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:12,boxSizing:"border-box" as any}}/>
        </div>
        {form.apptKm>0&&<p style={{fontSize:11,color:"#1D9E75",margin:"2px 0 0",fontWeight:500}}>Est. claim: ${(form.apptKm*KM_RATE).toFixed(2)} @ {KM_RATE}c/km</p>}
      </Box>

      <Box title="Notes for doctor">
        <textarea placeholder="Symptoms, flare-ups, observations..." value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3}
          style={{width:"100%",padding:"7px 9px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:13,resize:"vertical" as any,boxSizing:"border-box" as any}}/>
      </Box>

      <button onClick={save} style={{width:"100%",padding:"11px",borderRadius:10,background:saved?"#1D9E75":"#534AB7",color:"#fff",border:"none",fontSize:14,fontWeight:500,cursor:"pointer"}}>
        {saved?"Entry saved":"Save today's entry"}
      </button>
    </div>
  );
}

// ── Trends Tab ────────────────────────────────────────────────────────────
function TrendsTab({ entries }: any) {
  const [range,setRange] = useState(14);
  const cut = new Date(); cut.setDate(cut.getDate()-range);
  const data = [...entries].sort((a:any,b:any)=>a.date.localeCompare(b.date)).filter((e:any)=>new Date(e.date)>=cut);

  // Flare-up detection
  const flares: string[] = [];
  for(let i=1;i<data.length;i++){
    if(data[i].pain>=7&&data[i-1].pain>=7){
      flares.push(data[i].date);
    }
  }

  if(!data.length) return <p style={{textAlign:"center" as any,color:"#6b7280",padding:"3rem 0"}}>No entries yet.</p>;
  const avg = (k:string) => { const v=data.filter((e:any)=>e[k]>0).map((e:any)=>e[k]); return v.length?(v.reduce((a:number,b:number)=>a+b,0)/v.length).toFixed(1):"—"; };
  const metrics = [{key:"pain",label:"Pain",color:"#D85A30",bg:"#FAECE7"},{key:"mood",label:"Mood",color:"#534AB7",bg:"#EEEDFE"},{key:"sleep",label:"Sleep",color:"#185FA5",bg:"#E6F1FB"},{key:"social",label:"Social",color:"#0F6E56",bg:"#E1F5EE"}];

  // Trigger frequency
  const trigFreq: any={};
  data.forEach((e:any)=>(e.triggers||[]).forEach((t:string)=>{trigFreq[t]=(trigFreq[t]||0)+1;}));
  const topTriggers = Object.entries(trigFreq).sort((a:any,b:any)=>b[1]-a[1]).slice(0,5);

  // Weather correlation
  const weatherPain: any={};
  data.filter((e:any)=>e.weather&&e.pain>0).forEach((e:any)=>{
    if(!weatherPain[e.weather]) weatherPain[e.weather]={total:0,count:0};
    weatherPain[e.weather].total+=e.pain; weatherPain[e.weather].count++;
  });
  const weatherAvg = Object.entries(weatherPain).map(([w,v]:any)=>({w,avg:(v.total/v.count).toFixed(1)})).sort((a:any,b:any)=>b.avg-a.avg);

  const rf:any={};
  data.forEach((e:any)=>Object.entries(e.painMap||{}).forEach(([id,v]:any)=>{if(v?.score>0){if(!rf[id])rf[id]={c:0,t:0};rf[id].c++;rf[id].t+=v.score;}}));
  const topR = Object.entries(rf).sort((a:any,b:any)=>b[1].c-a[1].c).slice(0,5);
  const ap:any={},an:any={};
  data.forEach((e:any)=>{(e.pharma||[]).forEach((p:string)=>{ap[p]=(ap[p]||0)+1;});(e.nonPharma||[]).forEach((p:string)=>{an[p]=(an[p]||0)+1;});});

  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[7,14,30].map(d=><button key={d} onClick={()=>setRange(d)} style={{padding:"5px 12px",borderRadius:20,border:"1px solid #e5e7eb",background:range===d?"#534AB7":"transparent",color:range===d?"#fff":"#6b7280",fontSize:12,cursor:"pointer"}}>{d} days</button>)}
      </div>

      {flares.length>0&&(
        <div style={{background:"#FAECE7",border:"1px solid #F0997B",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
          <p style={{fontSize:12,fontWeight:500,color:"#D85A30",margin:"0 0 4px"}}>Flare-up alert</p>
          <p style={{fontSize:11,color:"#993C1D",margin:0}}>Pain level 7+ recorded on {flares.length} consecutive day pair(s). Dates: {flares.join(", ")}</p>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:14}}>
        {metrics.map(m=>(
          <div key={m.key} style={{background:m.bg,borderRadius:9,padding:"9px 6px",textAlign:"center" as any}}>
            <div style={{fontSize:10,color:"#555"}}>{m.label}</div>
            <div style={{fontSize:20,fontWeight:500,color:m.color}}>{avg(m.key)}</div>
            <div style={{fontSize:9,color:"#888"}}>avg/10</div>
          </div>
        ))}
      </div>

      {metrics.map(m=>{
        const d2=data.filter((e:any)=>e[m.key]>0);
        if(!d2.length) return null;
        const W=560,H=90,P=30,xs=d2.length>1?(W-P*2)/(d2.length-1):0;
        const pts=d2.map((e:any,i:number)=>({x:d2.length===1?W/2:P+i*xs,y:P+(10-e[m.key])/9*(H-P*2)}));
        const pd=pts.map((p:any,i:number)=>(i===0?"M":"L")+p.x+","+p.y).join(" ");
        return (
          <div key={m.key} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
            <p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 6px"}}>{m.label} over time</p>
            <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",overflow:"visible"}}>
              {[2,4,6,8,10].map(v=>{const y=P+(10-v)/9*(H-P*2);return <g key={v}><line x1={P} x2={W-P} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={0.5}/><text x={P-4} y={y+4} fontSize={9} fill="#9ca3af" textAnchor="end">{v}</text></g>;})}
              <path d={pd} fill="none" stroke={m.color} strokeWidth={2} strokeLinejoin="round"/>
              {pts.map((p:any,i:number)=><circle key={i} cx={p.x} cy={p.y} r={3} fill={m.color}/>)}
              {d2.map((e:any,i:number)=>{if(d2.length<=7||i%(Math.ceil(d2.length/6))===0)return <text key={i} x={pts[i].x} y={H-4} fontSize={8} fill="#9ca3af" textAnchor="middle">{e.date.slice(5)}</text>;return null;})}
            </svg>
          </div>
        );
      })}

      {topTriggers.length>0&&(
        <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
          <p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 8px"}}>Top triggers</p>
          {topTriggers.map(([t,c]:any)=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <span style={{fontSize:12,flex:1}}>{t}</span>
              <div style={{background:"#e5e7eb",borderRadius:20,height:6,flex:2,overflow:"hidden"}}>
                <div style={{height:6,borderRadius:20,background:"#D85A30",width:(c/data.length*100)+"%"}}></div>
              </div>
              <span style={{fontSize:10,color:"#6b7280",minWidth:30}}>{c}x</span>
            </div>
          ))}
        </div>
      )}

      {weatherAvg.length>0&&(
        <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
          <p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 8px"}}>Weather vs pain correlation</p>
          {weatherAvg.map(({w,avg}:any)=>(
            <div key={w} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:12}}>{w}</span>
              <span style={{fontSize:11,background:"#FAECE7",color:"#D85A30",borderRadius:20,padding:"1px 8px"}}>avg pain {avg}/10</span>
            </div>
          ))}
        </div>
      )}

      {topR.length>0&&(
        <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
          <p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 8px"}}>Most frequent pain areas</p>
          {topR.map(([id,{c,t}]:any)=>{
            const r=ALL_REGIONS.find((x:any)=>x.id===id),a=Math.round(t/c);
            return (
              <div key={id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{width:9,height:9,borderRadius:2,background:PAIN_COLORS[a-1],display:"inline-block"}}></span>
                <span style={{fontSize:12,flex:1}}>{r?r.label:id}</span>
                <span style={{fontSize:10,color:"#6b7280"}}>{c} days</span>
                <span style={{fontSize:10,background:"#FAECE7",color:"#D85A30",borderRadius:20,padding:"1px 7px"}}>avg {a}/10</span>
              </div>
            );
          })}
        </div>
      )}

      {(Object.keys(ap).length>0||Object.keys(an).length>0)&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {Object.keys(ap).length>0&&<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px"}}><p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 8px"}}>Top pharmacological</p>{Object.entries(ap).sort((a:any,b:any)=>b[1]-a[1]).slice(0,5).map(([n,c]:any)=><div key={n} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11}}>{n}</span><span style={{fontSize:10,background:"#EEEDFE",color:"#534AB7",borderRadius:20,padding:"1px 7px"}}>{c}x</span></div>)}</div>}
          {Object.keys(an).length>0&&<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 12px"}}><p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 8px"}}>Top non-pharmacological</p>{Object.entries(an).sort((a:any,b:any)=>b[1]-a[1]).slice(0,5).map(([n,c]:any)=><div key={n} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11}}>{n}</span><span style={{fontSize:10,background:"#E1F5EE",color:"#0F6E56",borderRadius:20,padding:"1px 7px"}}>{c}x</span></div>)}</div>}
        </div>
      )}
    </div>
  );
}

// ── Year in Pixels ────────────────────────────────────────────────────────
function YearTab({ entries }: any) {
  const yr   = new Date().getFullYear();
  const map: any = {};
  entries.filter((e:any)=>e.date.startsWith(yr.toString())).forEach((e:any)=>{map[e.date]=e.pain;});

  const weeks: any[][] = [];
  const start = new Date(yr,0,1);
  const startDay = start.getDay();
  let cur: any[] = Array(startDay).fill(null);
  const end = new Date(yr,11,31);
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
    const ds = d.toISOString().split("T")[0];
    cur.push({date:ds,pain:map[ds]||0});
    if(cur.length===7){ weeks.push(cur); cur=[]; }
  }
  if(cur.length>0){ while(cur.length<7) cur.push(null); weeks.push(cur); }

  const dayLabels=["S","M","T","W","T","F","S"];

  return (
    <div>
      <p style={{fontWeight:500,fontSize:14,margin:"0 0 4px"}}>{yr} — Year in Pixels</p>
      <p style={{fontSize:11,color:"#6b7280",marginBottom:12}}>Each square = one day. Colour = pain level.</p>
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap" as any,alignItems:"center"}}>
        <span style={{fontSize:10,color:"#9ca3af"}}>No entry</span>
        {[1,3,5,7,9].map(n=>(
          <span key={n} style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10,color:"#6b7280"}}>
            <span style={{width:12,height:12,borderRadius:2,background:PAIN_COLORS[n-1],display:"inline-block"}}></span>{n}
          </span>
        ))}
        <span style={{fontSize:10,color:"#9ca3af",marginLeft:4}}>= pain level</span>
      </div>
      <div style={{overflowX:"auto" as any}}>
        <div style={{display:"flex",gap:1,marginBottom:2}}>
          {dayLabels.map((l,i)=><div key={i} style={{width:13,fontSize:8,color:"#9ca3af",textAlign:"center" as any}}>{l}</div>)}
        </div>
        <div style={{display:"flex",flexDirection:"column" as any,gap:1}}>
          {weeks.map((week,wi)=>(
            <div key={wi} style={{display:"flex",gap:1}}>
              {week.map((day,di)=>(
                <div key={di} title={day?day.date+(day.pain>0?" — pain "+day.pain+"/10":""): ""} style={{width:13,height:13,borderRadius:2,background:day?(day.pain>0?PAIN_COLORS[day.pain-1]:"#f3f4f6"):"transparent",cursor:day?"pointer":"default"}}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:14,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
        {[{label:"Days logged",val:Object.keys(map).length},{label:"Avg pain",val:(()=>{const v=Object.values(map).filter((x:any)=>x>0) as number[];return v.length?(v.reduce((a:number,b:number)=>a+b,0)/v.length).toFixed(1):"—";})()},{label:"High pain days",val:Object.values(map).filter((x:any)=>x>=7).length}].map(s=>(
          <div key={s.label} style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,padding:"8px",textAlign:"center" as any}}>
            <div style={{fontSize:10,color:"#6b7280"}}>{s.label}</div>
            <div style={{fontSize:18,fontWeight:500,color:"#534AB7"}}>{s.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Doctor Report + PDF ───────────────────────────────────────────────────
function ReportTab({ entries }: any) {
  const sorted=[...entries].sort((a:any,b:any)=>b.date.localeCompare(a.date)).slice(0,14);
  if(!sorted.length) return <p style={{textAlign:"center" as any,color:"#6b7280",padding:"3rem 0"}}>No entries yet.</p>;
  const avg=(k:string)=>{const v=sorted.filter((e:any)=>e[k]>0).map((e:any)=>e[k]);return v.length?(v.reduce((a:number,b:number)=>a+b,0)/v.length).toFixed(1):"—";};
  const ap:any={},an:any={},rf:any={},tf:any={};
  sorted.forEach((e:any)=>{
    (e.pharma||[]).forEach((p:string)=>{ap[p]=(ap[p]||0)+1;});
    (e.nonPharma||[]).forEach((p:string)=>{an[p]=(an[p]||0)+1;});
    (e.triggers||[]).forEach((t:string)=>{tf[t]=(tf[t]||0)+1;});
    Object.entries(e.painMap||{}).forEach(([id,v]:any)=>{if(v?.score>0){if(!rf[id])rf[id]={c:0,t:0};rf[id].c++;rf[id].t+=v.score;}});
  });
  const topR=Object.entries(rf).sort((a:any,b:any)=>b[1].c-a[1].c).slice(0,6);
  const notes=sorted.filter((e:any)=>e.notes).map((e:any)=>({date:e.date,text:e.notes}));

  const printReport = () => {
    const w = window.open("","_blank");
    if(!w) return;
    const rows = sorted.map((e:any)=>{
      const pa=Object.entries(e.painMap||{}).filter(([,v]:any)=>v?.score>0).map(([id,v]:any)=>{
        const r=ALL_REGIONS.find((x:any)=>x.id===id);
        return (r?r.label:id)+(v.types&&v.types.length>0?" ("+v.types.join(", ")+")":"")+" "+v.score+"/10";
      }).join("; ");
      return "<tr><td>"+e.date.slice(5)+"</td><td>"+e.pain+"</td><td>"+e.mood+"</td><td>"+e.sleep+"</td><td>"+e.social+"</td><td>"+(e.exerciseMins?e.exerciseMins+"min":"—")+"</td><td style='font-size:10px'>"+pa+"</td><td style='font-size:10px'>"+(e.triggers||[]).join(", ")+"</td></tr>";
    }).join("");
    w.document.write(`
      <html><head><title>ChronicPainForward — Doctor Report</title>
      <style>body{font-family:Arial,sans-serif;padding:20px;font-size:12px;}h1{font-size:18px;color:#534AB7;}h2{font-size:14px;color:#6b7280;border-bottom:1px solid #e5e7eb;padding-bottom:4px;}table{width:100%;border-collapse:collapse;margin-top:8px;}th,td{padding:5px 8px;text-align:left;border-bottom:1px solid #e5e7eb;}th{background:#f9fafb;font-weight:500;}.badge{display:inline-block;background:#EEEDFE;color:#534AB7;border-radius:20px;padding:2px 8px;font-size:11px;margin:2px;}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0;}.card{background:#f9fafb;border-radius:8px;padding:8px;text-align:center;}.card-val{font-size:20px;font-weight:500;color:#534AB7;}.card-lbl{font-size:10px;color:#888;}</style>
      </head><body>
      <h1>Patient Activity Report — ChronicPainForward</h1>
      <p>Generated: ${new Date().toLocaleDateString("en-CA")} &nbsp;|&nbsp; Last ${sorted.length} logged days</p>
      <h2>Averages (1–10)</h2>
      <div class="grid">
        <div class="card"><div class="card-lbl">Pain</div><div class="card-val" style="color:#D85A30">${avg("pain")}</div></div>
        <div class="card"><div class="card-lbl">Mood</div><div class="card-val">${avg("mood")}</div></div>
        <div class="card"><div class="card-lbl">Sleep</div><div class="card-val" style="color:#185FA5">${avg("sleep")}</div></div>
        <div class="card"><div class="card-lbl">Social</div><div class="card-val" style="color:#0F6E56">${avg("social")}</div></div>
      </div>
      <h2>Most reported pain locations</h2>
      <p>${topR.map(([id,{c,t}]:any)=>{const r=ALL_REGIONS.find((x:any)=>x.id===id),a=Math.round(t/c);return "<span class='badge'>"+(r?r.label:id)+" ("+c+"x, avg "+a+"/10)</span>";}).join("")}</p>
      <h2>Top triggers</h2>
      <p>${Object.entries(tf).sort((a:any,b:any)=>b[1]-a[1]).map(([t,c]:any)=>"<span class='badge'>"+t+" ("+c+"x)</span>").join("")||"None recorded"}</p>
      <h2>Pharmacological interventions</h2>
      <p>${Object.entries(ap).map(([n,c]:any)=>"<span class='badge'>"+n+" ("+c+"x)</span>").join("")||"None recorded"}</p>
      <h2>Non-pharmacological interventions</h2>
      <p>${Object.entries(an).map(([n,c]:any)=>"<span class='badge'>"+n+" ("+c+"x)</span>").join("")||"None recorded"}</p>
      ${notes.length>0?"<h2>Patient notes</h2>"+notes.map((n:any)=>"<p><b>"+n.date+"</b> — "+n.text+"</p>").join(""):""}
      <h2>Day-by-day log</h2>
      <table><thead><tr><th>Date</th><th>Pain</th><th>Mood</th><th>Sleep</th><th>Social</th><th>Exercise</th><th>Pain areas</th><th>Triggers</th></tr></thead><tbody>${rows}</tbody></table>
      <p style="margin-top:20px;font-size:10px;color:#9ca3af;">Copyright 2025 ChronicPainForward.com — Confidential patient data</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <p style={{fontWeight:500,fontSize:15,margin:0}}>Patient activity report</p>
          <p style={{fontSize:11,color:"#6b7280",margin:"2px 0 0"}}>Last {sorted.length} days · {new Date().toLocaleDateString("en-CA")}</p>
        </div>
        <button onClick={printReport} style={{padding:"8px 14px",borderRadius:8,background:"#534AB7",color:"#fff",border:"none",fontSize:12,fontWeight:500,cursor:"pointer"}}>Print / PDF</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:12}}>
        {[{l:"Pain",k:"pain",c:"#D85A30",bg:"#FAECE7"},{l:"Mood",k:"mood",c:"#534AB7",bg:"#EEEDFE"},{l:"Sleep",k:"sleep",c:"#185FA5",bg:"#E6F1FB"},{l:"Social",k:"social",c:"#0F6E56",bg:"#E1F5EE"}].map(m=>(
          <div key={m.k} style={{background:m.bg,borderRadius:8,padding:"8px 5px",textAlign:"center" as any}}>
            <div style={{fontSize:10,color:"#555"}}>{m.l}</div>
            <div style={{fontSize:18,fontWeight:500,color:m.c}}>{avg(m.k)}</div>
          </div>
        ))}
      </div>
      {topR.length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 6px"}}>Most reported pain locations</p><div style={{display:"flex",flexWrap:"wrap" as any,gap:5}}>{topR.map(([id,{c,t}]:any)=>{const r=ALL_REGIONS.find((x:any)=>x.id===id),a=Math.round(t/c);return <span key={id} style={{display:"inline-flex",alignItems:"center",gap:4,background:"#FAECE7",color:"#993C1D",border:"1px solid #F0997B",borderRadius:20,padding:"2px 9px",fontSize:11}}><span style={{width:7,height:7,borderRadius:1,background:PAIN_COLORS[a-1],display:"inline-block"}}></span>{r?r.label:id} ({c}x)</span>;})} </div></div>}
      {Object.keys(tf).length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 6px"}}>Top triggers</p><div style={{display:"flex",flexWrap:"wrap" as any,gap:5}}>{Object.entries(tf).sort((a:any,b:any)=>b[1]-a[1]).map(([t,c]:any)=><span key={t} style={{background:"#FAECE7",color:"#D85A30",border:"1px solid #F0997B",borderRadius:20,padding:"2px 9px",fontSize:11}}>{t} ({c}x)</span>)}</div></div>}
      {Object.keys(ap).length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 6px"}}>Pharmacological</p><div style={{display:"flex",flexWrap:"wrap" as any,gap:5}}>{Object.entries(ap).sort((a:any,b:any)=>b[1]-a[1]).map(([n,c]:any)=><span key={n} style={{background:"#EEEDFE",color:"#534AB7",border:"1px solid #AFA9EC",borderRadius:20,padding:"2px 9px",fontSize:11}}>{n} ({c}x)</span>)}</div></div>}
      {Object.keys(an).length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 6px"}}>Non-pharmacological</p><div style={{display:"flex",flexWrap:"wrap" as any,gap:5}}>{Object.entries(an).sort((a:any,b:any)=>b[1]-a[1]).map(([n,c]:any)=><span key={n} style={{background:"#E1F5EE",color:"#0F6E56",border:"1px solid #5DCAA5",borderRadius:20,padding:"2px 9px",fontSize:11}}>{n} ({c}x)</span>)}</div></div>}
      {notes.length>0&&<div style={{marginBottom:10}}><p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 6px"}}>Patient notes</p>{notes.map((n:any,i:number)=><div key={i} style={{borderLeft:"2px solid #7F77DD",paddingLeft:10,marginBottom:6}}><p style={{fontSize:10,color:"#6b7280",margin:"0 0 2px"}}>{n.date}</p><p style={{fontSize:12,margin:0}}>{n.text}</p></div>)}</div>}
      <p style={{fontSize:12,fontWeight:500,color:"#6b7280",margin:"0 0 5px"}}>Day-by-day log</p>
      <div style={{overflowX:"auto" as any}}>
        <table style={{width:"100%",fontSize:11,borderCollapse:"collapse" as any}}>
          <thead><tr>{["Date","Pain","Mood","Sleep","Social","Exercise","Pain areas","Triggers"].map(h=><th key={h} style={{textAlign:"left" as any,padding:"3px 5px",fontWeight:500,borderBottom:"1px solid #e5e7eb",whiteSpace:"nowrap" as any,color:"#6b7280"}}>{h}</th>)}</tr></thead>
          <tbody>{sorted.map((e:any)=>{
            const pa=Object.entries(e.painMap||{}).filter(([,v]:any)=>v?.score>0).map(([id,v]:any)=>{const r=ALL_REGIONS.find((x:any)=>x.id===id);return(r?r.label:id)+"("+v.score+")";}).join(", ");
            return(<tr key={e.date}><td style={{padding:"3px 5px",color:"#6b7280"}}>{e.date.slice(5)}</td><td style={{padding:"3px 5px"}}>{e.pain||"—"}</td><td style={{padding:"3px 5px"}}>{e.mood||"—"}</td><td style={{padding:"3px 5px"}}>{e.sleep||"—"}</td><td style={{padding:"3px 5px"}}>{e.social||"—"}</td><td style={{padding:"3px 5px"}}>{e.exerciseMins?e.exerciseMins+"min":"—"}</td><td style={{padding:"3px 5px",fontSize:10,color:"#6b7280"}}>{pa||"—"}</td><td style={{padding:"3px 5px",fontSize:10,color:"#6b7280"}}>{(e.triggers||[]).join(", ")||"—"}</td></tr>);
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tax Tab ───────────────────────────────────────────────────────────────
function MonthGrid({ values, onChange, color }: any) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
      {MONTHS.map((m,i)=>(
        <div key={m}>
          <p style={{fontSize:10,color:"#9ca3af",margin:"0 0 2px"}}>{m}</p>
          <input type="number" placeholder="0.00" value={values[i]} onChange={e=>onChange(i,e.target.value)}
            style={{width:"100%",padding:"5px 6px",borderRadius:6,border:values[i]>0?"2px solid "+color:"1px solid #e5e7eb",fontSize:12,boxSizing:"border-box" as any}}/>
        </div>
      ))}
    </div>
  );
}

function TaxTab({ entries }: any) {
  const yr = new Date().getFullYear();
  const blankTax = () => ({medCosts:Array(12).fill(""),practitioners:[],otherItems:[]});
  const [data,setData]   = useState<any>(null);
  const [loaded,setLoaded] = useState(false);

  useEffect(()=>{ (async()=>{ const r=await stor.get(TAX_KEY); setData(r||blankTax()); setLoaded(true); })(); },[]);
  useEffect(()=>{ if(!loaded||!data) return; stor.set(TAX_KEY,data); },[data,loaded]);

  if(!loaded||!data) return <p style={{textAlign:"center" as any,color:"#6b7280",padding:"2rem"}}>Loading...</p>;

  const setField = (k:string,v:any) => setData((d:any)=>({...d,[k]:v}));
  const setMonth = (k:string,i:number,v:string) => { const a=[...data[k]]; a[i]=v; setField(k,a); };

  const medTotal   = data.medCosts.reduce((a:number,b:string)=>a+(parseFloat(b)||0),0);
  const practTotal = data.practitionerCosts.reduce((a:number,b:string)=>a+(parseFloat(b)||0),0);
  const otherTotal = data.otherCosts.reduce((a:number,b:string)=>a+(parseFloat(b)||0),0);

  const apptEntries = entries.filter((e:any)=>e.date.startsWith(yr.toString())&&e.apptKm>0);
  const travelKm    = apptEntries.reduce((a:number,e:any)=>a+(parseFloat(e.apptKm)||0),0);
  const travelClaim = travelKm*KM_RATE;
  const grandTotal  = medTotal+practTotal+otherTotal+travelClaim;
  const threshold   = Math.min(2635,grandTotal*0.03);
  const claimable   = Math.max(0,grandTotal-threshold);
  const fmt = (n:number) => "$"+n.toFixed(2);

  return (
    <div>
      <div style={{background:"#E1F5EE",border:"1px solid #5DCAA5",borderRadius:10,padding:"10px 14px",marginBottom:12}}>
        <p style={{fontSize:12,fontWeight:500,color:"#0F6E56",margin:"0 0 2px"}}>CRA Medical Expense Tracker — {yr}</p>
        <p style={{fontSize:11,color:"#0F6E56",margin:0}}>Track monthly costs for your yearly Ontario tax return. Always verify with a tax professional.</p>
      </div>

      <Box title="Appointment travel — auto-calculated from logs">
        {apptEntries.length===0?(
          <p style={{fontSize:11,color:"#9ca3af",fontStyle:"italic"}}>No travel logged yet. Add km in your daily log when visiting a practitioner.</p>
        ):(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              {[{l:"Total km",v:travelKm.toFixed(0)},{l:"Est. claim",v:fmt(travelClaim)},{l:"Visits",v:apptEntries.length}].map((s:any)=>(
                <div key={s.l} style={{background:"#E1F5EE",borderRadius:8,padding:"7px 10px",flex:1,textAlign:"center" as any}}>
                  <div style={{fontSize:10,color:"#0F6E56"}}>{s.l}</div>
                  <div style={{fontSize:16,fontWeight:500,color:"#0F6E56"}}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{maxHeight:120,overflowY:"auto" as any}}>
              {apptEntries.sort((a:any,b:any)=>b.date.localeCompare(a.date)).map((e:any)=>(
                <div key={e.date} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid #f3f4f6",fontSize:11}}>
                  <span style={{color:"#6b7280"}}>{e.date.slice(5)}</span>
                  <span>{e.apptPractitioner||"Appointment"}</span>
                  <span style={{color:"#0F6E56",fontWeight:500}}>{e.apptKm}km — {fmt(e.apptKm*KM_RATE)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Box>

      <Box title="Prescription & medication costs">
        <p style={{fontSize:11,color:"#9ca3af",margin:"0 0 8px"}}>Prescriptions, OTC if prescribed, supplements if prescribed</p>
        <MonthGrid values={data.medCosts} onChange={(i:number,v:string)=>setMonth("medCosts",i,v)} color="#D85A30"/>
        <p style={{fontSize:12,fontWeight:500,color:"#D85A30",margin:"8px 0 0"}}>Annual total: {fmt(medTotal)}</p>
      </Box>

      <Box title="Interprofessional care team costs">
        <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
          <span style={{fontSize:11,color:"#6b7280"}}>Type:</span>
          <select value={data.practitionerType} onChange={e=>setField("practitionerType",e.target.value)}
            style={{flex:1,padding:"5px 8px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:12}}>
            {PRACTITIONER_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <MonthGrid values={data.practitionerCosts} onChange={(i:number,v:string)=>setMonth("practitionerCosts",i,v)} color="#534AB7"/>
        <p style={{fontSize:12,fontWeight:500,color:"#534AB7",margin:"8px 0 0"}}>Annual total: {fmt(practTotal)}</p>
      </Box>

      <Box title="Other eligible medical expenses">
        <input placeholder="Label (e.g. Orthotics, TENS unit, medical devices)" value={data.otherLabel} onChange={e=>setField("otherLabel",e.target.value)}
          style={{width:"100%",padding:"7px 9px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:12,boxSizing:"border-box" as any,marginBottom:8}}/>
        <MonthGrid values={data.otherCosts} onChange={(i:number,v:string)=>setMonth("otherCosts",i,v)} color="#185FA5"/>
        <p style={{fontSize:12,fontWeight:500,color:"#185FA5",margin:"8px 0 0"}}>Annual total: {fmt(otherTotal)}</p>
      </Box>

      <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px 16px"}}>
        <p style={{fontWeight:500,fontSize:13,color:"#6b7280",margin:"0 0 10px"}}>Year-end summary — {yr}</p>
        {[{l:"Travel km claims",v:travelClaim,c:"#0F6E56"},{l:"Medication costs",v:medTotal,c:"#D85A30"},{l:"Care team costs",v:practTotal,c:"#534AB7"},{l:"Other medical",v:otherTotal,c:"#185FA5"}].map(r=>(
          <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
            <span style={{color:"#6b7280"}}>{r.l}</span>
            <span style={{fontWeight:500,color:r.c}}>{fmt(r.v)}</span>
          </div>
        ))}
        <div style={{borderTop:"1px solid #e5e7eb",paddingTop:8,marginTop:6}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
            <span style={{color:"#6b7280"}}>Total medical expenses</span>
            <span style={{fontWeight:500}}>{fmt(grandTotal)}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8}}>
            <span style={{color:"#9ca3af"}}>CRA threshold (est.)</span>
            <span style={{color:"#9ca3af"}}>- {fmt(threshold)}</span>
          </div>
          <div style={{background:"#E1F5EE",borderRadius:8,padding:"10px 12px",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:14,fontWeight:500,color:"#0F6E56"}}>Est. claimable amount</span>
            <span style={{fontSize:14,fontWeight:600,color:"#0F6E56"}}>{fmt(claimable)}</span>
          </div>
          <p style={{fontSize:10,color:"#9ca3af",margin:"6px 0 0"}}>Estimate only. Verify with a tax professional.</p>
        </div>
      </div>
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────
function SettingsTab() {
  const [settings,setSettings] = useState<any>({name:"",flareThreshold:7,reminders:false,reminderTime:"20:00"});
  const [loaded,setLoaded] = useState(false);
  const [saved,setSaved]   = useState(false);

  useEffect(()=>{ (async()=>{ const r=await stor.get(SETTINGS_KEY); if(r) setSettings(r); setLoaded(true); })(); },[]);

  const set = (k:string,v:any) => { setSettings((s:any)=>({...s,[k]:v})); setSaved(false); };
  const save = async () => { await stor.set(SETTINGS_KEY,settings); setSaved(true); };

  if(!loaded) return <p style={{color:"#6b7280",textAlign:"center" as any}}>Loading...</p>;

  return (
    <div>
      <Box title="Patient profile">
        <input placeholder="Your name (shown on reports)" value={settings.name} onChange={e=>set("name",e.target.value)}
          style={{width:"100%",padding:"7px 9px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:13,boxSizing:"border-box" as any}}/>
      </Box>

      <Box title="Flare-up alert threshold">
        <p style={{fontSize:11,color:"#6b7280",margin:"0 0 8px"}}>Alert when pain reaches this level for 2+ consecutive days</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap" as any}}>
          {[5,6,7,8,9,10].map(n=>(
            <button key={n} onClick={()=>set("flareThreshold",n)} style={{padding:"6px 14px",borderRadius:20,border:"1px solid "+(settings.flareThreshold===n?"#D85A30":"#e5e7eb"),background:settings.flareThreshold===n?"#FAECE7":"transparent",color:settings.flareThreshold===n?"#D85A30":"#6b7280",fontSize:12,cursor:"pointer",fontWeight:settings.flareThreshold===n?500:400}}>{n}/10</button>
          ))}
        </div>
      </Box>

      <Box title="Daily logging reminder">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:13}}>Enable daily reminder</span>
          <button onClick={()=>set("reminders",!settings.reminders)} style={{padding:"5px 14px",borderRadius:20,border:"1px solid "+(settings.reminders?"#1D9E75":"#e5e7eb"),background:settings.reminders?"#E1F5EE":"transparent",color:settings.reminders?"#1D9E75":"#6b7280",fontSize:12,cursor:"pointer"}}>
            {settings.reminders?"On":"Off"}
          </button>
        </div>
        {settings.reminders&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,color:"#6b7280"}}>Reminder time:</span>
            <input type="time" value={settings.reminderTime} onChange={e=>set("reminderTime",e.target.value)}
              style={{padding:"5px 8px",borderRadius:7,border:"1px solid #e5e7eb",fontSize:12}}/>
          </div>
        )}
        <p style={{fontSize:10,color:"#9ca3af",margin:"8px 0 0"}}>Note: Browser notifications require permission. Keep the app open or install it to your home screen for best results.</p>
      </Box>

      <Box title="About">
        <p style={{fontSize:11,color:"#6b7280",margin:0}}>ChronicPainForward v2.0</p>
        <p style={{fontSize:11,color:"#6b7280",margin:"4px 0 0"}}>Built for chronic pain patients by a nurse who understands.</p>
        <p style={{fontSize:11,color:"#6b7280",margin:"4px 0 0"}}>chronicpainforward.com</p>
      </Box>

      <button onClick={save} style={{width:"100%",padding:"11px",borderRadius:10,background:saved?"#1D9E75":"#534AB7",color:"#fff",border:"none",fontSize:14,fontWeight:500,cursor:"pointer"}}>
        {saved?"Settings saved":"Save settings"}
      </button>
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────
export default function App() {
  const [tab,setTab]         = useState(0);
  const [entries,setEntries] = useState<any[]>([]);
  const [loaded,setLoaded]   = useState(false);

  useEffect(()=>{ (async()=>{ const r=await stor.get(STORAGE_KEY); if(r) setEntries(r); setLoaded(true); })(); },[]);
  useEffect(()=>{ if(!loaded) return; stor.set(STORAGE_KEY,entries); },[entries,loaded]);

  return (
    <div style={{maxWidth:680,margin:"0 auto",padding:"1rem 1rem 2rem",fontFamily:"system-ui,sans-serif",background:"#f9fafb",minHeight:"100vh"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div>
          <h2 style={{fontWeight:600,fontSize:17,margin:"0 0 1px",color:"#534AB7"}}>ChronicPainForward</h2>
          <p style={{fontSize:11,color:"#9ca3af",margin:0}}>Daily living tracker</p>
        </div>
      </div>
      <div style={{display:"flex",gap:2,marginBottom:16,background:"#f3f4f6",borderRadius:10,padding:3,overflowX:"auto" as any}}>
        {TABS.map((t,i)=>(
          <button key={t} onClick={()=>setTab(i)} style={{flex:"0 0 auto",padding:"7px 10px",borderRadius:8,border:"none",background:tab===i?"#fff":"transparent",boxShadow:tab===i?"0 0 0 1px #e5e7eb":"none",color:tab===i?"#111":"#6b7280",fontSize:11,fontWeight:tab===i?500:400,cursor:"pointer",whiteSpace:"nowrap" as any}}>{t}</button>
        ))}
      </div>
      {!loaded?<p style={{textAlign:"center" as any,color:"#6b7280"}}>Loading...</p>:(
        <div>
          {tab===0&&<LogTab entries={entries} setEntries={setEntries}/>}
          {tab===1&&<TrendsTab entries={entries}/>}
          {tab===2&&<YearTab entries={entries}/>}
          {tab===3&&<ReportTab entries={entries}/>}
          {tab===4&&<TaxTab entries={entries}/>}
          {tab===5&&<SettingsTab/>}
          <div style={{marginTop:28,paddingTop:14,borderTop:"1px solid #e5e7eb",textAlign:"center" as any}}>
            <p style={{fontSize:10,color:"#9ca3af",margin:"0 0 2px"}}>Copyright 2025 Chronic Pain Forward. All rights reserved.</p>
            <p style={{fontSize:9,color:"#9ca3af",margin:0}}>Proprietary software. Unauthorized copying or distribution is prohibited.</p>
            <p style={{fontSize:9,color:"#9ca3af",margin:"3px 0 0"}}>chronicpainforward.com</p>
          </div>
        </div>
      )}
    </div>
  );
}
