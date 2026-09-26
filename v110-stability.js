// 日本語 MASTER v10.10 — navigation stability + Korean-only study guard
(()=>{
"use strict";
const NORMAL=new Set(["N5","N4","N3","N2","N1"]);

function isExternalGrammar(x){
 return !!x && (x.externalGrammar || String(x.id||"").startsWith("ext_g_"));
}
function isSupplementGrammar(x){
 return isExternalGrammar(x) && x.jlptSupplement!==false;
}
function grammarSafe(term){
 try{return EXT_GRAMMAR_KO_SAFE?.[String(term||"").trim()]||null}catch(e){return null}
}

// Drop stale machine translations that produced mixed strings such as school生des.
try{
 if(localStorage.getItem("nmk_korean_cleanup_v1010")!=="1"){
  const keys=[];
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("nmk_ko_"))keys.push(k)}
  keys.forEach(k=>localStorage.removeItem(k));
  localStorage.setItem("nmk_korean_cleanup_v1010","1");
 }
}catch(e){}

function sanitizeGrammarItem(x){
 if(!x||!NORMAL.has(x.level))return x;
 const safe=grammarSafe(x.term);
 if(safe){
  x.meaning=safe.meaning;
  x.koMeaning=safe.meaning;
  x.form=safe.form;
  x.nuance=safe.nuance;
  if(isExternalGrammar(x))x.jlptSupplement=false;
 }
 if(isExternalGrammar(x)){
  try{x.form=localizeExternalGrammarForm(x.form||"")}catch(e){}
  if(typeof hasLatin==="function"&&hasLatin(x.form||""))x.form="예문 속 접속 형태를 확인";
  if(typeof hasLatin==="function"&&hasLatin(x.nuance||""))x.nuance="";
  if(typeof hasLatin==="function"&&hasLatin(x.similar||""))x.similar="";
  if(!safe)x.jlptSupplement=true;
  x.tags=[...new Set([...(x.tags||[]),x.jlptSupplement?"보충문법":"한국어 검수"])];
 }
 return x;
}
function sanitizeVocabItem(x){
 if(!x||!NORMAL.has(x.level))return x;
 if(String(x.id||"").startsWith("ext_v_")){
  try{x.pos=koreanExternalPos(x.pos)}catch(e){}
 }
 return x;
}
function sanitizeNormalDB(){
 (DB.grammar||[]).forEach(sanitizeGrammarItem);
 (DB.vocab||[]).forEach(sanitizeVocabItem);
}
sanitizeNormalDB();

// Every later expansion merge is sanitized before it can appear in lessons.
if(typeof mergeExpansion==="function"){
 const mergeBeforeV1010=mergeExpansion;
 mergeExpansion=function(pack){
  if(pack?.grammar)pack.grammar.forEach(sanitizeGrammarItem);
  if(pack?.vocab)pack.vocab.forEach(sanitizeVocabItem);
  const r=mergeBeforeV1010(pack);
  sanitizeNormalDB();
  return r;
 };
}

// Exact Korean explanations take precedence over translation for audited grammar.
if(typeof ensureKoreanMeaning==="function"){
 const meaningBeforeV1010=ensureKoreanMeaning;
 ensureKoreanMeaning=async function(x){
  if(x&&NORMAL.has(x.level)){
   const safe=grammarSafe(x.term);
   if(safe){x.koMeaning=safe.meaning;return safe.meaning}
  }
  let ko=await meaningBeforeV1010(x);
  if(isExternalGrammar(x)&&typeof hasLatin==="function"&&hasLatin(ko||"")){
   // Long mixed machine output is worse than a short, honest fallback.
   const hangul=(String(ko).match(/[가-힣]/g)||[]).length;
   if(hangul<4)ko="한국어 뜻을 검수 중인 보충 문법";
   else ko=String(ko).replace(/[A-Za-z][A-Za-z0-9_.-]*/g,"").replace(/\s{2,}/g," ").trim();
   x.koMeaning=ko;
  }
  return ko;
 };
}
if(typeof ensureKoreanExample==="function"){
 const exampleBeforeV1010=ensureKoreanExample;
 ensureKoreanExample=async function(x){
  const ko=await exampleBeforeV1010(x);
  if(isExternalGrammar(x)&&typeof hasLatin==="function"&&hasLatin(ko||""))return "";
  return ko;
 };
}

// Main JLPT progress/roadmap counts only audited core grammar.
// Supplementary external patterns stay searchable in 학습자료 instead of being forced into the course.
if(typeof itemsFor==="function"){
 const itemsBeforeV1010=itemsFor;
 itemsFor=function(level,cat){
  const arr=itemsBeforeV1010(level,cat);
  if(NORMAL.has(level)&&cat==="grammar")return arr.filter(x=>!isSupplementGrammar(x));
  return arr;
 };
}
if(typeof makeQuizPool==="function"){
 const quizPoolBeforeV1010=makeQuizPool;
 makeQuizPool=function(level,cat){
  return quizPoolBeforeV1010(level,cat).filter(x=>!(NORMAL.has(level)&&x._type==="grammar"&&isSupplementGrammar(x)));
 };
}

// Final study launcher: normal JLPT lessons never accidentally pull unreviewed external grammar.
if(typeof startLearn==="function"){
 const oniStartBeforeV1010=startLearn;
 startLearn=function(forceCat){
  let oniOn=false;
  try{oniOn=!!globalThis.nmkGetOniState?.().enabled}catch(e){}
  if(oniOn)return oniStartBeforeV1010(forceCat);
  navTo("learnmode");
  const level=document.getElementById("learnLevel")?.value||"N5";
  const cat=forceCat||document.getElementById("learnCat")?.value||"mixed";
  const size=+(document.getElementById("learnSize")?.value||10);
  const cats=cat==="mixed"?["vocab","grammar","kanji"]:[cat],pool=[];
  for(const c of cats){
   let arr=[];
   try{arr=getFiltered(c,level)}catch(e){arr=(DB[c]||[]).filter(x=>x.level===level)}
   if(c==="grammar")arr=arr.filter(x=>!isSupplementGrammar(x));
   arr.forEach(x=>pool.push({...x,_type:c}));
  }
  if(!pool.length){toast("이 조건의 검수된 학습 데이터가 없어");return}
  pool.sort((a,b)=>{
   const ca=state.seen[a.id]?.count||0,cb=state.seen[b.id]?.count||0;
   const ra=state.seen[a.id]?.rating||0,rb=state.seen[b.id]?.rating||0;
   return ca-cb || (b.jlptPriority||0)-(a.jlptPriority||0) || ra-rb || Math.random()-.5;
  });
  learnDeck=pool.slice(0,Math.min(size,pool.length));learnIndex=0;
  renderLearnCard();
 };
}

// Robust navigation. One delegated handler works even after nav DOM is rebuilt.
const navBeforeV1010=navTo;
function directActivate(id){
 const page=document.getElementById(id);if(!page)return false;
 document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p===page));
 document.querySelectorAll("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
 const titles={home:"JLPT 홈",learnmode:"JLPT 학습",reviewpage:"복습",quizpage:"문제풀이",more:"더보기",library:"학습자료",jlpt:"JLPT 로드맵",diagnosis:"급수 진단",stats:"통계",searchpage:"검색"};
 const h=document.getElementById("pageTitle");if(h)h.textContent=titles[id]||"日本語 MASTER";
 try{if(id==="library")renderLibrary()}catch(e){}
 try{if(id==="reviewpage")renderReviewPage()}catch(e){}
 try{if(id==="stats")renderStats()}catch(e){}
 try{if(id==="diagnosis")updateLastDiagnosisSummary()}catch(e){}
 window.scrollTo({top:0,behavior:"smooth"});
 return true;
}
navTo=function(id){
 const page=document.getElementById(id);
 if(!page){console.warn("Unknown page",id);try{toast("페이지를 찾지 못했어")}catch(e){};return false}
 try{
  document.querySelectorAll(".oni-static-overlay.show").forEach(o=>o.classList.remove("show"));
  document.body.style.overflow="";
  navBeforeV1010(id);
 }catch(err){
  console.error("navigation recovered",id,err);
  directActivate(id);
 }
 requestAnimationFrame(()=>{
  if(!page.classList.contains("active"))directActivate(id);
 });
 return true;
};
globalThis.navTo=navTo;

// Capture data-page navigation before stale element listeners can conflict.
document.addEventListener("click",e=>{
 const b=e.target.closest?.("[data-page]");
 if(!b)return;
 const id=b.dataset.page;if(!id)return;
 e.preventDefault();
 e.stopImmediatePropagation();
 navTo(id);
},true);

// Buttons created by the v10.8 dashboard get a post-click navigation verification.
document.addEventListener("click",e=>{
 const b=e.target.closest?.("[data-v108-nav]");
 if(!b)return;
 const id=b.dataset.v108Nav;
 setTimeout(()=>{if(id&&document.getElementById(id)&&!document.getElementById(id).classList.contains("active"))navTo(id)},0);
});

// Top more button also gets a non-inline fallback.
document.addEventListener("click",e=>{
 if(e.target.closest?.('.top-actions button[title="더보기"]'))setTimeout(()=>{if(!document.getElementById("more")?.classList.contains("active"))navTo("more")},0);
});

const style=document.createElement("style");
style.textContent=`
button,[data-page],[data-v108-nav]{touch-action:manipulation}
.bottom,.side .nav,.top-actions{pointer-events:auto!important}
.bottom button,.side .nav button,.top-actions button{pointer-events:auto!important}
.oni-static-overlay:not(.show){pointer-events:none!important}
.page:not(.active){pointer-events:none!important}
.page.active{pointer-events:auto!important}
`;
document.head.appendChild(style);

try{renderRoad()}catch(e){}
try{updateUI()}catch(e){}
})();