// 日本語 MASTER v10.11.1 — JLPT target button hardening
(()=>{
"use strict";
const LEVELS=new Set(["N5","N4","N3","N2","N1"]);

function selectedInDOM(level){
 const b=document.querySelector(`[data-jlpt-target="${level}"]`);
 return !!b?.classList.contains("active");
}
function persist(level){
 try{localStorage.setItem("nmk_jlpt_target",level)}catch(e){}
}
function syncLegacySelects(level){
 for(const id of ["learnLevel","quizLevel","libLevel"]){
  const el=document.getElementById(id);
  if(el&&[...el.options].some(o=>o.value===level))el.value=level;
 }
}
function choose(level){
 if(!LEVELS.has(level))return;
 persist(level);
 syncLegacySelects(level);

 let ok=false;
 try{
  if(typeof globalThis.setJLPTTarget==="function"){
   globalThis.setJLPTTarget(level);
   ok=true;
  }
 }catch(err){
  console.error("JLPT target switch recovered",err);
 }

 // Immediate visual feedback even on a slow phone.
 document.querySelectorAll("[data-jlpt-target]").forEach(b=>{
  b.classList.toggle("active",b.dataset.jlptTarget===level);
  b.setAttribute("aria-pressed",b.dataset.jlptTarget===level?"true":"false");
 });

 // If an older cached UI handler threw before updating its closure,
 // reload once from the persisted target rather than leaving a dead button.
 setTimeout(()=>{
  if(!selectedInDOM(level)){
   persist(level);
   location.reload();
  }
 },180);

 return ok;
}
globalThis.chooseJLPTTarget=choose;

// Capture phase makes the level selector independent of dynamically rebuilt home HTML
// and of any stale bubble-phase listeners from older PWA caches.
document.addEventListener("click",e=>{
 const b=e.target.closest?.("[data-jlpt-target]");
 if(!b)return;
 const level=b.dataset.jlptTarget;
 if(!LEVELS.has(level))return;
 e.preventDefault();
 e.stopImmediatePropagation();
 choose(level);
},true);

// Keyboard accessibility.
document.addEventListener("keydown",e=>{
 if(e.key!=="Enter"&&e.key!==" ")return;
 const b=e.target.closest?.("[data-jlpt-target]");
 if(!b)return;
 e.preventDefault();
 choose(b.dataset.jlptTarget);
},true);

const style=document.createElement("style");
style.textContent=`
.v108-targets,.v108-target{pointer-events:auto!important}
.v108-target{position:relative;z-index:2;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.v108-target:active{transform:scale(.97)}
`;
document.head.appendChild(style);
})();
