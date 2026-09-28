// 日本語 MASTER v10.16 — Oni unit curriculum + Korean example prewarm
(()=>{
"use strict";

const LEVELS=["N1+","MASTER I","MASTER II","MASTER III","深淵"];
const UNIT_DEFS={
  "N1+":[
    {id:"modern",icon:"📰",title:"현대 논설 핵심",desc:"N1 다음 단계에서 자주 만나는 추상어·논설 표현을 묶어서 익혀.",cats:["vocab","grammar"],domains:["modern"]},
    {id:"academic",icon:"🎓",title:"학술·연구 문체",desc:"논문·비평·연구 문장에서 쓰이는 어휘와 문형을 집중해.",cats:["vocab","grammar"],domains:["academic"]},
    {id:"law",icon:"⚖️",title:"법률·행정 문체",desc:"공문·계약·재판·행정 문서에서 자주 보이는 표현을 정리해.",cats:["vocab","grammar"],domains:["law"]},
    {id:"grammar",icon:"🧩",title:"고밀도 문법",desc:"N1을 넘는 격식 문형과 논리 연결을 문맥 단위로 연습해.",cats:["grammar"],domains:[]},
    {id:"kanji",icon:"漢",title:"표외 읽기 입문",desc:"상급 문서에서 마주치는 표외·저빈도 한자를 단어와 함께 확인해.",cats:["kanji"],domains:[]}
  ],
  "MASTER I":[
    {id:"literary",icon:"✒️",title:"현대 문어·문학어",desc:"소설·평론·격식 문장에서 살아 있는 저빈도 문어를 다뤄.",cats:["vocab","grammar"],domains:["literary","modern"]},
    {id:"academic",icon:"🎓",title:"전문 추상어",desc:"학술·철학·비평 계열의 추상 개념어를 문맥과 함께 익혀.",cats:["vocab"],domains:["academic"]},
    {id:"kanji",icon:"漢",title:"표외 읽기 심화",desc:"표외 읽기와 난독 한자를 실제 단어 단위로 연결해.",cats:["kanji","vocab"],domains:[]}
  ],
  "MASTER II":[
    {id:"idiom",icon:"四",title:"사자숙어·고사",desc:"난해 사자숙어와 고사성어를 뜻만이 아니라 쓰임까지 연결해.",cats:["vocab"],domains:["idiom"]},
    {id:"kanbun",icon:"文",title:"한문투 문형",desc:"현대 일본어에 남은 한문투·격식 문형을 집중해서 읽어.",cats:["grammar","vocab"],domains:["classical"]},
    {id:"rare",icon:"🗝️",title:"희귀 문어",desc:"일반 회화에서는 드물지만 문헌·평론에서 남아 있는 표현을 다뤄.",cats:["vocab"],domains:["literary","modern"]}
  ],
  "MASTER III":[
    {id:"literary",icon:"📚",title:"본격 문학어",desc:"저빈도 문학어와 수사적 표현을 문장 단위로 익혀.",cats:["vocab"],domains:["literary"]},
    {id:"classical",icon:"古",title:"고전 문법",desc:"현대어와 연결되는 고전 활용·문법을 단계적으로 확인해.",cats:["grammar"],domains:["classical"]},
    {id:"documents",icon:"📜",title:"문헌 읽기",desc:"문헌어·고전적 문체를 어휘와 문법을 섞어 읽는 코스야.",cats:["vocab","grammar"],domains:["classical","literary"]}
  ],
  "深淵":[
    {id:"classical",icon:"📜",title:"고문헌 심층",desc:"극저빈도 문헌어와 고전 문형을 실제 출전 중심으로 다뤄.",cats:["vocab","grammar"],domains:["classical"]},
    {id:"kanbun",icon:"漢",title:"한문훈독·고전 한자",desc:"훈독과 고전적 한자 사용을 현대어 대응과 함께 확인해.",cats:["kanji","vocab"],domains:["classical"]},
    {id:"buddhist",icon:"☸️",title:"불교·고전 특수어",desc:"불교 문헌과 고전 텍스트에 남은 특수 어휘를 분리해서 익혀.",cats:["vocab"],domains:["buddhist"]},
    {id:"literary",icon:"🌑",title:"극희귀 문어",desc:"현대에서는 거의 쓰이지 않는 희귀 문어를 문헌 예문과 함께 확인해.",cats:["vocab"],domains:["literary"]}
  ]
};

function esc(v){
  try{return typeof escapeHtml==="function"?escapeHtml(v):String(v??"")}
  catch(_){return String(v??"")}
}
function oni(){
  try{return globalThis.nmkGetOniState?.()||{enabled:false,level:"N1+"}}
  catch(_){return {enabled:false,level:"N1+"}}
}
function domainOf(x){
  const pos=String(x?.pos||"");
  const tags=Array.isArray(x?.tags)?x.tags.join(" "):String(x?.tags||"");
  const blob=[pos,tags,x?.nuance,x?.meaning,x?.form,x?.note].map(v=>String(v||"")).join(" ");
  if(/불교|仏教|佛教|梵語/.test(blob))return "buddhist";
  if(/법률|행정|공문|계약|채무|재판|소송|법원|민법|형법|法令|契約|訴訟|債務/.test(blob))return "law";
  if(/학술|통계|철학|연구|이론|논리|비평|논문|학계|研究|理論|統計|哲学/.test(blob))return "academic";
  if(/사자숙어|고사성어|고사|四字熟語|故事/.test(blob))return "idiom";
  if(/고전|한문|훈독|문헌|고문|古典|漢文|訓読|文献|古文/.test(blob))return "classical";
  if(/문학|문예|수사|시문|文学|文芸|詩文/.test(blob))return "literary";
  return "modern";
}
function rowsFor(level,unit){
  const rows=[];
  for(const cat of unit.cats){
    let arr=(globalThis.DB?.[cat]||[]);
    if(!arr.length&&typeof DB!=="undefined")arr=(DB[cat]||[]);
    arr=arr.filter(x=>{
      if(cat==="kanji"&&level!=="N1+"&&level!=="MASTER I"){
        return x.level===level||x.level==="MASTER";
      }
      return x.level===level;
    });
    if(unit.domains.length)arr=arr.filter(x=>unit.domains.includes(domainOf(x)));
    arr.forEach(x=>rows.push({...x,_type:cat}));
  }
  // Very narrow metadata can produce an empty specialist unit; fall back to the same category,
  // but only when the unit has fewer than four usable cards.
  if(rows.length<4&&unit.domains.length){
    for(const cat of unit.cats){
      let arr=(typeof DB!=="undefined"&&DB[cat])?DB[cat]:[];
      arr=arr.filter(x=>cat==="kanji"&&level!=="N1+"&&level!=="MASTER I"?(x.level===level||x.level==="MASTER"):x.level===level);
      arr.slice(0,18).forEach(x=>{if(!rows.some(y=>y.id===x.id))rows.push({...x,_type:cat,__domainFallback:true})});
    }
  }
  return rows;
}
function progress(rows){
  const seen=rows.filter(x=>state?.seen?.[x.id]?.count>0).length;
  const mastered=rows.filter(x=>(state?.seen?.[x.id]?.rating||0)>=3).length;
  return {seen,mastered,total:rows.length,pct:rows.length?Math.round(seen/rows.length*100):0};
}
function unitCard(level,u){
  const rows=rowsFor(level,u),p=progress(rows);
  return '<button type="button" class="v1016-unit" data-v1016-unit="'+esc(u.id)+'" data-v1016-level="'+esc(level)+'">'+
    '<span class="v1016-unit-icon">'+u.icon+'</span><span class="v1016-unit-copy"><b>'+esc(u.title)+'</b><small>'+esc(u.desc)+'</small>'+
    '<span class="v1016-unit-meta">'+p.seen+'/'+p.total+' 학습 · '+p.mastered+' 숙달</span><span class="v1016-unit-bar"><i style="width:'+p.pct+'%"></i></span></span>'+
    '<span class="v1016-unit-go">›</span></button>';
}
function ensureHosts(){
  const homePanel=document.getElementById("oniHomePanel");
  if(homePanel&&!document.getElementById("v1016OniCurriculum")){
    const sec=document.createElement("section");sec.id="v1016OniCurriculum";sec.className="v1016-curriculum";homePanel.insertAdjacentElement("afterend",sec);
  }
  const road=document.getElementById("jlpt");
  if(road&&!document.getElementById("v1016OniRoad")){
    const sec=document.createElement("section");sec.id="v1016OniRoad";sec.className="v1016-curriculum v1016-road";const intro=document.getElementById("oniRoadIntro");
    if(intro)intro.insertAdjacentElement("afterend",sec);else road.prepend(sec);
  }
}
function render(){
  ensureHosts();
  const o=oni(),units=UNIT_DEFS[o.level]||UNIT_DEFS["N1+"];
  for(const id of ["v1016OniCurriculum","v1016OniRoad"]){
    const host=document.getElementById(id);if(!host)continue;
    if(!o.enabled){host.innerHTML="";host.hidden=true;continue}
    host.hidden=false;
    const label=id==="v1016OniRoad"?"단원형 오니 로드맵":"오늘의 단원 코스";
    host.innerHTML='<div class="v1016-head"><div><small>STRUCTURED COURSE · '+esc(o.level)+'</small><h3>'+label+'</h3><p>어휘·문법·한자를 무작위로만 보지 않고 분야별 단원으로 나눠 순서 있게 공부해.</p></div><div class="v1016-cache" id="'+id+'Cache">예문 준비 중</div></div>'+
      '<div class="v1016-grid">'+units.map(u=>unitCard(o.level,u)).join("")+'</div>';
  }
}
function startUnit(level,id){
  const unit=(UNIT_DEFS[level]||[]).find(x=>x.id===id);if(!unit)return;
  const go=()=>{
    const rows=rowsFor(level,unit);
    if(!rows.length){try{toast("이 단원에 학습할 항목이 없어")}catch(_){}return}
    rows.sort((a,b)=>{
      const ac=state?.seen?.[a.id]?.count||0,bc=state?.seen?.[b.id]?.count||0;
      const ar=state?.seen?.[a.id]?.rating||0,br=state?.seen?.[b.id]?.rating||0;
      return ac-bc||ar-br||Math.random()-.5;
    });
    try{navTo("learnmode")}catch(_){}
    try{setStudyView("card")}catch(_){}
    const lv=document.getElementById("learnLevel");if(lv&&[...lv.options].some(o=>o.value===level))lv.value=level;
    const ct=document.getElementById("learnCat");if(ct)ct.value=unit.cats.length===1?unit.cats[0]:"mixed";
    const size=Math.max(10,Math.min(24,Number(document.getElementById("learnSize")?.value)||20));
    try{
      learnDeck=rows.slice(0,Math.min(size,rows.length));
      learnIndex=0;
      renderLearnCard();
      toast(unit.title+" · "+learnDeck.length+"개 시작");
    }catch(e){
      console.warn("v10.16 unit start failed",e);
      try{startLearn(unit.cats.length===1?unit.cats[0]:undefined)}catch(_){}
    }
  };
  const o=oni();
  if(!o.enabled||o.level!==level){
    try{globalThis.nmkEnterOni?.(level)}catch(_){}
    setTimeout(go,90);
  }else go();
}
function cacheBadge(text){
  document.querySelectorAll(".v1016-cache").forEach(x=>x.textContent=text);
}
let warmToken=0;
function prewarm(level){
  if(!LEVELS.includes(level))return;
  if(navigator.connection?.saveData){cacheBadge("데이터 절약 모드");return}
  const token=++warmToken;
  let rows=[];
  for(const cat of ["vocab","grammar","kanji"]){
    let arr=(typeof DB!=="undefined"&&DB[cat])?DB[cat]:[];
    arr.filter(x=>cat==="kanji"&&level!=="N1+"&&level!=="MASTER I"?(x.level===level||x.level==="MASTER"):x.level===level).forEach(x=>rows.push(x));
  }
  const uniq=[];const seen=new Set();
  for(const x of rows){if(x?.id&&!seen.has(x.id)){seen.add(x.id);uniq.push(x)}}
  const queue=uniq.filter(x=>{
    const meaning=String(x.koMeaning||x.meaning||"");
    const kr=String(x.koExample||x.kr||"");
    return /[A-Za-z]/.test(meaning)||/[A-Za-z]/.test(kr);
  }).slice(0,120);
  if(!queue.length){cacheBadge("한국어 예문 준비됨");return}
  let done=0;
  cacheBadge("한국어 예문 0/"+queue.length);
  const idle=globalThis.requestIdleCallback||((fn)=>setTimeout(()=>fn({timeRemaining:()=>20}),80));
  const run=async()=>{
    if(token!==warmToken)return;
    const batch=queue.slice(done,done+6);
    for(const x of batch){
      try{if(typeof ensureKoreanMeaning==="function")await ensureKoreanMeaning(x)}catch(_){}
      try{if(typeof ensureKoreanExample==="function")await ensureKoreanExample(x)}catch(_){}
      done++;
    }
    cacheBadge(done>=queue.length?"한국어 예문 준비됨":"한국어 예문 "+done+"/"+queue.length);
    if(done<queue.length)idle(run);
  };
  idle(run);
}
function sync(){
  render();
  const o=oni();if(o.enabled)prewarm(o.level);
}

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-v1016-unit]");if(!b)return;
  startUnit(b.dataset.v1016Level,b.dataset.v1016Unit);
});
window.addEventListener("nmk:modechange",()=>setTimeout(sync,40));
window.addEventListener("pageshow",()=>setTimeout(sync,60));
const mo=new MutationObserver(()=>{
  if(!document.getElementById("v1016OniCurriculum")||!document.getElementById("v1016OniRoad"))ensureHosts();
});
mo.observe(document.body,{childList:true,subtree:true});

const style=document.createElement("style");
style.id="v1016Style";
style.textContent=`
.v1016-curriculum{margin:14px 0;padding:16px;border:1px solid #e6d2d9;border-radius:20px;background:linear-gradient(145deg,#fff,#fff8fa)}
.v1016-curriculum[hidden]{display:none!important}.v1016-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:11px}
.v1016-head small{display:block;color:#8f4761;font-size:10px;font-weight:950;letter-spacing:.08em}.v1016-head h3{margin:4px 0 4px;font-size:20px}.v1016-head p{margin:0;color:var(--muted);font-size:12px;line-height:1.55}
.v1016-cache{flex:0 0 auto;padding:7px 9px;border-radius:999px;background:#f5e8ed;color:#7a3e53;font-size:10px;font-weight:900}
.v1016-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.v1016-unit{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;border:1px solid #ead8de;background:#fff;border-radius:15px;padding:12px;text-align:left;color:inherit}
.v1016-unit:hover{border-color:#c991a4;transform:translateY(-1px)}.v1016-unit-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:#f7edf1;font-size:18px}.v1016-unit-copy{min-width:0}.v1016-unit-copy b,.v1016-unit-copy small,.v1016-unit-meta{display:block}.v1016-unit-copy b{font-size:13px}.v1016-unit-copy small{margin-top:3px;color:var(--muted);font-size:10px;line-height:1.45}.v1016-unit-meta{margin-top:6px;color:#84576a;font-size:9px;font-weight:850}.v1016-unit-bar{display:block;height:5px;margin-top:6px;background:#f0e3e8;border-radius:99px;overflow:hidden}.v1016-unit-bar i{display:block;height:100%;background:#8e3654}.v1016-unit-go{font-size:23px;color:#92536a}
.v1016-road{margin-top:0}
@media(max-width:680px){.v1016-curriculum{padding:13px}.v1016-head{display:block}.v1016-cache{display:inline-block;margin-top:8px}.v1016-grid{grid-template-columns:1fr}.v1016-unit{padding:11px}.v1016-unit-copy small{font-size:9.5px}}
`;
document.head.appendChild(style);

globalThis.nmkOniCurriculum1016={render:sync,startUnit,rowsFor,domainOf};
sync();
})();
