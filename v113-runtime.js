// 日本語 MASTER v10.13 — runtime consolidation and bug sweep
(()=>{
"use strict";
const NORMAL=new Set(["N5","N4","N3","N2","N1"]);
const CORE_TYPES=new Set(["vocab","grammar","kanji"]);

function oniState(){
 try{return globalThis.nmkGetOniState?.()||{enabled:false,level:"N1+"}}
 catch(e){return {enabled:false,level:"N1+"}}
}
function isSupplement(x){
 if(!x)return false;
 const id=String(x.id||"");
 return x.jlptSupplement===true || /^ext_[vgk]_/.test(id);
}
globalThis.nmkIsJLPTSupplement=isSupplement;

function normalizeReclassifiedMetadata(){
 for(const type of ["vocab","grammar","kanji"]){
  for(const x of DB[type]||[]){
   if(!NORMAL.has(x.level))continue;
   if(x.nuance && /N1\+|MASTER|초고급|심연/.test(String(x.nuance))){
    x.nuance=x.level+" 시험 대비 예상 범위. 뜻만 외우기보다 읽기·문맥·비슷한 표현을 함께 익혀.";
   }
   if(x.note && /N1\+|MASTER|초고급|심연/.test(String(x.note))){
    x.note=x.level+" 시험 대비 예상 범위. 실제 단어 속 읽기와 함께 확인해.";
   }
  }
 }
}
normalizeReclassifiedMetadata();

if(typeof itemsFor==="function"){
 const baseItemsFor=itemsFor;
 itemsFor=function(level,cat){
  let arr=baseItemsFor(level,cat);
  if(NORMAL.has(level)&&CORE_TYPES.has(cat))arr=arr.filter(x=>!isSupplement(x));
  return arr;
 };
}
if(typeof makeQuizPool==="function"){
 const baseQuizPool=makeQuizPool;
 makeQuizPool=function(level,cat){
  let arr=baseQuizPool(level,cat);
  if(NORMAL.has(level))arr=arr.filter(x=>!isSupplement(x));
  return arr;
 };
}
if(typeof reviewItems==="function"){
 const baseReviewItems=reviewItems;
 reviewItems=function(filter="all"){
  let arr=baseReviewItems(filter);
  if(!oniState().enabled)arr=arr.filter(x=>!isSupplement(x));
  return arr;
 };
}
if(typeof tablePool==="function"){
 const baseTablePool=tablePool;
 tablePool=function(){
  const arr=baseTablePool();
  return oniState().enabled?arr:arr.filter(x=>!isSupplement(x));
 };
}

if(typeof startLearn==="function"){
 const baseStartLearn=startLearn;
 startLearn=function(forceCat){
  if(oniState().enabled)return baseStartLearn(forceCat);
  try{navTo("learnmode")}catch(e){}
  const level=document.getElementById("learnLevel")?.value||localStorage.getItem("nmk_jlpt_target")||"N5";
  const cat=forceCat||document.getElementById("learnCat")?.value||"mixed";
  const size=Math.max(1,+(document.getElementById("learnSize")?.value||10));
  const pos=document.getElementById("learnPos")?.value||"전체";
  const cats=cat==="mixed"?["vocab","grammar","kanji"]:[cat];
  const pool=[];
  for(const type of cats){
   let arr=[];
   try{arr=itemsFor(level,type)}catch(e){arr=(DB[type]||[]).filter(x=>x.level===level&&!isSupplement(x))}
   if(type==="vocab"&&pos!=="전체"&&typeof normalizedPos==="function")arr=arr.filter(x=>normalizedPos(x)===pos);
   for(const x of arr)pool.push({...x,_type:type});
  }
  if(!pool.length){
   try{toast("이 조건의 검수된 학습 항목이 없어")}catch(e){}
   return;
  }
  pool.sort((a,b)=>{
   const sa=state.seen[a.id]||{},sb=state.seen[b.id]||{};
   return (sa.count||0)-(sb.count||0) || (b.jlptPriority||0)-(a.jlptPriority||0) || (sa.rating||0)-(sb.rating||0);
  });
  learnDeck=pool.slice(0,Math.min(size,pool.length));
  learnIndex=0;
  learnRevealed=false;
  renderLearnCard();
 };
}

function syncModeClass(){
 const o=oniState();
 document.body.classList.toggle("oni-mode",!!o.enabled);
 const banner=document.getElementById("oniBanner");
 if(banner){
  banner.style.display=o.enabled?"block":"none";
  if(o.enabled)banner.innerHTML="<b>👹 鬼級 · "+o.level+"</b><small>현재 학습·찾기·문제·복습은 "+o.level+" 단계만 사용해.</small>";
 }
 const entry=document.getElementById("oniStaticEntry");
 if(entry)entry.style.display=o.enabled?"none":"";
 const settings=document.getElementById("oniSettingsCard");
 if(settings)settings.style.display=o.enabled?"block":"none";
 const badge=document.querySelector(".brand .badge");
 if(badge)badge.textContent=o.enabled?"鬼 "+o.level:"v10.13";
}
globalThis.nmkSyncModeClass=syncModeClass;

function syncPageState(){
 const active=document.querySelector(".page.active");
 if(!active)return;
 const id=active.id;
 document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
 const titles={home:"JLPT 홈",learnmode:"JLPT 학습",reviewpage:"복습",quizpage:"문제풀이",more:"더보기",library:"학습자료",jlpt:"JLPT 로드맵",diagnosis:"급수 진단",stats:"통계",searchpage:"검색",dialects:"일본 방언"};
 const h=document.getElementById("pageTitle");
 if(h&&titles[id])h.textContent=titles[id];
 document.body.style.overflow="";
 document.querySelectorAll(".oni-static-overlay.show,.oni-entry-overlay.show").forEach(x=>x.classList.remove("show"));
}
globalThis.nmkSyncPageState=syncPageState;

if(typeof globalThis.navTo==="function"){
 const baseNav=globalThis.navTo;
 globalThis.navTo=function(id){
  const target=document.getElementById(id);
  if(!target){
   try{toast("페이지를 찾지 못했어")}catch(e){}
   return false;
  }
  let ok=true;
  try{baseNav(id)}catch(err){ok=false;console.error("navigation recovered",id,err)}
  requestAnimationFrame(()=>{
   if(!target.classList.contains("active")){
    document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p===target));
   }
   syncModeClass();
   syncPageState();
   if(id==="library")try{renderLibrary()}catch(e){}
   if(id==="reviewpage")try{renderReviewPage()}catch(e){}
  });
  return ok;
 };
}

window.addEventListener("nmk:modechange",()=>requestAnimationFrame(()=>{syncModeClass();syncPageState()}));
window.addEventListener("pageshow",()=>requestAnimationFrame(()=>{syncModeClass();syncPageState()}));
document.addEventListener("visibilitychange",()=>{
 if(document.visibilityState==="visible")requestAnimationFrame(()=>{syncModeClass();syncPageState()});
});
document.addEventListener("DOMContentLoaded",()=>requestAnimationFrame(()=>{syncModeClass();syncPageState()}));

document.addEventListener("click",e=>{
 const b=e.target.closest?.(".bottom [data-page]");
 if(!b)return;
 e.preventDefault();
 globalThis.navTo?.(b.dataset.page);
},false);

function injectOniExit(){
 const panel=document.querySelector("#home .v112-oni-target-panel");
 if(!panel||document.getElementById("v113OniExit"))return;
 const b=document.createElement("button");
 b.id="v113OniExit";
 b.type="button";
 b.className="secondary v113-oni-exit";
 b.textContent="일반 JLPT로";
 b.addEventListener("click",()=>globalThis.exitOniMode?.());
 panel.appendChild(b);
}
if(typeof MutationObserver!=="undefined"){
 const observer=new MutationObserver(()=>{syncModeClass();injectOniExit()});
 try{observer.observe(document.getElementById("home")||document.body,{childList:true,subtree:true})}catch(e){}
}
setTimeout(()=>{syncModeClass();syncPageState();injectOniExit()},0);

const style=document.createElement("style");
style.textContent=".v113-oni-exit{flex:0 0 auto;white-space:nowrap}.v112-oni-target-panel{flex-wrap:wrap}.v112-oni-target-panel .v108-targets{flex:1 1 420px}.bottom button,[data-jlpt-target],[data-oni-target],.v108-area-card,.more-card{touch-action:manipulation;-webkit-tap-highlight-color:transparent}@media(max-width:760px){.v113-oni-exit{width:100%}}";
document.head.appendChild(style);

syncModeClass();
syncPageState();
injectOniExit();
})();