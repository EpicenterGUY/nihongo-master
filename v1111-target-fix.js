// 日本語 MASTER v10.11.1 — JLPT target button hardening
(()=>{
"use strict";
const LEVELS=new Set(["N5","N4","N3","N2","N1"]);
const ONI_LEVELS=new Set(["N1+","MASTER I","MASTER II","MASTER III","深淵"]);

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
   syncLegacySelects(level);
   try{globalThis.setJLPTTarget?.(level)}catch(e){}
   document.querySelectorAll("[data-jlpt-target]").forEach(b=>{
    const on=b.dataset.jlptTarget===level;
    b.classList.toggle("active",on);
    b.setAttribute("aria-pressed",on?"true":"false");
   });
  }
 },120);

 return ok;
}
globalThis.chooseJLPTTarget=choose;

function chooseOni(level){
 if(!ONI_LEVELS.has(level))return;
 let ok=false;
 try{
  if(typeof globalThis.setOniTarget==="function"){globalThis.setOniTarget(level);ok=true}
  else if(typeof globalThis.nmkEnterOni==="function"){globalThis.nmkEnterOni(level);ok=true}
 }catch(err){console.error("Oni target switch recovered",err)}
 document.querySelectorAll("[data-oni-target]").forEach(b=>{
  const on=b.dataset.oniTarget===level;
  b.classList.toggle("active",on);
  b.setAttribute("aria-pressed",on?"true":"false");
 });
 if(ok)setTimeout(()=>window.dispatchEvent(new CustomEvent("nmk:modechange",{detail:{enabled:true,level}})),0);
 return ok;
}
globalThis.chooseOniTarget=chooseOni;

// Capture phase makes the level selector independent of dynamically rebuilt home HTML
// and of any stale bubble-phase listeners from older PWA caches.
document.addEventListener("click",e=>{
 const ob=e.target.closest?.("[data-oni-target]");
 if(ob){
  const level=ob.dataset.oniTarget;
  if(ONI_LEVELS.has(level)){e.preventDefault();e.stopImmediatePropagation();chooseOni(level);return}
 }
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
 const ob=e.target.closest?.("[data-oni-target]");
 if(ob){e.preventDefault();chooseOni(ob.dataset.oniTarget);return}
 const b=e.target.closest?.("[data-jlpt-target]");
 if(!b)return;
 e.preventDefault();
 choose(b.dataset.jlptTarget);
},true);

const style=document.createElement("style");
style.textContent=`
.v108-targets,.v108-target,.v112-oni-targets,.v112-oni-target{pointer-events:auto!important}
.v108-target{position:relative;z-index:2;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.v108-target:active{transform:scale(.97)}
`;
document.head.appendChild(style);
})();
