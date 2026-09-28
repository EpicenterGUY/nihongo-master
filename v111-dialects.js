// 日本語 MASTER v10.11 — Oni-only dialect atlas UI
(()=>{
"use strict";
const GROUPS=globalThis.NMK_V111_DIALECT_GROUPS||[];
const DIALECTS=globalThis.NMK_V111_DIALECTS||[];
let familyFilter="전체",groupFilter="전체",query="",selectedId=DIALECTS[0]?.id||"";
let drill=[],drillIndex=0,drillAnswer=false;

function esc(s){return typeof escapeHtml==="function"?escapeHtml(s):String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function oni(){try{return globalThis.nmkGetOniState?.()||{enabled:false,level:"N1+"}}catch(e){return {enabled:false,level:"N1+"}}}
function groupOf(id){return GROUPS.find(g=>g.id===id)||null}
function familyOf(x){return groupOf(x.group)?.family||""}
function koreanPref(s){const m={"北海道":"홋카이도","青森":"아오모리","岩手":"이와테","宮城":"미야기","秋田":"아키타","山形":"야마가타","福島":"후쿠시마","茨城":"이바라키","栃木":"도치기","群馬":"군마","埼玉":"사이타마","千葉":"지바","東京":"도쿄","神奈川":"가나가와","新潟":"니가타","富山":"도야마","石川":"이시카와","福井":"후쿠이","山梨":"야마나시","長野":"나가노","岐阜":"기후","静岡":"시즈오카","愛知":"아이치","三重":"미에","滋賀":"시가","京都":"교토","大阪":"오사카","兵庫":"효고","奈良":"나라","和歌山":"와카야마","鳥取":"돗토리","島根":"시마네","岡山":"오카야마","広島":"히로시마","山口":"야마구치","徳島":"도쿠시마","香川":"가가와","愛媛":"에히메","高知":"고치","福岡":"후쿠오카","佐賀":"사가","長崎":"나가사키","熊本":"구마모토","大分":"오이타","宮崎":"미야자키","鹿児島":"가고시마","沖縄":"오키나와"};return m[s]||s}
function prefsText(x){return (x.prefs||[]).map(p=>koreanPref(p)).join(" · ")}

function ensurePage(){
 if(document.getElementById("dialects"))return;
 const main=document.querySelector("main.main");if(!main)return;
 const page=document.createElement("section");
 page.id="dialects";page.className="page";
 page.innerHTML=`
  <div class="v111-head">
   <div><span class="v111-kicker">👹 鬼級 · 일본 지역어</span><h2>🗾 일본 방언 도감</h2><p>전국 주요 방언권과 지역 변종을 한국어로 비교해. 공통어와 무엇이 다른지 중심으로 정리했어.</p></div>
   <button class="secondary" type="button" id="v111Back">← 오니 홈</button>
  </div>
  <div class="v111-notice">
   <b>분류 읽는 법</b>
   <span>방언 경계는 현 경계처럼 딱 끊기지 않고 서서히 변해. 같은 지역도 세대·마을·상황에 따라 다르므로, 카드의 표현은 ‘대표 예’로 봐야 해.</span>
  </div>
  <div class="v111-stats" id="v111Stats"></div>
  <div class="v111-tools card">
   <div class="v111-family" id="v111Family"></div>
   <div class="v111-searchrow"><input id="v111Search" type="search" placeholder="지역·현·표현 검색 (예: 오사카, 沖縄, だっぺ)"><button class="primary" id="v111Drill" type="button">🎴 표현 10개</button></div>
   <div class="v111-groups" id="v111Groups"></div>
  </div>
  <div id="v111DrillBox"></div>
  <div class="v111-layout">
   <div class="v111-list card" id="v111List"></div>
   <div class="v111-detail card" id="v111Detail"></div>
  </div>
  <div class="v111-source card">
   <b>범위 기준</b><p>전국 대분류는 국립국어연구소가 소개하는 본토 방언(동부·서부·규슈)과 류큐 방언의 구분을 바탕으로 하고, 류큐 지역은 아마미·오키나와·미야코·야에야마·요나구니를 별도 카드로 나눴어. 류큐 제어와 하치조어는 현대 언어학에서 ‘일본어의 한 방언’보다 별개의 일본어족 언어로 다루는 견해도 있어, 앱에서도 그 점을 명확히 표시해.</p>
  </div>`;
 main.appendChild(page);
 document.getElementById("v111Back")?.addEventListener("click",()=>navTo("home"));
 document.getElementById("v111Search")?.addEventListener("input",e=>{query=e.target.value.trim();renderList()});
 document.getElementById("v111Drill")?.addEventListener("click",startDrill);
}

function renderStats(){
 const el=document.getElementById("v111Stats");if(!el)return;
 const pref=new Set(DIALECTS.flatMap(x=>x.prefs||[]));
 const expressions=DIALECTS.reduce((n,x)=>n+(x.examples?.length||0),0);
 el.innerHTML=`
  <div><small>대분류</small><b>${GROUPS.length}</b><span>방언권·지역 언어</span></div>
  <div><small>지역 카드</small><b>${DIALECTS.length}</b><span>전국 세부 지역</span></div>
  <div><small>도도부현</small><b>${pref.size}/47</b><span>전국 커버</span></div>
  <div><small>비교 표현</small><b>${expressions}</b><span>방언→공통어→한국어</span></div>`;
}
function renderFamilies(){
 const el=document.getElementById("v111Family");if(!el)return;
 const fams=["전체","동부","서부","규슈","류큐"];
 el.innerHTML=fams.map(f=>`<button type="button" class="${familyFilter===f?"active":""}" data-v111-family="${f}">${f==="전체"?"전국":f==="류큐"?"류큐·지역언어":f+" 방언"}</button>`).join("");
}
function renderGroups(){
 const el=document.getElementById("v111Groups");if(!el)return;
 const gs=GROUPS.filter(g=>familyFilter==="전체"||g.family===familyFilter);
 el.innerHTML=`<button type="button" class="${groupFilter==="전체"?"active":""}" data-v111-group="전체">전체</button>`+
 gs.map(g=>`<button type="button" class="${groupFilter===g.id?"active":""}" data-v111-group="${g.id}">${esc(g.ko)}</button>`).join("");
}
function filtered(){
 const q=query.toLowerCase();
 return DIALECTS.filter(x=>{
  if(familyFilter!=="전체"&&familyOf(x)!==familyFilter)return false;
  if(groupFilter!=="전체"&&x.group!==groupFilter)return false;
  if(!q)return true;
  const blob=[x.name,x.ko,x.area,x.summary,(x.prefs||[]).join(" "),(x.features||[]).join(" "),(x.examples||[]).flat().join(" ")].join(" ").toLowerCase();
  return blob.includes(q);
 });
}
function renderList(){
 const el=document.getElementById("v111List");if(!el)return;
 const arr=filtered();
 if(!arr.length){el.innerHTML='<div class="v111-empty">조건에 맞는 방언이 없어.</div>';document.getElementById("v111Detail").innerHTML="";return}
 if(!arr.some(x=>x.id===selectedId))selectedId=arr[0].id;
 el.innerHTML=`<div class="v111-listhead"><b>${arr.length}개 지역</b><small>눌러서 공통어와 비교</small></div>`+
 arr.map(x=>{const g=groupOf(x.group);return `<button type="button" class="v111-row ${selectedId===x.id?"active":""}" data-v111-id="${x.id}">
  <div><span class="v111-familytag">${esc(g?.family||"")}</span><b>${esc(x.ko)}</b><small class="jp">${esc(x.name)}</small></div>
  <span class="v111-place">${esc(prefsText(x))}</span>
 </button>`}).join("");
 renderDetail();
}
function renderDetail(){
 const el=document.getElementById("v111Detail");if(!el)return;
 const x=DIALECTS.find(v=>v.id===selectedId);if(!x){el.innerHTML="";return}
 const g=groupOf(x.group);
 const examples=(x.examples||[]).length?x.examples.map(e=>`<div class="v111-example"><strong class="jp">${esc(e[0])}</strong><span><b>공통어</b> <span class="jp">${esc(e[1])}</span></span><span><b>한국어</b> ${esc(e[2])}</span></div>`).join(""):'<div class="v111-noexample">이 지역은 내부 차이가 커서 대표 문장을 억지로 하나로 고정하지 않았어. 특징 설명을 중심으로 봐.</div>';
 el.innerHTML=`
  <div class="v111-detailtop"><div><span class="v111-familytag">${esc(g?.family||"")} · ${esc(g?.ko||"")}</span><h2>${esc(x.ko)}</h2><div class="jp v111-jpname">${esc(x.name)}</div></div><div class="v111-pref">${esc(prefsText(x))}</div></div>
  <p class="v111-area">📍 ${esc(x.area)}</p>
  <p class="v111-summary">${esc(x.summary)}</p>
  <div class="v111-featurebox"><b>핵심 특징</b><ul>${(x.features||[]).map(v=>`<li>${esc(v)}</li>`).join("")}</ul></div>
  <div class="v111-examplehead"><b>대표 표현 비교</b><small>지역·세대에 따라 달라질 수 있음</small></div>
  <div class="v111-examples">${examples}</div>
  ${x.note?`<div class="v111-note"><b>주의</b> ${esc(x.note)}</div>`:""}
  <button class="secondary v111-up" type="button" data-v111-up>↑ 목록으로</button>`;
}
function renderAll(){
 ensurePage();renderStats();renderFamilies();renderGroups();renderList();
}

function startDrill(){
 const pool=DIALECTS.flatMap(d=>(d.examples||[]).map(e=>({dialect:d,phrase:e[0],standard:e[1],ko:e[2]})));
 if(!pool.length)return;
 drill=[...pool].sort(()=>Math.random()-.5).slice(0,Math.min(10,pool.length));drillIndex=0;drillAnswer=false;renderDrill();
}
function renderDrill(){
 const box=document.getElementById("v111DrillBox");if(!box)return;
 if(!drill.length){box.innerHTML="";return}
 if(drillIndex>=drill.length){
  box.innerHTML=`<div class="card v111-drill done"><div>🗾</div><h3>방언 표현 10개 완료</h3><button type="button" class="primary" data-v111-restart>다시 10개</button><button type="button" class="secondary" data-v111-close>도감으로</button></div>`;return;
 }
 const q=drill[drillIndex];
 box.innerHTML=`<div class="card v111-drill">
   <div class="v111-drilltop"><span>${drillIndex+1} / ${drill.length}</span><b>${esc(q.dialect.ko)}</b></div>
   <div class="v111-drillphrase jp">${esc(q.phrase)}</div>
   ${drillAnswer?`<div class="v111-answer"><span><b>공통어</b><span class="jp">${esc(q.standard)}</span></span><span><b>한국어</b>${esc(q.ko)}</span></div><button type="button" class="primary" data-v111-next>다음 →</button>`:`<p>이 표현이 무슨 뜻인지 생각해 봐.</p><button type="button" class="primary" data-v111-reveal>뜻 보기</button>`}
  </div>`;
 box.scrollIntoView({behavior:"smooth",block:"start"});
}
function closeDrill(){drill=[];drillIndex=0;drillAnswer=false;const b=document.getElementById("v111DrillBox");if(b)b.innerHTML=""}

function syncAccess(){
 ensurePage();
 const on=oni().enabled;
 document.querySelectorAll(".v111-entry").forEach(x=>x.remove());
 if(on){
  const grid=document.querySelector("#home .v108-area-grid");
  if(grid&&!document.getElementById("v111HomeEntry")){
   const b=document.createElement("button");b.type="button";b.id="v111HomeEntry";b.className="v108-area-card v111-entry";
   b.innerHTML='<div class="v108-area-icon">🗾</div><div class="v108-area-body"><b>일본 방언</b><small>전국 방언·지역 언어 도감</small><em>한국어 설명 · 공통어 비교</em></div>';
   b.addEventListener("click",openDialectAtlas);grid.appendChild(b);
  }
  const more=document.querySelector("#more .more-grid");
  if(more&&!document.getElementById("v111MoreEntry")){
   const b=document.createElement("button");b.type="button";b.id="v111MoreEntry";b.className="more-card v111-entry";
   b.innerHTML="<span>🗾</span><b>일본 방언 도감</b><small>전국 방언권·류큐 지역 언어</small>";b.addEventListener("click",openDialectAtlas);more.prepend(b);
  }
  const side=document.querySelector(".side .nav");
  if(side&&!document.getElementById("v111SideEntry")){
   const b=document.createElement("button");b.type="button";b.id="v111SideEntry";b.className="v111-entry";b.dataset.page="dialects";b.textContent="🗾 방언";side.appendChild(b);
  }
 }else{
  if(document.getElementById("dialects")?.classList.contains("active")){
   try{navTo("home")}catch(e){}
  }
 }
}
function openDialectAtlas(){
 if(!oni().enabled){try{toast("방언 도감은 오니 모드에서 열 수 있어")}catch(e){};navTo("more");return}
 renderAll();navTo("dialects");const h=document.getElementById("pageTitle");if(h)h.textContent="일본 방언";
}
globalThis.openDialectAtlas=openDialectAtlas;

document.addEventListener("click",e=>{
 const f=e.target.closest?.("[data-v111-family]");if(f){familyFilter=f.dataset.v111Family;groupFilter="전체";renderFamilies();renderGroups();renderList();return}
 const g=e.target.closest?.("[data-v111-group]");if(g){groupFilter=g.dataset.v111Group;renderGroups();renderList();return}
 const r=e.target.closest?.("[data-v111-id]");if(r){selectedId=r.dataset.v111Id;renderList();if(matchMedia("(max-width:900px)").matches)document.getElementById("v111Detail")?.scrollIntoView({behavior:"smooth",block:"start"});return}
 if(e.target.closest?.("[data-v111-up]")){document.getElementById("v111List")?.scrollIntoView({behavior:"smooth",block:"start"});return}
 if(e.target.closest?.("[data-v111-reveal]")){drillAnswer=true;renderDrill();return}
 if(e.target.closest?.("[data-v111-next]")){drillIndex++;drillAnswer=false;renderDrill();return}
 if(e.target.closest?.("[data-v111-restart]")){startDrill();return}
 if(e.target.closest?.("[data-v111-close]")){closeDrill();return}
});

const oldNav=globalThis.navTo;
globalThis.navTo=function(id){
 if(id==="dialects"&&!oni().enabled){try{toast("방언 도감은 오니 모드 전용이야")}catch(e){};id="more"}
 const r=oldNav(id);
 if(id==="dialects"){renderAll();const h=document.getElementById("pageTitle");if(h)h.textContent="일본 방언"}
 setTimeout(syncAccess,0);
 return r;
};

const style=document.createElement("style");
style.textContent=`
#dialects{max-width:1180px;margin:0 auto}.v111-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:12px}.v111-head h2{font-size:30px;margin:4px 0 5px}.v111-head p{margin:0;color:var(--muted);line-height:1.55}.v111-kicker{font-size:12px;font-weight:950;color:#8b3453}
.v111-notice{background:#fff6e9;border:1px solid #eedcc7;border-radius:16px;padding:12px 14px;display:flex;gap:10px;line-height:1.5;margin-bottom:10px}.v111-notice b{white-space:nowrap}.v111-notice span{color:#655d56;font-size:12px}
.v111-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}.v111-stats>div{background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px}.v111-stats small,.v111-stats span,.v111-stats b{display:block}.v111-stats small,.v111-stats span{color:var(--muted);font-size:10px}.v111-stats b{font-size:22px;margin:2px 0}
.v111-tools{padding:13px;margin-bottom:10px}.v111-family,.v111-groups{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:3px}.v111-family::-webkit-scrollbar,.v111-groups::-webkit-scrollbar{display:none}.v111-family button,.v111-groups button{flex:0 0 auto;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 11px;font-weight:900;font-size:12px}.v111-family button.active,.v111-groups button.active{background:#65243d;color:#fff;border-color:#65243d}
.v111-searchrow{display:grid;grid-template-columns:1fr auto;gap:8px;margin:10px 0}.v111-searchrow input{width:100%;border:1px solid var(--line);border-radius:12px;padding:11px;background:#fff}
.v111-layout{display:grid;grid-template-columns:340px 1fr;gap:10px;align-items:start}.v111-list{padding:8px;max-height:72vh;overflow:auto}.v111-listhead{display:flex;justify-content:space-between;align-items:center;padding:8px}.v111-listhead small{color:var(--muted);font-size:10px}
.v111-row{width:100%;border:0;border-bottom:1px solid #f0e7df;background:transparent;padding:10px;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:8px;border-radius:10px}.v111-row:hover,.v111-row.active{background:#fff4f6}.v111-row b,.v111-row small{display:block}.v111-row b{margin:3px 0 1px}.v111-row small{color:var(--muted)}.v111-familytag{display:inline-block;font-size:9px;font-weight:950;color:#873451;background:#f7e8ed;border-radius:999px;padding:3px 6px}.v111-place{font-size:9px;color:var(--muted);max-width:105px;text-align:right}
.v111-detail{padding:20px;position:sticky;top:10px}.v111-detailtop{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.v111-detail h2{font-size:28px;margin:7px 0 0}.v111-jpname{color:var(--muted);margin-top:2px}.v111-pref{font-size:11px;font-weight:850;color:#7c6b62;text-align:right}.v111-area{font-size:12px;color:var(--muted);margin:13px 0 5px}.v111-summary{font-size:15px;line-height:1.7;margin:0 0 13px}.v111-featurebox{background:#faf8f4;border-radius:14px;padding:13px}.v111-featurebox ul{margin:7px 0 0;padding-left:20px;line-height:1.65}.v111-examplehead{display:flex;justify-content:space-between;align-items:end;margin:16px 0 8px}.v111-examplehead small{color:var(--muted);font-size:10px}.v111-examples{display:grid;gap:7px}.v111-example{border:1px solid var(--line);border-radius:13px;padding:12px;background:#fff}.v111-example strong{font-size:19px;display:block;margin-bottom:7px}.v111-example span{display:block;font-size:12px;line-height:1.55}.v111-example span b{display:inline-block;min-width:48px;color:#8b3453}.v111-noexample{border:1px dashed #dccfc4;border-radius:13px;padding:13px;color:var(--muted);font-size:12px;line-height:1.55}.v111-note{margin-top:12px;background:#fff4dd;border-radius:12px;padding:10px 12px;font-size:11px;line-height:1.55}.v111-note b{color:#8b5e19}.v111-up{display:none;margin-top:12px;width:100%}
.v111-source{margin-top:10px;padding:13px;font-size:11px;line-height:1.6;color:var(--muted)}.v111-source b{color:var(--text)}.v111-source p{margin:4px 0 0}
.v111-drill{margin:0 0 10px;padding:18px;text-align:center;border:1px solid #e7ccd6}.v111-drilltop{display:flex;justify-content:space-between;color:var(--muted);font-size:11px}.v111-drillphrase{font-size:32px;font-weight:950;margin:26px 0 18px}.v111-drill>p{color:var(--muted)}.v111-answer{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.v111-answer>span{background:#faf7f3;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:4px}.v111-answer b{font-size:10px;color:var(--muted)}.v111-drill.done>div:first-child{font-size:40px}.v111-drill.done h3{margin:5px 0 12px}
body:not(.oni-mode) #dialects{display:none!important}
@media(max-width:900px){.v111-layout{grid-template-columns:1fr}.v111-list{max-height:none;overflow:visible}.v111-detail{position:static}.v111-up{display:block}.v111-stats{grid-template-columns:1fr 1fr}.v111-head h2{font-size:25px}}
@media(max-width:520px){.v111-head{align-items:flex-start}.v111-head>button{font-size:11px;padding:9px}.v111-notice{display:block}.v111-notice b{display:block;margin-bottom:4px}.v111-searchrow{grid-template-columns:1fr}.v111-searchrow button{width:100%}.v111-detail{padding:15px}.v111-detailtop{display:block}.v111-pref{text-align:left;margin-top:7px}.v111-answer{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

ensurePage();syncAccess();
setTimeout(syncAccess,250);
})();
