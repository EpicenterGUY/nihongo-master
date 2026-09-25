// 日本語 MASTER PWA helper v10.8.1
(()=>{
"use strict";
let deferredInstall=null;
const installCard=()=>document.getElementById("pwaInstallCard");
const installTop=()=>document.getElementById("pwaInstallTop");
const statusEl=()=>document.getElementById("pwaInstallStatus");
const standalone=()=>window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;

function setStatus(text){
 const s=statusEl(); if(s)s.textContent=text;
}
function renderInstallState(){
 const installed=standalone();
 const card=installCard(),top=installTop();
 if(card){
  card.classList.toggle("pwa-installed",installed);
  const b=card.querySelector("b");
  if(b)b.textContent=installed?"앱으로 설치됨":"앱으로 설치";
  setStatus(installed?"홈 화면에서 독립 앱처럼 실행 중":"홈 화면에 설치해서 앱처럼 사용");
 }
 if(top)top.style.display=installed?"none":(deferredInstall?"inline-grid":"none");
}
async function installApp(){
 if(standalone()){ if(typeof toast==="function")toast("이미 앱으로 설치되어 있어"); return; }
 if(deferredInstall){
  deferredInstall.prompt();
  const choice=await deferredInstall.userChoice.catch(()=>null);
  deferredInstall=null;
  renderInstallState();
  if(choice?.outcome==="accepted"&&typeof toast==="function")toast("설치를 시작했어");
  return;
 }
 const msg="브라우저 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택해줘.";
 if(typeof toast==="function")toast(msg); else alert(msg);
}
globalThis.installNihongoMaster=installApp;

window.addEventListener("beforeinstallprompt",e=>{
 e.preventDefault();deferredInstall=e;renderInstallState();
});
window.addEventListener("appinstalled",()=>{
 deferredInstall=null;renderInstallState();
 if(typeof toast==="function")toast("日本語 MASTER 설치 완료");
});

document.addEventListener("DOMContentLoaded",()=>{
 installCard()?.addEventListener("click",installApp);
 installTop()?.addEventListener("click",installApp);
 renderInstallState();
});

if("serviceWorker" in navigator){
 window.addEventListener("load",async()=>{
  try{
   const reg=await navigator.serviceWorker.register("./sw.js?v=10.8.1",{scope:"./"});
   await reg.update().catch(()=>{});
   const check=()=>reg.update().catch(()=>{});
   document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")check()});
   setInterval(check,60*60*1000);
  }catch(e){console.warn("PWA service worker registration failed",e)}
 });
}
})();