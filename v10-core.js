// 日本語 MASTER v10 — isolated Oni mode, difficulty audit, scroll fixes
(()=>{
"use strict";
const NORMAL_LEVELS=["N5","N4","N3","N2","N1"];
const ONI_LEVELS=["N1+","MASTER I","MASTER II","MASTER III","深淵"];
const META={
"N1+":{label:"N1 다음",desc:"N1을 끝낸 뒤 접하는 현대 논설·학술·업무 문체. 추상어·격식 표현·고밀도 독해를 중심으로 한다."},
"MASTER I":{label:"초고급 I",desc:"표외 읽기, 저빈도 현대 문어, 문학어와 격식 문장을 다루는 단계."},
"MASTER II":{label:"초고급 II",desc:"고사성어·난해 사자숙어·한문투 문형이 중심인 단계."},
"MASTER III":{label:"초고급 III",desc:"저빈도 문학어와 본격적인 고전 문법을 함께 읽는 단계."},
"深淵":{label:"심연",desc:"고전 활용·한문훈독·극희귀 문헌어를 격리한 최종 단계. 실제 문헌 용례가 필요한 항목은 자동 예문을 만들지 않는다."}
};
function parseBank(raw,n){
 const out={};
 for(const [level,text] of Object.entries(raw||{})){
  out[level]=String(text).trim().split(/\n+/).filter(Boolean).map(line=>line.split("|").map(s=>s.trim()).slice(0,n)).filter(r=>r.length>=n);
 }
 return out;
}
const V=parseBank(globalThis.NMK_V10_VOCAB_RAW,4);
const G=parseBank(globalThis.NMK_V10_GRAMMAR_RAW,6);
const savedOni=(()=>{try{return JSON.parse(localStorage.getItem("nmk_oni_mode")||"null")||{level:"N1+"}}catch(e){return {level:"N1+"}}})();
const oneShotOni=(()=>{try{return sessionStorage.getItem("nmk_oni_once")||""}catch(e){return ""}})();
let oni={enabled:ONI_LEVELS.includes(oneShotOni),level:ONI_LEVELS.includes(oneShotOni)?oneShotOni:(ONI_LEVELS.includes(savedOni.level)?savedOni.level:"N1+")};
try{sessionStorage.removeItem("nmk_oni_once")}catch(e){}

document.title="日本語 MASTER v10";
const badge=document.querySelector(".brand .badge"); if(badge)badge.textContent="v10";

// Scroll audit / safe-area fixes
const style=document.createElement("style");
style.textContent=`
html,body{max-width:100%;min-height:100%;overflow-x:hidden;scroll-behavior:smooth}
body{min-height:100dvh;overscroll-behavior-y:auto}
.main{min-height:100dvh;padding-bottom:max(112px,calc(88px + env(safe-area-inset-bottom)))}
.page.active{min-height:calc(100dvh - 90px);overflow:visible}
.card,.hero,.lesson-main,.source-entry{scroll-margin-top:16px}
.tabs,.level-strip,.vocab-table-wrap{overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
.vocab-table-wrap{overflow-x:auto!important;overflow-y:visible!important;max-width:100%;scrollbar-gutter:stable}
.list{scrollbar-gutter:stable;overscroll-behavior:contain}
.bottom{padding-bottom:max(7px,env(safe-area-inset-bottom))}
.oni-banner{position:sticky;top:6px;z-index:18;margin:0 0 12px;border:1px solid #57333e;background:linear-gradient(135deg,#251b1f,#44232d);color:#fff;border-radius:17px;padding:11px 14px;box-shadow:0 10px 28px rgba(40,10,20,.18)}
.oni-banner b{font-size:15px}.oni-banner small{display:block;color:#ddcdd2;margin-top:3px;line-height:1.45}
.oni-settings{border-color:#ead0d5;background:linear-gradient(135deg,#fff,#fff5f7)}
.oni-setting-row{display:grid;grid-template-columns:minmax(150px,220px) auto auto;gap:8px;align-items:center}
.oni-setting-row select{border:1px solid var(--line);border-radius:12px;padding:11px;background:#fff}
.oni-enter{border:0;border-radius:13px;padding:11px 14px;background:linear-gradient(135deg,#5b1d31,#9a3154);color:#fff;font-weight:900}
.oni-level-info{margin-top:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.oni-level-info>div{border:1px solid #eadce0;background:#fff;border-radius:13px;padding:10px}.oni-level-info b{display:block;font-size:19px}
body.oni-mode{--bg:#fbf5f6;--accent:#9b3152;background:radial-gradient(circle at 0 0,#f7e4e8,transparent 28%),radial-gradient(circle at 100% 0,#eee6f7,transparent 26%),var(--bg)}
body.oni-mode .logo{background:linear-gradient(135deg,#4b1727,#a53559)}
body.oni-mode .nav button.active,body.oni-mode .bottom button.active{background:#f4dfe5;color:#7f2944}
body.oni-mode .primary{background:linear-gradient(135deg,#6d243d,#ae3c62);box-shadow:0 8px 18px rgba(100,25,50,.2)}
body.oni-mode .simple-hero{background:linear-gradient(135deg,#f8e9ed,#fff,#eee8f6);border-color:#ead6dd}
@media(max-width:1000px){
 .main{padding-bottom:max(122px,calc(98px + env(safe-area-inset-bottom)))}
 .toast{bottom:calc(80px + env(safe-area-inset-bottom))}
 .study-grid{grid-template-columns:1fr}
 .list{max-height:44dvh;overflow-y:auto}
}
@media(max-width:680px){
 .oni-setting-row{grid-template-columns:1fr}.oni-level-info{grid-template-columns:repeat(3,1fr)}
 .oni-banner{top:3px}.vocab-table-wrap{margin-left:-2px;margin-right:-2px}
 .table-toolbar{align-items:stretch}.table-toolbar button,.table-toolbar select{flex:1 1 135px}
 .main{padding-left:11px;padding-right:11px}
}
@media(max-width:420px){.oni-level-info{grid-template-columns:1fr 1fr}.oni-level-info>div:last-child{grid-column:1/-1}.lesson-main{padding:16px}.lesson-title{overflow-wrap:anywhere}.vocab-table td,.vocab-table th{font-size:12px}}
`;
document.head.appendChild(style);

// Keep desktop IA as simple as mobile.
const sideNav=document.querySelector(".side .nav");
if(sideNav)sideNav.innerHTML=`
<button class="active" data-page="home">🏠 홈</button>
<button data-page="learnmode">🧠 배우기</button>
<button data-page="reviewpage">🔁 복습</button>
<button data-page="library">🔎 찾기</button>
<button data-page="more">☰ 더보기</button>`;

// Add Oni UI dynamically.
const top=document.querySelector(".top");
if(top&&!document.getElementById("oniBanner"))top.insertAdjacentHTML("afterend",'<div id="oniBanner" class="oni-banner" style="display:none"></div>');
const more=document.getElementById("more");
if(more&&!document.getElementById("oniSettingsCard")){
 const target=more.querySelector("details");
 const panel=`<div class="card oni-settings" id="oniSettingsCard" style="margin-top:14px">
 <div class="title"><span>👹 오니 모드</span><span class="badge">N1+ 이상 전용</span></div>
 <p class="muted small">기본 화면은 N5~N1까지만 보여줘. 고급 단계를 고르면 선택한 난이도 하나만 취급하는 별도 학습 환경으로 바뀐다.</p>
 <div class="oni-setting-row"><select id="oniLevelSelect">${ONI_LEVELS.map(l=>`<option>${l}</option>`).join("")}</select><button class="oni-enter" id="oniEnterBtn">이 난이도로 입장</button><button class="secondary" id="oniExitBtn" style="display:none">일반 모드로 돌아가기</button></div>
 <div id="oniLevelInfo" class="oni-level-info"></div></div>`;
 if(target)target.insertAdjacentHTML("beforebegin",panel); else more.insertAdjacentHTML("beforeend",panel);
}
document.getElementById("oniEnterBtn")?.addEventListener("click",()=>enterOni(document.getElementById("oniLevelSelect")?.value||"N1+"));
document.getElementById("oniExitBtn")?.addEventListener("click",exitOni);
document.getElementById("oniLevelSelect")?.addEventListener("change",renderOniCard);

function exFor(term,level){
 if(level==="N1+")return {ja:`報告書では「${term}」が重要な論点として扱われた。`,ko:`보고서에서는 「${term}」가 중요한 논점으로 다뤄졌다.`};
 if(level==="MASTER I")return {ja:`評論では「${term}」という語が用いられることがある。`,ko:`평론에서는 「${term}」라는 단어가 쓰이기도 한다.`};
 return {ja:"",ko:""};
}
function addAdvanced(){
 for(const [level,rows] of Object.entries(V))for(const [term,reading,meaning,pos] of rows){
  if(DB.vocab.some(x=>x.term===term&&x.reading===reading))continue;
  const e=exFor(term,level),sourceSensitive=level==="MASTER III"||level==="深淵"||/고사성어|사자숙어/.test(pos);
  DB.vocab.push({id:`v10_v_${level.replace(/\s/g,"_")}_${DB.vocab.length}`,level,term,reading,meaning,pos,example:e.ja,kr:e.ko,examples:e.ja?[e]:[],nuance:`${META[level].label} 단계 어휘. 독음·문체·문맥을 함께 익혀.`,sourceSensitive,tags:[level,"v10확장",pos]});
 }
 for(const [level,rows] of Object.entries(G))for(const [term,meaning,form,nuance,example,kr] of rows){
  if(DB.grammar.some(x=>x.term===term))continue;
  DB.grammar.push({id:`v10_g_${level.replace(/\s/g,"_")}_${DB.grammar.length}`,level,term,meaning,form,nuance,example,kr,similar:"",tags:[level,"v10문법"]});
 }
}

// Move items that were visibly too easy for their former advanced tier.
const REBALANCE={
"N2":["梱包","楕円","待遇","優遇","応対","交渉","協議","説得","非難","由来","兆候","前兆","予兆","宿敵","宿題","主因","誘因","起因","火種"],
"N1":["安堵","荘厳","蘇る","蝕む","頑な","黎明","黄昏","未明","沿革","宿命","切磋琢磨","因果応報","温故知新","疑心暗鬼","虎視眈々","自縄自縛","前代未聞","大器晩成","東奔西走","一網打尽","一刀両断","右往左往","危機一髪","起死回生","空前絶後","三寒四温","支離滅裂","千載一遇","電光石火","天真爛漫","波瀾万丈","百戦錬磨","本末転倒"],
"N1+":["斡旋","蒐集","杜撰","竣工","顛末","灌漑","灰燼","峻別","淘汰","熾烈","桎梏","隘路","逡巡","洞察","達観","流布","吹聴","欺瞞","狡猾","咀嚼","毀損","瓦解","錯綜","懐柔","恫喝","憤懣","東雲","夕凪","朝凪","夜陰","揺籃期","端緒","禍根","遠因","近因","所以","来歴","由緒","謂れ","宿敵"],
"MASTER I":["森羅万象","一騎当千","一蓮托生","粉骨砕身","厚顔無恥","巧言令色","馬耳東風","傍若無人","泰然自若","勧善懲悪","山紫水明","臥薪嘗胆","呉越同舟","画竜点睛","捲土重来"]
};
function auditDifficulty(){
 for(const [target,terms] of Object.entries(REBALANCE)){
  const set=new Set(terms);
  DB.vocab.forEach(x=>{if(set.has(x.term)&&ONI_LEVELS.includes(x.level))x.level=target});
 }
 // Exact duplicate cleanup inside the same tier.
 const seen=new Map();
 DB.vocab=DB.vocab.filter(x=>{
  const k=`${x.level}|${x.term}|${x.reading||""}`;
  if(!seen.has(k)){seen.set(k,x);return true}
  const keep=seen.get(k);
  if((!keep.meaning||/[A-Za-z]{3,}/.test(keep.meaning))&&x.meaning&&!/[A-Za-z]{3,}/.test(x.meaning))keep.meaning=x.meaning;
  return false;
 });
}

// Historical/high-literary items: no fabricated examples.
if(typeof requiresSourceVerifiedExample==="function"){
 const oldSourceCheck=requiresSourceVerifiedExample;
 requiresSourceVerifiedExample=function(x){return !!x?.sourceSensitive||oldSourceCheck(x)};
}

function counts(level){return {vocab:DB.vocab.filter(x=>x.level===level).length,grammar:DB.grammar.filter(x=>x.level===level).length,kanji:DB.kanji.filter(x=>x.level===level||((level.startsWith("MASTER")||level==="深淵")&&x.level==="MASTER")).length}}
function setOptions(id,levels,preferred){
 const el=document.getElementById(id); if(!el)return;
 el.innerHTML=levels.map(l=>`<option value="${l}">${l}</option>`).join("");
 el.value=levels.includes(preferred)?preferred:levels[0];
}
function configureSelectors(){
 if(oni.enabled){
  setOptions("learnLevel",[oni.level],oni.level);setOptions("libLevel",[oni.level],oni.level);setOptions("quizLevel",[oni.level],oni.level);
  roadLevel=oni.level;
  const rl=document.getElementById("roadLevels");if(rl)rl.innerHTML=`<button class="level-chip active">${oni.level}</button>`;
 }else{
  setOptions("learnLevel",NORMAL_LEVELS,document.getElementById("learnLevel")?.value||"N5");
  setOptions("libLevel",["전체",...NORMAL_LEVELS],document.getElementById("libLevel")?.value||"N5");
  setOptions("quizLevel",NORMAL_LEVELS,document.getElementById("quizLevel")?.value||"N5");
  if(!NORMAL_LEVELS.includes(roadLevel))roadLevel="N5";
  const rl=document.getElementById("roadLevels");if(rl)rl.innerHTML=NORMAL_LEVELS.map(l=>`<button class="level-chip ${l===roadLevel?"active":""}" onclick="setRoad('${l}',this)">${l}</button>`).join("");
 }
}
function renderOniCard(){
 const sel=document.getElementById("oniLevelSelect");if(!sel)return;
 if(!ONI_LEVELS.includes(sel.value))sel.value=oni.level;
 const level=sel.value,c=counts(level),m=META[level],box=document.getElementById("oniLevelInfo");
 if(box)box.innerHTML=`<div><span class="muted small">어휘</span><b>${c.vocab}</b></div><div><span class="muted small">문법</span><b>${c.grammar}</b></div><div><span class="muted small">성격</span><b style="font-size:14px">${m.label}</b></div><div style="grid-column:1/-1"><span class="muted small">난도 기준</span><div style="margin-top:4px;line-height:1.55">${m.desc}</div></div>`;
 document.getElementById("oniExitBtn").style.display=oni.enabled?"inline-block":"none";
}
function enterOni(level){oni={enabled:true,level};localStorage.setItem("nmk_oni_mode",JSON.stringify({enabled:false,level}));applyMode();navTo("home");toast(`👹 ${level} 오니 모드`)}
function exitOni(){oni.enabled=false;localStorage.setItem("nmk_oni_mode",JSON.stringify({enabled:false,level:oni.level}));applyMode();navTo("home");toast("일반 모드로 돌아왔어")}
function applyMode(){
 document.body.classList.toggle("oni-mode",oni.enabled);configureSelectors();
 const b=document.getElementById("oniBanner");if(b){b.style.display=oni.enabled?"block":"none";if(oni.enabled)b.innerHTML=`<b>👹 鬼級 · ${oni.level} 전용</b><small>현재 학습·찾기·퀴즈·복습은 ${oni.level}만 취급해. 다른 급수는 숨겨져 있어.</small>`}
 const bd=document.querySelector(".brand .badge");if(bd)bd.textContent=oni.enabled?`鬼 ${oni.level}`:"v10";
 renderOniCard();try{renderRecommendation()}catch(e){}try{renderLibrary()}catch(e){}try{renderRoad()}catch(e){}try{updateUI()}catch(e){}
}

// Isolate every standard data selector.
const oldGetFiltered=getFiltered;
getFiltered=function(type,level){
 let arr=oldGetFiltered(type,level);
 if(oni.enabled)return arr.filter(x=>x.level===oni.level||(type==="kanji"&&(oni.level.startsWith("MASTER")||oni.level==="深淵")&&x.level==="MASTER"));
 if(level==="전체")return arr.filter(x=>NORMAL_LEVELS.includes(x.level));
 return arr.filter(x=>NORMAL_LEVELS.includes(x.level));
};

// Normal home stops at N1; Oni home shows only selected tier.
const oldRecommendation=renderRecommendation;
renderRecommendation=function(){
 if(oni.enabled){
  const level=oni.level,cats=["vocab","grammar","kanji"],ps=cats.map(cat=>({cat,...progressFor(level,cat)})).filter(p=>p.total>0).sort((a,b)=>a.pct-b.pct),p=ps[0]||{cat:"vocab",pct:0,total:0,seen:0};
  recommended={level,cat:p.cat};const m=CAT_META[p.cat]||{name:names[p.cat]};
  const t=document.getElementById("nextStudyTitle"),d=document.getElementById("nextStudyDesc"),bar=document.getElementById("nextStudyBar");
  if(t)t.textContent=`👹 ${level} · ${m.name}`;if(d)d.textContent=`${level} 전용 과정 · ${p.seen}/${p.total} 학습`;if(bar)bar.style.width=`${p.pct}%`;
  return;
 }
 oldRecommendation();
 if(recommended && !NORMAL_LEVELS.includes(recommended.level)){
  recommended={level:"N1",cat:"vocab"};
  const t=document.getElementById("nextStudyTitle"),d=document.getElementById("nextStudyDesc");
  if(t)t.textContent="N1 과정 마무리";if(d)d.textContent="N1 이후 과정은 더보기의 👹 오니 모드에서 별도로 열 수 있어.";
 }
};

if(typeof reviewItems==="function"){const oldReview=reviewItems;reviewItems=function(filter="all"){let a=oldReview(filter);return oni.enabled?a.filter(x=>x.level===oni.level||(DB.kanji.includes(x)&&x.level==="MASTER")):a.filter(x=>NORMAL_LEVELS.includes(x.level))}}
if(typeof openStarTable==="function"){const oldStar=openStarTable;openStarTable=function(){oldStar();if(oni.enabled){document.getElementById("learnLevel").value=oni.level;renderVocabTable()}}}

// Search also follows current universe.
doSearch=function(){
 const q=(document.getElementById("searchInput")?.value||"").trim().toLowerCase();const host=document.getElementById("searchResults");if(!host)return;if(!q){host.innerHTML="";return}
 let res=[];["vocab","grammar","kanji"].forEach(t=>DB[t].forEach(x=>{const allowed=oni.enabled?(x.level===oni.level||(t==="kanji"&&(oni.level.startsWith("MASTER")||oni.level==="深淵")&&x.level==="MASTER")):NORMAL_LEVELS.includes(x.level);if(allowed&&JSON.stringify(x).toLowerCase().includes(q))res.push({...x,_type:t})}));
 host.innerHTML=res.slice(0,80).map(x=>`<div class="result"><span class="badge">${x.level}</span> <span class="tag">${names[x._type]}</span><h3 class="jp" style="margin:8px 0 3px">${escapeHtml(x.term)}</h3><div>${escapeHtml(x.koMeaning||x.meaning||x.reading||"")}</div><button class="secondary" style="margin-top:8px" onclick="openFromSearch('${x._type}','${x.id}')">자세히</button></div>`).join("")||'<div class="card muted">검색 결과 없음</div>';
};

// Hide the long high-level ladder in normal roadmap.
if(typeof injectMasterSummary==="function"){const oldMaster=injectMasterSummary;injectMasterSummary=function(){if(oni.enabled){oldMaster();return}const host=document.getElementById("masterSummary");if(host)host.innerHTML='<div class="card"><b>고급 과정은 👹 오니 모드로 분리했어.</b><p class="muted small">초보 로드맵은 N5~N1까지만 보여주고, N1+ 이상은 더보기에서 원하는 난이도 하나만 열어.</p></div>'}}

// Keep mode constraints after an async expansion-pack merge.
if(typeof mergeExpansion==="function"){const oldMerge=mergeExpansion;mergeExpansion=function(pack){oldMerge(pack);auditDifficulty();configureSelectors();applyMode()}}

// Fix level estimate label so normal beginners never see a distant N1+ target.
if(typeof updateUI==="function"){const oldUI=updateUI;updateUI=function(){oldUI();const e=document.getElementById("estimate");if(e){if(oni.enabled)e.textContent=`오니 단계 · ${oni.level}`;else if(/N1\+|MASTER|深淵/.test(e.textContent))e.textContent="예상 단계 · N1"}}}

// Reset document scroll on page change; avoid leaving users midway down a long table/list.
if(typeof navTo==="function"){const oldNav=navTo;navTo=function(id){oldNav(id);requestAnimationFrame(()=>{(document.scrollingElement||document.documentElement).scrollTo({top:0,behavior:"auto"})});if(id==="more")renderOniCard()}}

addAdvanced();
auditDifficulty();
applyMode();
renderOniCard();

// ===== v10.1: Oni UI overhaul + reliable controls =====
document.title="日本語 MASTER v10.1";
const v101Badge=document.querySelector(".brand .badge");if(v101Badge&&!oni.enabled)v101Badge.textContent="v10.1";

const v101Style=document.createElement("style");
v101Style.textContent=`
/* v10.1 Oni mode UI */
.oni-settings{overflow:hidden;position:relative}
.oni-settings:before{content:"鬼";position:absolute;right:14px;top:-26px;font-size:120px;font-weight:1000;color:rgba(111,31,57,.045);pointer-events:none}
.oni-tier-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:12px 0}
.oni-tier-btn{border:1px solid #e8d4da;background:#fff;border-radius:14px;padding:11px 8px;font-weight:950;min-height:62px;display:flex;flex-direction:column;justify-content:center;gap:3px;color:#51303a}
.oni-tier-btn small{font-size:10px;color:#8b747c;font-weight:800}
.oni-tier-btn.active{border-color:#8d2f4d;background:linear-gradient(145deg,#531b2d,#9b3456);color:#fff;box-shadow:0 8px 20px rgba(91,29,49,.22)}
.oni-tier-btn.active small{color:#f0dce3}
.oni-setting-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.oni-setting-actions button{min-height:44px}
.oni-select-fallback{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}
.oni-home-panel{display:none;margin:14px 0}
body.oni-mode .oni-home-panel{display:block}
.oni-home-shell{border:1px solid #e3cad3;background:linear-gradient(145deg,#fff,#fff5f8 58%,#f0e9f7);border-radius:22px;padding:18px;box-shadow:var(--shadow)}
.oni-home-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}
.oni-rank-mark{display:inline-flex;align-items:center;gap:7px;background:#4c1d2c;color:#fff;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:950}
.oni-home-head h2{margin:8px 0 4px;font-size:25px}.oni-home-head p{margin:0;color:var(--muted);line-height:1.55;max-width:720px}
.oni-progress-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:15px}
.oni-progress-card{border:1px solid #eadbe0;background:#fff;border-radius:16px;padding:13px}
.oni-progress-card .oni-pct{font-size:23px;font-weight:1000}.oni-progress-card small{display:block;color:var(--muted);margin-top:2px}
.oni-progress-card .progress{margin-top:8px;height:7px}
.oni-quick-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:13px}
.oni-action{border:1px solid #e6d4da;background:#fff;border-radius:15px;padding:12px;text-align:left;min-height:74px}.oni-action b,.oni-action small{display:block}.oni-action b{margin-top:3px}.oni-action small{color:var(--muted);margin-top:3px;line-height:1.35}
.oni-action.primary-action{background:linear-gradient(145deg,#562033,#9c3657);color:#fff;border:0}.oni-action.primary-action small{color:#ead7de}
body.oni-mode .home-mini-grid,body.oni-mode .compact-progress-card{display:none!important}
body.oni-mode .simple-hero{position:relative;overflow:hidden}
body.oni-mode .simple-hero:after{content:"鬼";position:absolute;right:12px;bottom:-45px;font-size:155px;font-weight:1000;color:rgba(110,32,57,.045);pointer-events:none}
body.oni-mode #libTabs [data-type="reading"],body.oni-mode #libTabs [data-type="listening"],body.oni-mode #libTabs [data-type="writing"],body.oni-mode #libViewSimilar{display:none!important}
.oni-level-lock{display:none;align-items:center;justify-content:center;min-height:42px;border-radius:12px;background:#4d1e2d;color:#fff;font-weight:950;padding:0 12px;white-space:nowrap}
body.oni-mode .oni-level-lock{display:flex}
body.oni-mode #learnLevel,body.oni-mode #quizLevel{display:none!important}
body.oni-mode .bottom{background:rgba(41,24,31,.96);border-top-color:#5c3845}
body.oni-mode .bottom button{color:#ddcfd4}body.oni-mode .bottom button.active{background:#653047;color:#fff}
body.oni-mode .oni-banner{position:relative;top:auto}
.oni-road-intro{display:none;margin-bottom:14px;border:1px solid #e4ccd4;background:linear-gradient(145deg,#fff7f9,#f3edf8);border-radius:19px;padding:16px}
body.oni-mode .oni-road-intro{display:block}
@media(max-width:900px){.oni-tier-grid{grid-template-columns:repeat(3,1fr)}.oni-quick-actions{grid-template-columns:repeat(2,1fr)}}
@media(max-width:620px){.oni-tier-grid{grid-template-columns:repeat(2,1fr)}.oni-tier-btn:last-child{grid-column:1/-1}.oni-progress-grid{grid-template-columns:1fr}.oni-quick-actions{grid-template-columns:1fr 1fr}.oni-home-shell{padding:14px}.oni-home-head h2{font-size:22px}}
@media(max-width:390px){.oni-quick-actions{grid-template-columns:1fr}.oni-setting-actions{display:grid}.oni-setting-actions button{width:100%}}
`;
document.head.appendChild(v101Style);

// Re-bind desktop navigation because v10 replaced the buttons after v9 attached listeners.
function bindV101SideNav(){
 document.querySelectorAll(".side .nav [data-page]").forEach(btn=>{
  if(btn.dataset.v101Bound)return;btn.dataset.v101Bound="1";
  btn.addEventListener("click",()=>navTo(btn.dataset.page));
 });
}
bindV101SideNav();

// Replace the old cached/inline Oni controls with one consistent, event-bound panel.
function upgradeV101OniCard(){
 const card=document.getElementById("oniSettingsCard");if(!card)return;
 card.innerHTML=`<div class="title"><span>👹 오니 모드</span><span class="badge">N1+ 이상 전용</span></div>
 <p class="muted small">일반 학습과 완전히 분리된 초고급 코스야. 난이도를 하나 고르면 학습·암기표·찾기·퀴즈·복습·로드맵이 그 단계만 취급해.</p>
 <select id="oniLevelSelect" class="oni-select-fallback" aria-label="오니 난이도">${ONI_LEVELS.map(l=>`<option value="${l}">${l}</option>`).join("")}</select>
 <div class="oni-tier-grid">${ONI_LEVELS.map(l=>`<button type="button" class="oni-tier-btn" data-oni-pick="${l}"><span>${l}</span><small>${META[l].label}</small></button>`).join("")}</div>
 <div id="oniLevelInfo" class="oni-level-info"></div>
 <div class="oni-setting-actions"><button type="button" class="oni-enter" id="oniEnterBtn">선택한 난이도로 입장</button><button type="button" class="secondary" id="oniExitBtn" style="display:none">일반 모드로 돌아가기</button></div>`;
 card.querySelectorAll("[data-oni-pick]").forEach(btn=>btn.addEventListener("click",()=>{
   const sel=card.querySelector("#oniLevelSelect");if(sel)sel.value=btn.dataset.oniPick;renderOniCard();
 }));
 card.querySelector("#oniEnterBtn")?.addEventListener("click",()=>enterOni(card.querySelector("#oniLevelSelect")?.value||"N1+"));
 card.querySelector("#oniExitBtn")?.addEventListener("click",exitOni);
}
upgradeV101OniCard();

// Backward-compatible globals rescue stale HTML cached with the older inline onclick names.
globalThis.enterOniFromSetting=()=>enterOni(document.getElementById("oniLevelSelect")?.value||oni.level||"N1+");
globalThis.exitOniMode=()=>exitOni();
globalThis.nmkEnterOni=(level)=>enterOni(ONI_LEVELS.includes(level)?level:"N1+");
globalThis.nmkGetOniState=()=>({enabled:!!oni.enabled,level:oni.level});

const v101OldRenderOniCard=renderOniCard;
renderOniCard=function(){
 v101OldRenderOniCard();
 const sel=document.getElementById("oniLevelSelect");const level=sel?.value||oni.level;
 document.querySelectorAll("[data-oni-pick]").forEach(b=>b.classList.toggle("active",b.dataset.oniPick===level));
 const enter=document.getElementById("oniEnterBtn");if(enter)enter.textContent=oni.enabled&&level===oni.level?`${level} 적용 중`:`${level}로 입장`;
};

function ensureV101OniSurfaces(){
 const home=document.querySelector("#home .home-simple");
 if(home&&!document.getElementById("oniHomePanel")){
  const hero=home.querySelector(".simple-hero");hero?.insertAdjacentHTML("afterend",'<div id="oniHomePanel" class="oni-home-panel"></div>');
 }
 const controls=document.querySelector("#learnmode .simple-study-controls");
 if(controls&&!document.getElementById("oniLearnLock"))controls.insertAdjacentHTML("afterbegin",'<div id="oniLearnLock" class="oni-level-lock"></div>');
 const qfilters=document.querySelector("#quizSetup .filters");
 if(qfilters&&!document.getElementById("oniQuizLock"))qfilters.insertAdjacentHTML("afterbegin",'<div id="oniQuizLock" class="oni-level-lock"></div>');
 const jlpt=document.getElementById("jlpt");
 if(jlpt&&!document.getElementById("oniRoadIntro"))jlpt.insertAdjacentHTML("afterbegin",'<div id="oniRoadIntro" class="oni-road-intro"></div>');
}
ensureV101OniSurfaces();

function oniProgressSnapshot(cat){
 let p={total:0,seen:0,mastered:0,pct:0,mpct:0};
 try{p=progressFor(oni.level,cat)}catch(e){}
 if(cat==="kanji"&&(oni.level.startsWith("MASTER")||oni.level==="深淵")&&(!p.total||p.total===0)){
   const arr=(DB.kanji||[]).filter(x=>x.level==="MASTER"),seen=arr.filter(x=>state.seen[x.id]?.count>0),mastered=arr.filter(x=>(state.seen[x.id]?.rating||0)>=3);
   p={total:arr.length,seen:seen.length,mastered:mastered.length,pct:arr.length?Math.round(seen.length/arr.length*100):0,mpct:arr.length?Math.round(mastered.length/arr.length*100):0};
 }
 return p;
}
function renderV101OniHome(){
 const host=document.getElementById("oniHomePanel");if(!host)return;
 if(!oni.enabled){host.innerHTML="";return}
 const c=counts(oni.level),meta=META[oni.level];
 const rows=[["vocab","어휘","🈶"],["grammar","문법","🧩"],["kanji","한자","漢"]].map(([cat,name,icon])=>({cat,name,icon,p:oniProgressSnapshot(cat)}));
 host.innerHTML=`<div class="oni-home-shell"><div class="oni-home-head"><div><span class="oni-rank-mark">👹 鬼級 · ${escapeHtml(oni.level)}</span><h2>${escapeHtml(meta.label)} 전용 학습실</h2><p>${escapeHtml(meta.desc)}</p></div><button class="secondary" type="button" data-oni-action="settings">난이도 변경</button></div>
 <div class="oni-progress-grid">${rows.map(r=>`<div class="oni-progress-card"><b>${r.icon} ${r.name}</b><div class="oni-pct">${r.p.pct}%</div><small>${r.p.seen}/${r.p.total} 학습 · ${r.p.mastered} 숙달</small><div class="progress"><span style="width:${r.p.pct}%"></span></div></div>`).join("")}</div>
 <div class="oni-quick-actions"><button class="oni-action primary-action" type="button" data-oni-action="recommended"><span>▶</span><b>오니 학습 시작</b><small>가장 덜 진행된 영역부터</small></button><button class="oni-action" type="button" data-oni-action="table"><span>▦</span><b>어휘 암기표</b><small>${c.vocab}개 중 빠르게 훑기</small></button><button class="oni-action" type="button" data-oni-action="grammar"><span>🧩</span><b>문법 집중</b><small>${c.grammar}개 문형 학습</small></button><button class="oni-action" type="button" data-oni-action="quiz"><span>🎯</span><b>오니 퀴즈</b><small>${escapeHtml(oni.level)}만 출제</small></button></div></div>`;
}
function oniOpenStudy(cat){
 navTo("learnmode");setStudyView("card");
 const lv=document.getElementById("learnLevel"),ct=document.getElementById("learnCat");if(lv)lv.value=oni.level;if(ct)ct.value=cat||"mixed";updatePosFilterVisibility();startLearn(cat&&cat!=="mixed"?cat:undefined);
}
function oniOpenTable(){
 navTo("learnmode");setStudyView("table");
 const lv=document.getElementById("learnLevel"),ct=document.getElementById("learnCat");if(lv)lv.value=oni.level;if(ct)ct.value="vocab";tableStatusFilter="all";tablePage=0;renderTableTools();renderVocabTable();
}
function oniOpenQuiz(){navTo("quizpage");const lv=document.getElementById("quizLevel");if(lv)lv.value=oni.level}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-oni-action]");if(!b)return;
 const a=b.dataset.oniAction;if(a==="settings")navTo("more");else if(a==="recommended")startRecommendedStudy();else if(a==="table")oniOpenTable();else if(a==="grammar")oniOpenStudy("grammar");else if(a==="quiz")oniOpenQuiz();
});

function syncV101OniUI(){
 ensureV101OniSurfaces();bindV101SideNav();
 const versionBadge=document.querySelector(".brand .badge");if(versionBadge)versionBadge.textContent=oni.enabled?`鬼 ${oni.level}`:"v10.1";
 const learnLock=document.getElementById("oniLearnLock"),quizLock=document.getElementById("oniQuizLock");if(learnLock)learnLock.textContent=`👹 ${oni.level}`;if(quizLock)quizLock.textContent=`👹 ${oni.level}`;
 const chip=document.querySelector("#home .reco-chip");if(chip)chip.textContent=oni.enabled?"鬼級 전용 코스":"오늘의 일본어";
 const heroStart=document.querySelector("#home .hero-start");if(heroStart)heroStart.textContent=oni.enabled?"오니 학습 시작":"오늘 공부 시작";
 const reviewBtn=document.querySelector("#home .simple-hero .secondary");if(reviewBtn&&oni.enabled)reviewBtn.childNodes[0].nodeValue="오니 복습 ";
 if(reviewBtn&&!oni.enabled)reviewBtn.childNodes[0].nodeValue="복습 ";
 const findTitle=document.querySelector("#library .find-head h2"),findDesc=document.querySelector("#library .find-head p");if(findTitle)findTitle.textContent=oni.enabled?`👹 ${oni.level} 찾기`:"찾기";if(findDesc)findDesc.textContent=oni.enabled?`${oni.level} 안에서만 어휘·문법·한자를 찾아.`:"단어·문법·한자를 바로 찾고 자세히 볼 수 있어.";
 const sourceLevel=document.getElementById("sourceLevel");if(sourceLevel){
   if(!sourceLevel.dataset.normalOptions)sourceLevel.dataset.normalOptions=sourceLevel.innerHTML;
   if(oni.enabled){sourceLevel.innerHTML=`<option value="${oni.level}">${oni.level}</option>`;sourceLevel.value=oni.level}else if(sourceLevel.dataset.normalOptions){sourceLevel.innerHTML=sourceLevel.dataset.normalOptions}
 }
 const more=document.getElementById("more");if(more){
   const road=more.querySelector(".more-card[onclick*=\"jlpt\"]"),diag=more.querySelector(".more-card[onclick*=\"diagnosis\"]"),stats=more.querySelector(".more-card[onclick*=\"stats\"]"),reset=more.querySelector(".more-card[onclick*=\"openResetModal\"]"),details=more.querySelector(":scope > details");
   [diag,stats,reset].forEach(x=>{if(x)x.style.display=oni.enabled?"none":""});if(details)details.style.display=oni.enabled?"none":"";
   if(road){const b=road.querySelector("b"),s=road.querySelector("small");if(b)b.textContent=oni.enabled?`${oni.level} 로드맵`:"전체 로드맵";if(s)s.textContent=oni.enabled?"선택 난이도만 진행":"급수·단원별 진행"}
 }
 const roadIntro=document.getElementById("oniRoadIntro");if(roadIntro&&oni.enabled)roadIntro.innerHTML=`<span class="oni-rank-mark">👹 ${escapeHtml(oni.level)}</span><h2 style="margin:9px 0 4px">${escapeHtml(META[oni.level].label)} 로드맵</h2><p class="muted" style="margin:0">${escapeHtml(META[oni.level].desc)}</p>`;
 const roadCards=[...document.querySelectorAll("#jlpt > .card")];roadCards.slice(0,2).forEach(x=>x.style.display=oni.enabled?"none":"");
 const roadTitle=document.querySelector("#jlpt .book-head h2");if(roadTitle){if(!roadTitle.dataset.normalText)roadTitle.dataset.normalText=roadTitle.textContent;roadTitle.textContent=oni.enabled?`鬼級 ${oni.level} 로드맵`:roadTitle.dataset.normalText}
 if(oni.enabled&&libType&&!['vocab','grammar','kanji'].includes(libType)){libType='vocab';document.querySelectorAll('#libTabs .tab').forEach(x=>x.classList.toggle('active',x.dataset.type==='vocab'))}
 const pt=document.getElementById("pageTitle");if(pt&&oni.enabled&&document.querySelector(".page.active")){
   const id=document.querySelector(".page.active").id;const labels={home:"홈",learnmode:"배우기",reviewpage:"복습",library:"찾기",more:"설정",quizpage:"퀴즈",jlpt:"로드맵",searchpage:"검색"};if(labels[id])pt.textContent=`👹 ${oni.level} · ${labels[id]}`;
 }
 renderV101OniHome();
}

const v101OldApplyMode=applyMode;
applyMode=function(){v101OldApplyMode();syncV101OniUI();renderOniCard()};
const v101OldNavTo=navTo;
navTo=function(id){v101OldNavTo(id);syncV101OniUI()};
if(typeof updateUI==="function"){const v101OldUI=updateUI;updateUI=function(){v101OldUI();renderV101OniHome()}}

// Make filtering explicit: normal mode cannot accidentally leak an advanced tier; Oni mode cannot leak a neighboring tier.
getFiltered=function(type,level){
 const arr=DB[type]||[];
 if(oni.enabled){if(type==="kanji"&&(oni.level.startsWith("MASTER")||oni.level==="深淵"))return arr.filter(x=>x.level==="MASTER");return arr.filter(x=>x.level===oni.level)}
 if(level&&level!=="전체")return arr.filter(x=>x.level===level&&NORMAL_LEVELS.includes(x.level));
 return arr.filter(x=>NORMAL_LEVELS.includes(x.level));
};

// Ensure stale inline controls and newly replaced navigation are usable immediately.
applyMode();syncV101OniUI();renderOniCard();bindV101SideNav();


// ===== v10.2: library scroll + Oni gateway =====
document.title="日本語 MASTER v10.2.2";

const v102Style=document.createElement("style");
v102Style.textContent=`
/* v10.2 — one-page scroll on mobile, Oni gateway only in normal mode */
#library .study-grid{align-items:start}
#library .library-more-wrap{display:flex;justify-content:center;padding:12px 0 2px}
#library .library-more{min-width:180px}
#library .library-result-count{font-size:12px;color:var(--muted);margin:-3px 0 10px}
#library .library-back{display:none;margin-top:12px;width:100%}
.oni-entry-card{background:linear-gradient(145deg,#321923,#6b263f)!important;color:#fff!important;border-color:#643147!important;box-shadow:0 10px 26px rgba(80,23,45,.18)}
.oni-entry-card small{color:#ead7de!important}
.oni-entry-card b{font-size:18px!important}
.oni-entry-card span{font-size:30px!important}
.oni-entry-overlay{display:none;position:fixed;inset:0;z-index:350;background:rgba(22,12,17,.58);backdrop-filter:blur(8px);padding:18px;align-items:center;justify-content:center}
.oni-entry-overlay.show{display:flex}
.oni-entry-modal{width:min(760px,100%);max-height:min(760px,calc(100dvh - 36px));overflow:auto;background:#fff;border:1px solid #ead7dd;border-radius:25px;padding:20px;box-shadow:0 28px 80px rgba(30,10,20,.28)}
.oni-entry-modal h2{margin:0 0 5px;font-size:25px}.oni-entry-modal p{margin:0;color:var(--muted);line-height:1.55}
.oni-entry-modal .oni-tier-grid{margin-top:16px}
.oni-entry-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}
body:not(.oni-mode) #oniSettingsCard{display:none!important}
body.oni-mode .oni-entry-card{display:none!important}
@media(min-width:1001px){
 #library .list{max-height:calc(100dvh - 245px)!important;overflow-y:auto!important;overscroll-behavior:contain;scrollbar-gutter:stable}
 #library .detail{position:sticky;top:14px;max-height:calc(100dvh - 120px);overflow:auto}
}
@media(max-width:1000px){
 #library .study-grid{display:block!important}
 #library .list{max-height:none!important;height:auto!important;overflow:visible!important;overscroll-behavior:auto!important;touch-action:pan-y!important;-webkit-overflow-scrolling:auto!important}
 #library .detail{position:static!important;max-height:none!important;overflow:visible!important;margin-top:12px}
 #library .library-back{display:block}
 #libraryContent{overflow:visible!important;touch-action:pan-y}
 #library .item{touch-action:manipulation}
}
@media(max-width:620px){
 .oni-entry-modal{padding:16px;border-radius:21px}
 .oni-entry-actions{display:grid;grid-template-columns:1fr}.oni-entry-actions button{width:100%}
}
`;
document.head.appendChild(v102Style);

let v102LibraryVisible=40;
let v102LibraryKey="";
const v102BaseRenderLibrary=renderLibrary;
renderLibrary=function(){
 const level=document.getElementById("libLevel")?.value||"전체";
 const q=(document.getElementById("libFilter")?.value||"").toLowerCase();
 const coreType=["vocab","grammar","kanji"].includes(libType);
 if(!coreType){v102BaseRenderLibrary();return}
 let arr=getFiltered(libType,level).filter(x=>JSON.stringify(x).toLowerCase().includes(q));
 const key=[oni.enabled?"oni":"normal",oni.enabled?oni.level:"",libType,level,q].join("|");
 if(key!==v102LibraryKey){v102LibraryKey=key;v102LibraryVisible=40}
 const mobile=matchMedia("(max-width:1000px)").matches;
 const shown=mobile?arr.slice(0,v102LibraryVisible):arr;
 const rows=shown.map((x,i)=>`<div class="item ${i===0?"active":""}" data-lib-item="1" onclick="openDetail('${libType}','${x.id}',this)"><b class="jp">${escapeHtml(x.term)}</b><br><small>${escapeHtml(listSubText(x,libType))}</small></div>`).join("");
 const more=mobile&&shown.length<arr.length?`<div class="library-more-wrap"><button type="button" class="secondary library-more" data-library-more>더 보기 · ${shown.length}/${arr.length}</button></div>`:"";
 const host=document.getElementById("libraryContent");if(!host)return;
 host.innerHTML=`<div class="library-result-count">${arr.length}개 자료${mobile&&arr.length>shown.length?` · 처음 ${shown.length}개 표시`:""}</div><div class="study-grid"><div class="card list">${rows||'<span class="muted">항목 없음</span>'}${more}</div><div class="card detail" id="detail">${arr[0]?'<span class="muted">항목을 불러오는 중...</span>':'<span class="muted">항목을 선택해줘.</span>'}</div></div>`;
 if(arr[0])renderDetailAsync(arr[0],libType);
 if(level&&level!=="전체"&&(libType==="vocab"||libType==="grammar"))scheduleKoreanWarmup(level);
};

document.addEventListener("click",e=>{
 const more=e.target.closest("[data-library-more]");
 if(more){e.preventDefault();v102LibraryVisible+=40;renderLibrary();return}
 const back=e.target.closest("[data-library-back]");
 if(back){e.preventDefault();document.querySelector("#library .list")?.scrollIntoView({behavior:"smooth",block:"start"});return}
});

const v102Detail=renderDetailAsync;
renderDetailAsync=async function(x,type){
 await v102Detail(x,type);
 if(!matchMedia("(max-width:1000px)").matches)return;
 const el=document.getElementById("detail");if(!el||el.querySelector("[data-library-back]"))return;
 const b=document.createElement("button");b.type="button";b.className="secondary library-back";b.dataset.libraryBack="1";b.textContent="↑ 목록으로 돌아가기";el.appendChild(b);
};

const v102OpenDetail=openDetail;
openDetail=function(type,id,el){
 v102OpenDetail(type,id,el);
 if(matchMedia("(max-width:1000px)").matches)setTimeout(()=>document.getElementById("detail")?.scrollIntoView({behavior:"smooth",block:"start"}),30);
};

// Normal mode gets only one clear gateway button; the full Oni configuration is visible only after entering Oni mode.
function ensureV102OniGateway(){
 const grid=document.querySelector("#more .more-grid");
 if(grid&&!document.getElementById("oniEntryCard")&&!document.getElementById("oniStaticEntry")){
  const b=document.createElement("button");b.type="button";b.id="oniEntryCard";b.className="more-card oni-entry-card";b.dataset.oniEntry="1";
  b.innerHTML='<span>👹</span><b>오니 모드</b><small>N1+ 이상 초고급 전용</small>';
  grid.prepend(b);
 }
 if(!document.getElementById("oniEntryOverlay")){
  const o=document.createElement("div");o.id="oniEntryOverlay";o.className="oni-entry-overlay";
  o.innerHTML=`<div class="oni-entry-modal" role="dialog" aria-modal="true" aria-labelledby="oniEntryTitle"><h2 id="oniEntryTitle">👹 오니 모드 입장</h2><p>N1+ 이후는 일반 커리큘럼과 분리돼 있어. 한 난이도만 골라 그 단계만 집중해서 공부해.</p><div class="oni-tier-grid">${ONI_LEVELS.map(l=>`<button type="button" class="oni-tier-btn" data-oni-modal-pick="${l}"><span>${l}</span><small>${META[l].label}</small></button>`).join("")}</div><div id="oniModalInfo" class="oni-level-info"></div><div class="oni-entry-actions"><button type="button" class="secondary" data-oni-modal-close>취소</button><button type="button" class="oni-enter" data-oni-modal-enter>선택한 난이도로 입장</button></div></div>`;
  document.body.appendChild(o);
 }
}
ensureV102OniGateway();

function renderV102OniModal(){
 const overlay=document.getElementById("oniEntryOverlay");if(!overlay)return;
 let level=overlay.dataset.level||oni.level||"N1+";
 if(!ONI_LEVELS.includes(level))level="N1+";
 overlay.dataset.level=level;
 overlay.querySelectorAll("[data-oni-modal-pick]").forEach(b=>b.classList.toggle("active",b.dataset.oniModalPick===level));
 const c=counts(level),m=META[level],info=overlay.querySelector("#oniModalInfo");
 if(info)info.innerHTML=`<div><span class="muted small">어휘</span><b>${c.vocab}</b></div><div><span class="muted small">문법</span><b>${c.grammar}</b></div><div><span class="muted small">단계</span><b style="font-size:14px">${escapeHtml(m.label)}</b></div><div style="grid-column:1/-1"><span class="muted small">난도 기준</span><div style="margin-top:4px;line-height:1.55">${escapeHtml(m.desc)}</div></div>`;
}
function openV102OniModal(){
 ensureV102OniGateway();const o=document.getElementById("oniEntryOverlay");if(!o)return;
 o.dataset.level=oni.level||"N1+";renderV102OniModal();o.classList.add("show");document.body.style.overflow="hidden";
}
function closeV102OniModal(){document.getElementById("oniEntryOverlay")?.classList.remove("show");document.body.style.overflow=""}

document.addEventListener("click",e=>{
 if(e.target.closest("[data-oni-entry]")){e.preventDefault();openV102OniModal();return}
 const pick=e.target.closest("[data-oni-modal-pick]");if(pick){document.getElementById("oniEntryOverlay").dataset.level=pick.dataset.oniModalPick;renderV102OniModal();return}
 if(e.target.closest("[data-oni-modal-close]")){closeV102OniModal();return}
 if(e.target.closest("[data-oni-modal-enter]")){const level=document.getElementById("oniEntryOverlay")?.dataset.level||"N1+";closeV102OniModal();enterOni(level);return}
 if(e.target.id==="oniEntryOverlay")closeV102OniModal();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.getElementById("oniEntryOverlay")?.classList.contains("show"))closeV102OniModal()});

function syncV102Gateway(){
 ensureV102OniGateway();
 const card=document.getElementById("oniSettingsCard");if(card)card.style.display=oni.enabled?"block":"none";
 const entry=document.getElementById("oniEntryCard");if(entry)entry.style.display=oni.enabled?"none":"";
 const badge=document.querySelector(".brand .badge");if(badge)badge.textContent=oni.enabled?`鬼 ${oni.level}`:"v10.2.2";
}
const v102Apply=applyMode;
applyMode=function(){v102Apply();syncV102Gateway()};
const v102Nav=navTo;
navTo=function(id){v102Nav(id);syncV102Gateway();if(id==="library"){v102LibraryVisible=40;v102LibraryKey="";renderLibrary()}};
syncV102Gateway();
renderLibrary();


// ===== v10.3: guided home / clear next action =====
document.title="日本語 MASTER v10.3";

const v103Style=document.createElement("style");
v103Style.textContent=`
/* v10.3 — guided home */
.guided-home{max-width:980px;margin:0 auto}
.guide-focus{padding:24px!important;overflow:hidden}
.guide-topline{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.guide-step-badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:#24262b;color:#fff;padding:6px 10px;font-size:12px;font-weight:950}
.guide-estimate{color:var(--muted);font-size:12px;font-weight:850}
.guide-kicker{margin-top:18px;color:var(--accent);font-weight:950;font-size:13px}
.guide-focus h2{font-size:32px;margin:5px 0 8px;line-height:1.25}
.guide-focus p{margin:0;color:var(--muted);line-height:1.6;max-width:760px}
.guide-action-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}
.guide-action-row .primary{min-width:210px;font-size:16px;padding:13px 17px}
.guide-action-row .secondary{min-height:46px}
.guide-route-card{margin-top:12px;padding:17px}
.guide-route-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:11px}
.guide-route-head h3{margin:0;font-size:18px}.guide-route-head small{color:var(--muted)}
.guide-route{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.guide-route-step{position:relative;border:1px solid var(--line);border-radius:16px;background:#fff;padding:13px;text-align:left;min-height:92px}
.guide-route-step:after{content:"→";position:absolute;right:-14px;top:34px;font-weight:1000;color:#cfc8c0;z-index:2}
.guide-route-step:last-child:after{display:none}
.guide-route-step .n{width:25px;height:25px;border-radius:50%;display:grid;place-items:center;background:#f1ede8;font-size:12px;font-weight:1000;margin-bottom:7px}
.guide-route-step b,.guide-route-step small{display:block}.guide-route-step small{margin-top:4px;color:var(--muted);line-height:1.4}
.guide-route-step.active{border-color:#ffb49f;background:#fff8f4;box-shadow:0 0 0 2px rgba(255,120,88,.08)}
.guide-route-step.active .n{background:var(--accent);color:#fff}
.guide-route-step.done{background:#f3faf7;border-color:#d7ece3}.guide-route-step.done .n{background:#45b88e;color:#fff}
.guide-note{margin-top:10px;padding:10px 12px;border-radius:13px;background:#faf7f2;color:#706b65;font-size:12px;line-height:1.55}
.guide-other{margin-top:12px}.guide-other summary{font-weight:900}
.guide-other-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding-top:10px}
.guide-other-btn{border:1px solid var(--line);background:#fff;border-radius:15px;padding:13px;text-align:left}
.guide-other-btn span{font-size:22px}.guide-other-btn b,.guide-other-btn small{display:block}.guide-other-btn b{margin:5px 0 2px}.guide-other-btn small{color:var(--muted);line-height:1.35}
.guide-progress-details{margin-top:12px}
body.oni-mode .guide-focus{background:linear-gradient(145deg,#fff,#fff4f7 60%,#f0e9f7);border-color:#e4cbd4}
body.oni-mode .guide-step-badge{background:#531d30}
body.oni-mode .guide-kicker{color:#8e304e}
body.oni-mode .guide-route-step.active{border-color:#b86882;background:#fff6f8;box-shadow:0 0 0 2px rgba(118,36,64,.08)}
body.oni-mode .guide-route-step.active .n{background:#7d2947}
body.oni-mode .oni-home-panel{display:none!important}
@media(max-width:720px){
 .guide-focus{padding:19px!important}.guide-focus h2{font-size:25px}
 .guide-action-row{display:grid;grid-template-columns:1fr}.guide-action-row button{width:100%}
 .guide-route{grid-template-columns:1fr}.guide-route-step{min-height:0}
 .guide-route-step:after{content:"↓";right:14px;top:auto;bottom:-17px;background:var(--bg);padding:0 4px}
 .guide-other-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:390px){.guide-other-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(v103Style);

function ensureV103GuidedHome(){
 const home=document.querySelector("#home .home-simple");if(!home||home.dataset.v103)return;
 home.dataset.v103="1";
 home.className="guided-home";
 home.innerHTML=`
  <div class="hero guide-focus">
   <div class="guide-topline"><span class="guide-step-badge" id="guideStepBadge">1단계 · 시작</span><span class="guide-estimate" id="estimate">예상 단계 · N5 입문</span></div>
   <div class="guide-kicker" id="guideKicker">지금 할 것</div>
   <h2 id="nextStudyTitle">먼저 시작점을 정해</h2>
   <p id="nextStudyDesc">처음이라면 N5 기초부터, 이미 공부한 적이 있다면 수준 진단부터 시작하면 돼.</p>
   <div class="progress" style="margin-top:16px"><span id="nextStudyBar" style="width:0%"></span></div>
   <div class="guide-action-row"><button type="button" class="primary" id="guidePrimary">🌱 N5 기초 시작</button><button type="button" class="secondary" id="guideSecondary">🩺 수준 진단</button></div>
  </div>
  <div class="card guide-route-card">
   <div class="guide-route-head"><h3>오늘은 이 3개만</h3><small id="guideRouteSummary">순서대로 하면 끝</small></div>
   <div class="guide-route" id="guideRoute"></div>
   <div class="guide-note" id="guideNote">처음부터 모든 메뉴를 볼 필요 없어. 위 순서만 따라가면 돼.</div>
  </div>
  <details class="compact-details guide-other">
   <summary>다른 공부 방법 보기</summary>
   <div class="guide-other-grid">
    <button type="button" class="guide-other-btn" data-guide-other="free"><span>🧠</span><b>자유 학습</b><small>급수·영역 직접 선택</small></button>
    <button type="button" class="guide-other-btn" data-guide-other="find"><span>🔎</span><b>찾기</b><small>단어·문법 바로 검색</small></button>
    <button type="button" class="guide-other-btn" data-guide-other="road"><span>🗺️</span><b>로드맵</b><small>전체 과정 확인</small></button>
    <button type="button" class="guide-other-btn" data-guide-other="quiz"><span>🎯</span><b>퀴즈</b><small>바로 실력 확인</small></button>
   </div>
  </details>
  <details class="compact-details guide-progress-details">
   <summary>내 진행 상황 보기</summary>
   <div class="compact-progress-card" style="box-shadow:none;border:0;padding:4px 0 0">
    <div class="row" style="justify-content:space-between"><div><span class="muted small">학습 레벨</span><div class="big" id="overallLevel">Lv.1</div></div><div class="home-stat-pills"><span class="pill">⭐ <b id="xpHome">0 XP</b></span><span class="pill">🔥 <b id="streakHome">1일</b></span><span class="pill">📚 <b id="dbCount">0항목</b></span></div></div>
    <div class="progress" style="margin-top:10px"><span id="overallBar" style="width:0%"></span></div>
    <details class="compact-details"><summary>분야별 진척도</summary><div id="skillHome"></div></details>
   </div>
  </details>
  <span id="reviewCount" style="display:none">0개</span>`;
}

function v103UniverseSeen(){
 const allowed=x=>oni.enabled?(x.level===oni.level||(DB.kanji.includes(x)&&(oni.level.startsWith("MASTER")||oni.level==="深淵")&&x.level==="MASTER")):NORMAL_LEVELS.includes(x.level);
 let n=0;["vocab","grammar","kanji"].forEach(t=>(DB[t]||[]).forEach(x=>{if(allowed(x)&&state.seen[x.id]?.count>0)n++}));
 return n;
}
function v103ReviewCount(){try{return reviewItems().length}catch(e){return 0}}
function v103CurrentLevel(){return oni.enabled?oni.level:(recommended?.level&&NORMAL_LEVELS.includes(recommended.level)?recommended.level:"N5")}
function v103CatName(cat){return (CAT_META[cat]?.name||names[cat]||cat)}
function v103StartRecommended10(){
 setStudyView("card");navTo("learnmode");
 const lv=document.getElementById("learnLevel"),ct=document.getElementById("learnCat"),sz=document.getElementById("learnSize");
 const level=v103CurrentLevel(),cat=recommended?.cat||"vocab";
 if(lv)lv.value=level;if(ct)ct.value=cat;if(sz)sz.value="10";updatePosFilterVisibility();startLearn();
}
function v103StartReview(){startReviewMode("all")}
function v103QuickQuiz(){
 navTo("quizpage");
 const lv=document.getElementById("quizLevel"),cat=document.getElementById("quizCat"),sz=document.getElementById("quizSize");
 if(lv)lv.value=v103CurrentLevel();if(cat)cat.value="mixed";if(sz)sz.value="10";
 startQuiz();
}
function v103RouteStep(n,title,desc,action,active=false,done=false){
 return `<button type="button" class="guide-route-step ${active?"active":""} ${done?"done":""}" data-guide-action="${action}"><span class="n">${done?"✓":n}</span><b>${escapeHtml(title)}</b><small>${escapeHtml(desc)}</small></button>`;
}
function renderV103Guide(){
 ensureV103GuidedHome();
 const title=document.getElementById("nextStudyTitle"),desc=document.getElementById("nextStudyDesc"),bar=document.getElementById("nextStudyBar");
 const badge=document.getElementById("guideStepBadge"),kicker=document.getElementById("guideKicker"),p=document.getElementById("guidePrimary"),s=document.getElementById("guideSecondary"),route=document.getElementById("guideRoute"),sum=document.getElementById("guideRouteSummary"),note=document.getElementById("guideNote");
 if(!title||!p||!route)return;
 const seen=v103UniverseSeen(),reviews=v103ReviewCount(),level=v103CurrentLevel(),cat=recommended?.cat||"vocab",catName=v103CatName(cat);
 if(oni.enabled){
   const pr=progressFor(oni.level,cat),reviewFirst=reviews>=8;
   badge.textContent=`👹 ${oni.level} · 오늘 루트`;kicker.textContent="오니 모드에서 지금 할 것";
   if(reviewFirst){
     title.textContent=`먼저 복습 ${Math.min(reviews,30)}개부터`;desc.textContent=`${oni.level}에서 다시/어려움으로 남은 항목이 ${reviews}개 있어. 새 내용을 늘리기 전에 이걸 먼저 정리하는 게 좋아.`;
     p.textContent="🔁 1단계 복습 시작";p.dataset.guideAction="review";s.textContent=`그다음 ${catName} 10개`;s.dataset.guideAction="learn";
     route.innerHTML=v103RouteStep(1,`복습 ${Math.min(reviews,30)}개`,"헷갈린 것부터 정리","review",true)+v103RouteStep(2,`${catName} 10개`,`${oni.level} 새 내용`,"learn")+v103RouteStep(3,"10문제 확인","오늘 공부 마무리","quiz");
   }else{
     title.textContent=`${oni.level} ${catName} 10개부터`;desc.textContent=`현재 ${oni.level}에서 가장 덜 진행된 영역이 ${catName}이야. 오늘은 욕심내지 말고 10개 → 복습 → 확인 순서로 가면 돼.`;
     p.textContent=`▶ 1단계 ${catName} 10개 시작`;p.dataset.guideAction="learn";s.textContent=reviews?`복습 ${reviews}개 보기`:"암기표로 훑기";s.dataset.guideAction=reviews?"review":"table";
     route.innerHTML=v103RouteStep(1,`${catName} 10개`,`${pr.seen}/${pr.total} 학습 중`,"learn",true)+v103RouteStep(2,reviews?`복습 ${reviews}개`:"어휘 훑기",reviews?"헷갈린 항목 다시 보기":"암기표로 전체 감 잡기",reviews?"review":"table")+v103RouteStep(3,"10문제 확인","오늘 공부 마무리","quiz");
   }
   if(bar)bar.style.width=`${pr.pct||0}%`;if(sum)sum.textContent=`${oni.level}만 집중`;if(note)note.textContent="오니 모드에서는 다른 급수를 신경 쓸 필요 없어. 지금 선택한 단계에서 위 3개만 하면 돼.";
 }else if(seen===0){
   badge.textContent="STEP 1 · 시작점 정하기";kicker.textContent="처음이라면 여기서 시작";
   title.textContent="일본어를 얼마나 했는지만 정하면 돼";desc.textContent="완전 처음이면 N5 기초 10개를 바로 시작하고, 이미 배운 적이 있으면 3분 수준 진단으로 시작점을 잡아.";
   p.textContent="🌱 완전 처음 · N5 시작";p.dataset.guideAction="zero";s.textContent="🩺 배운 적 있음 · 수준 진단";s.dataset.guideAction="diagnosis";
   route.innerHTML=v103RouteStep(1,"시작점 정하기","N5 또는 수준 진단","zero",true)+v103RouteStep(2,"기초 10개","어휘·문법을 작게 시작","learn")+v103RouteStep(3,"첫 복습","헷갈린 것만 다시 보기","review");
   if(bar)bar.style.width="0%";if(sum)sum.textContent="첫날은 10개면 충분";if(note)note.textContent="메뉴를 하나씩 둘러볼 필요 없어. 위 두 버튼 중 자기 상황에 맞는 것 하나만 누르면 돼.";
 }else{
   const pr=progressFor(level,cat),reviewFirst=reviews>=8;
   badge.textContent=`${level} · 오늘 루트`;kicker.textContent="지금 가장 먼저 할 것";
   if(reviewFirst){
     title.textContent=`복습 ${Math.min(reviews,30)}개를 먼저 정리해`;desc.textContent=`다시/어려움으로 남은 항목이 ${reviews}개 있어. 새 공부보다 복습을 먼저 끝내면 오늘 할 일이 훨씬 선명해져.`;
     p.textContent="🔁 1단계 복습 시작";p.dataset.guideAction="review";s.textContent=`그다음 ${level} ${catName} 10개`;s.dataset.guideAction="learn";
     route.innerHTML=v103RouteStep(1,`복습 ${Math.min(reviews,30)}개`,"기억이 흐린 것부터","review",true)+v103RouteStep(2,`${catName} 10개`,`${level} 새 내용`,"learn")+v103RouteStep(3,"10문제 확인","오늘 공부 마무리","quiz");
   }else{
     title.textContent=`${level} ${catName} 10개만 먼저 해`;desc.textContent=`현재 가장 덜 진행된 영역이 ${catName}이야. 10개 공부한 뒤 복습하고 마지막으로 10문제만 확인하면 오늘 분량 끝.`;
     p.textContent=`▶ 1단계 ${catName} 10개 시작`;p.dataset.guideAction="learn";s.textContent=reviews?`복습 ${reviews}개`:"수준 다시 진단";s.dataset.guideAction=reviews?"review":"diagnosis";
     route.innerHTML=v103RouteStep(1,`${catName} 10개`,`${pr.seen}/${pr.total} 학습 중`,"learn",true)+v103RouteStep(2,reviews?`복습 ${reviews}개`:"짧은 복습","방금 배운 것 다시 확인",reviews?"review":"learn")+v103RouteStep(3,"10문제 확인","오늘 공부 마무리","quiz");
   }
   if(bar)bar.style.width=`${pr.pct||0}%`;if(sum)sum.textContent="1 → 2 → 3 순서";if(note)note.textContent="자유 학습·로드맵·검색은 필요할 때만 열면 돼. 평소에는 위 3단계만 따라가면 돼.";
 }
 const est=document.getElementById("estimate");if(est)est.textContent=oni.enabled?`현재 · ${oni.level} 전용`:`현재 추천 · ${level}`;
}

function runV103Action(action){
 if(action==="zero"){startFromZero();return}
 if(action==="diagnosis"){navTo("diagnosis");return}
 if(action==="learn"){v103StartRecommended10();return}
 if(action==="review"){v103StartReview();return}
 if(action==="quiz"){v103QuickQuiz();return}
 if(action==="table"){oniOpenTable();return}
}
document.addEventListener("click",e=>{
 const action=e.target.closest("[data-guide-action]")?.dataset.guideAction;if(action){runV103Action(action);return}
 const other=e.target.closest("[data-guide-other]")?.dataset.guideOther;if(!other)return;
 if(other==="free")navTo("learnmode");else if(other==="find")navTo("library");else if(other==="road")navTo("jlpt");else if(other==="quiz")v103QuickQuiz();
});
function bindV103Primary(){
 const p=document.getElementById("guidePrimary"),s=document.getElementById("guideSecondary");
 if(p&&!p.dataset.v103){p.dataset.v103="1";p.addEventListener("click",()=>runV103Action(p.dataset.guideAction))}
 if(s&&!s.dataset.v103){s.dataset.v103="1";s.addEventListener("click",()=>runV103Action(s.dataset.guideAction))}
}
const v103Update=updateUI;
updateUI=function(){v103Update();renderV103Guide();bindV103Primary()};
const v103Apply=applyMode;
applyMode=function(){v103Apply();renderV103Guide();bindV103Primary()};
const v103Nav=navTo;
navTo=function(id){v103Nav(id);if(id==="home"){renderV103Guide();bindV103Primary()}};
ensureV103GuidedHome();
updateUI();
renderV103Guide();
bindV103Primary();


// ===== v10.4: reliable study + no typing + advanced expansion =====
document.title="日本語 MASTER v10.4";

// ---------- Large advanced data merge ----------
function addV104Extras(){
 const vv=globalThis.NMK_V104_VOCAB_EXTRA||[];
 for(const row of vv){
  const [level,term,reading,meaning,pos]=row;
  if(DB.vocab.some(x=>x.term===term&&String(x.reading||"")===String(reading||"")))continue;
  const e=(level==="N1+"||level==="MASTER I")?exFor(term,level):{ja:"",ko:""};
  DB.vocab.push({
   id:`v104_v_${level.replace(/\s/g,"_")}_${DB.vocab.length}`,
   level,term,reading,meaning,pos,
   example:e.ja,kr:e.ko,examples:e.ja?[e]:[],
   nuance:`${META[level]?.label||level} 단계 어휘. 뜻뿐 아니라 읽기와 실제 문체를 함께 익혀.`,
   sourceSensitive:level==="MASTER III"||level==="深淵"||/고사성어|사자숙어|고전어|한문어/.test(pos||""),
   tags:[level,"v10.4확장",pos||"어휘"]
  });
 }
 // Legacy MASTER kanji is now treated as MASTER III so every Oni tier can have its own kanji bank.
 DB.kanji.forEach(x=>{if(x.level==="MASTER")x.level="MASTER III"});
 const kk=globalThis.NMK_V104_KANJI_EXTRA||[];
 for(const row of kk){
  const [level,term,reading,meaning,words,note]=row;
  if(DB.kanji.some(x=>x.term===term&&x.level===level))continue;
  DB.kanji.push({
   id:`v104_k_${level.replace(/\s/g,"_")}_${DB.kanji.length}`,
   level,term,reading,meaning,words,note,
   tags:[level,"고급한자","표외포함"]
  });
 }
 const gg=globalThis.NMK_V104_GRAMMAR_EXTRA||[];
 for(const row of gg){
  const [level,term,meaning,form,nuance,example,kr]=row;
  if(DB.grammar.some(x=>x.term===term&&x.level===level))continue;
  DB.grammar.push({
   id:`v104_g_${level.replace(/\s/g,"_")}_${DB.grammar.length}`,
   level,term,meaning,form,nuance,example,kr,similar:"",
   tags:[level,"v10.4문법"]
  });
 }
}
addV104Extras();

// Exact tier filtering for the expanded Oni banks.
getFiltered=function(type,level){
 const arr=DB[type]||[];
 if(oni.enabled)return arr.filter(x=>x.level===oni.level);
 if(level&&level!=="전체")return arr.filter(x=>x.level===level&&NORMAL_LEVELS.includes(x.level));
 return arr.filter(x=>NORMAL_LEVELS.includes(x.level));
};
counts=function(level){
 return {
  vocab:DB.vocab.filter(x=>x.level===level).length,
  grammar:DB.grammar.filter(x=>x.level===level).length,
  kanji:DB.kanji.filter(x=>x.level===level).length
 };
};

// ---------- Friendly N5/N4 grammar explanations ----------
const V104_GRAMMAR_HELP={
 "～です":["명사나 な형용사 뒤에 붙여 문장을 정중하게 끝내는 가장 기본적인 표현이야.","자기소개·설명처럼 ‘A는 B입니다’라고 말할 때 써.","‘학생’ → 学生です처럼 그냥 뒤에 です를 붙이면 돼."],
 "～ます":["동사를 정중하게 말하는 기본형이야.","처음 보는 사람과 말하거나 수업·가게 같은 정중한 상황에서 써.","食べる→食べます, 行く→行きます처럼 동사 모양이 바뀌어."],
 "～ません":["ます체의 부정형, 즉 ‘~하지 않습니다’야.","정중하게 안 한다고 말할 때 써.","行きます→行きません처럼 ます를 ません으로 바꾼다고 생각하면 쉬워."],
 "～ました":["ます체의 과거형, ‘~했습니다’야.","어제·아까처럼 이미 끝난 행동을 정중하게 말할 때 써.","食べます→食べました처럼 끝을 ました로 바꿔."],
 "～ている":["‘지금 ~하는 중’뿐 아니라 ‘그 상태가 계속됨’도 나타내.","지금 하는 행동, 습관, 결혼하다→결혼해 있는 상태 같은 데 써.","먼저 て형을 만들고 いる를 붙여. 会う→会っている."],
 "～てください":["상대에게 ‘~해 주세요’라고 부탁하는 표현이야.","명령보다 부드럽게 요청할 때 써.","동사 て형 + ください. 書く→書いてください."],
 "～てもいい":["‘~해도 돼?’ ‘~해도 됩니다’처럼 허가를 나타내.","허락을 구하거나 허락해 줄 때 써.","て형 + もいい. 座る→座ってもいい."],
 "～てはいけない":["‘~하면 안 된다’라는 금지 표현이야.","규칙이나 금지를 말할 때 써.","て형 + はいけない. 入る→入ってはいけない."],
 "～たい":["내가 ‘~하고 싶다’고 말하는 표현이야.","자기 희망을 말할 때 가장 먼저 배우는 형태야.","ます를 떼고 たい를 붙여. 食べます→食べたい."],
 "～から":["앞 문장을 이유로 삼아 ‘~하니까’라고 이어 줘.","이유를 비교적 직접적으로 말할 때 써.","이유 + から, 결과 순서로 기억하면 돼."],
 "～ので":["‘~이므로’처럼 이유를 말하지만 から보다 부드러워.","상대를 배려하며 이유를 설명할 때 자주 써.","문장 + ので. 명사·な형용사는 なので가 되는 점을 기억해."],
 "～より":["비교할 때 ‘~보다’의 기준을 표시해.","A보다 B가 크다 같은 비교에서 써.","A より B のほうが… 형태와 같이 외우면 편해."],
 "～のほうが":["둘 중 ‘~쪽이 더’라는 뜻이야.","두 대상을 비교해 어느 쪽이 더 그렇다고 말할 때 써.","Aより Bのほうが + 형용사 형태가 기본 세트야."],
 "～くなる":["い형용사의 상태가 ‘~해지다’라고 변할 때 써.","날씨·크기·속도처럼 상태 변화를 말할 때 써.","暑い→暑くなる처럼 い를 く로 바꾸고 なる."],
 "～になる":["명사·な형용사가 ‘~이 되다/~해지다’로 변할 때 써.","직업·상태가 바뀌는 것을 말할 때 써.","学生になる, 静かになる처럼 に + なる."],
 "～ことがある":["‘~한 적이 있다’라는 경험 표현이야.","여행·음식처럼 과거 경험 유무를 말할 때 써.","동사 た형 + ことがある. 行ったことがある."],
 "～つもり":["‘~할 생각이다’라는 계획·의도 표현이야.","이미 마음속으로 정한 계획을 말할 때 써.","동사 사전형 + つもり. 行くつもり."],
 "～前に":["‘~하기 전에’라는 시간 순서를 나타내.","A보다 B가 먼저 일어남을 말할 때 써.","동사 사전형 + 前に. 寝る前に."],
 "～後で":["‘~한 뒤에’라는 시간 순서를 나타내.","A가 끝난 다음 B를 한다고 말할 때 써.","동사 た형 + 後で. 食べた後で."],
 "～ながら":["‘~하면서’처럼 두 동작을 동시에 할 때 써.","음악을 들으며 걷는 것처럼 주 행동과 곁 행동이 함께 있을 때 써.","ます를 떼고 ながら. 聞きます→聞きながら."],
 "～ようになる":["예전과 달리 ‘~하게 되다’라는 변화 표현이야.","능력이 생기거나 습관이 변했을 때 써.","話せるようになる처럼 변화 전후를 떠올려."],
 "～ようにする":["스스로 노력해서 ‘~하도록 하다’라는 뜻이야.","새 습관을 만들거나 의식적으로 조심할 때 써.","毎日読むようにする = 매일 읽도록 한다."],
 "～ことにする":["내가 결정해서 ‘~하기로 하다’라는 뜻이야.","자기 의지로 선택한 결정을 말할 때 써.","行くことにする = 가기로 한다."],
 "～ことになる":["내가 아니라 상황·규칙에 의해 ‘~하게 되다’라는 뜻이야.","회사 결정·일정 확정처럼 외부에서 정해졌을 때 써.","行くことになった = 가게 되었다."],
 "～そうだ（様態）":["눈으로 보고 ‘~할 것 같다’고 판단하는 표현이야.","비가 올 것 같거나 음식이 맛있어 보일 때 써.","降りそう, おいしそう처럼 겉모습을 보고 말해."],
 "～そうだ（伝聞）":["남에게 들은 정보를 ‘~라고 한다’고 전하는 표현이야.","뉴스·소문·다른 사람의 말을 전달할 때 써.","보통형 문장 뒤에 そうだ를 그대로 붙여."],
 "～たら":["‘~하면’이라는 조건과 ‘~했더니’라는 계기를 모두 만들 수 있어.","특정 상황이 실제로 일어난 뒤의 결과를 말할 때 특히 자주 써.","동사 た형 + ら. 行ったら."],
 "～なら":["상대가 꺼낸 정보에 반응해 ‘~라면’이라고 조건을 붙여.","‘일본에 간다면 교토가 좋아’처럼 화제 기반 조언에 잘 써.","명사/보통형 + なら."],
 "～ば":["일반적인 ‘~하면’ 조건형이야.","원인과 결과의 관계를 비교적 객관적으로 말할 때 써.","동사마다 가정형을 만들어 + ば. 行く→行けば."],
 "～ても":["‘~해도’처럼 예상과 반대되는 결과를 이어 줘.","조건이 성립해도 결과가 달라지지 않을 때 써.","て형 + も. 雨が降っても行く."],
 "～し":["이유나 특징을 ‘~하고, 게다가’처럼 여러 개 나열해.","이유가 하나가 아니라는 느낌을 줄 때 자연스러워.","普通形 + し를 반복할 수 있어."],
 "～すぎる":["정도가 지나쳐 ‘너무 ~하다’라는 뜻이야.","먹기·비싸기·조용하기 등 무엇이 과도할 때 써.","食べます→食べすぎる, 高い→高すぎる."],
 "～やすい":["‘~하기 쉽다’라는 뜻이야.","행동하기 편하거나 어떤 일이 잘 일어나는 성질을 말해.","ます를 떼고 やすい. 読みます→読みやすい."],
 "～にくい":["‘~하기 어렵다’라는 뜻이야.","물리적·심리적으로 행동하기 어려울 때 써.","ます를 떼고 にくい. 読みにくい."],
 "～始める":["‘~하기 시작하다’라는 뜻이야.","어떤 동작이 시작되는 시점을 말해.","ます를 떼고 始める. 降り始める."],
 "～続ける":["‘계속 ~하다’라는 뜻이야.","같은 동작이 이어질 때 써.","ます를 떼고 続ける. 勉強し続ける."],
 "～終わる":["‘~하기를 끝내다’라는 뜻이야.","동작이 완전히 끝났음을 말해.","ます를 떼고 終わる. 読み終わる."],
 "～てみる":["‘시험 삼아 ~해 보다’라는 뜻이야.","처음 해 보거나 결과를 확인하려 시도할 때 써.","て형 + みる. 食べてみる."],
 "～ておく":["나중을 위해 ‘미리 ~해 두다’라는 뜻이야.","준비·사전 조치에서 매우 자주 써.","て형 + おく. 予約しておく."],
 "～てもらう":["다른 사람이 나를 위해 ‘~해 주는 것을 받다’라는 뜻이야.","누군가의 행동으로 내가 도움을 받았을 때 써.","사람に + て형 + もらう."]
};
function v104GrammarHelp(x){
 const h=V104_GRAMMAR_HELP[x.term];
 if(!h||!["N5","N4"].includes(x.level))return "";
 return `<div class="v104-friendly-grammar">
   <div><span>① 이 문법은 뭐야?</span><b>${escapeHtml(h[0])}</b></div>
   <div><span>② 언제 써?</span><b>${escapeHtml(h[1])}</b></div>
   <div><span>③ 만드는 법</span><b class="jp">${escapeHtml(x.form||"")}</b></div>
   <div><span>④ 기억 팁</span><b>${escapeHtml(h[2])}</b></div>
  </div>`;
}

const v104Style=document.createElement("style");
v104Style.textContent=`
.v104-friendly-grammar{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px}
.v104-friendly-grammar>div{border:1px solid #eadfd4;background:#fffdf9;border-radius:14px;padding:12px;line-height:1.55}
.v104-friendly-grammar span{display:block;color:var(--accent);font-size:12px;font-weight:950;margin-bottom:5px}
.v104-friendly-grammar b{font-size:14px}
.v104-recall{max-width:650px;margin:22px auto 0;text-align:center}
.v104-recall-prompt{padding:18px;border:1px solid var(--line);border-radius:17px;background:#faf7f2}
.v104-recall-answer{display:none;margin-top:11px;padding:15px;border-radius:16px;background:#f4faf7;border:1px solid #d8ece3;text-align:left}
.v104-recall-answer.show{display:block}
.v104-recall .rating{margin-top:11px}
#studyStartBtn.v104-ready{position:relative}
#studyStartBtn.v104-ready:active{transform:translateY(1px)}
@media(max-width:620px){.v104-friendly-grammar{grid-template-columns:1fr}.lesson-stepper{grid-template-columns:repeat(3,1fr)!important}}
`;
document.head.appendChild(v104Style);

// ---------- No-typing lesson flow ----------
renderLearnCard=async function(){
 const host=document.getElementById("learnSession");if(!host)return;
 if(learnIndex>=learnDeck.length){
  host.innerHTML=`<div class="card lesson-shell" style="text-align:center;padding:35px"><div style="font-size:56px">📚</div><h2>학습 완료</h2><p class="muted">${learnDeck.length}개를 설명 → 예문 → 기억 확인 순서로 봤어.</p><button class="primary" data-v104-finish="review">어려웠던 것 복습</button> <button class="secondary" data-v104-finish="quiz">퀴즈로 확인</button></div>`;
  return;
 }
 lessonStage=1;lessonRecallChecked=false;
 host.innerHTML=`<div class="lesson-shell">
   <div class="lesson-stepper">
    <button type="button" class="lesson-step active" data-v104-stage="1">1. 설명</button>
    <button type="button" class="lesson-step" data-v104-stage="2">2. 예문</button>
    <button type="button" class="lesson-step" data-v104-stage="3">3. 기억 확인</button>
   </div>
   <div class="card lesson-main" id="lessonMain"></div>
  </div>`;
 await showV104LessonStage(1);
};

async function showV104LessonStage(n){
 lessonStage=n;
 document.querySelectorAll(".lesson-step").forEach((b,i)=>b.classList.toggle("active",i===n-1));
 const x=learnDeck[learnIndex];if(!x)return;
 const type=x._type,ko=await ensureKoreanMeaning(x),main=document.getElementById("lessonMain");if(!main)return;
 const progress=`<div style="display:flex;justify-content:space-between;align-items:center"><span class="badge">${escapeHtml(x.level)} · ${escapeHtml(names[type]||type)}</span><span class="muted">${learnIndex+1} / ${learnDeck.length}</span></div>`;
 if(n===1){
  let body="";
  if(type==="grammar"){
   const friendly=v104GrammarHelp(x);
   body=`${friendly}<div class="lesson-explain"><b>핵심 뜻</b><br>${escapeHtml(ko)}<hr style="border:0;border-top:1px solid var(--line)"><b>접속</b><br><span class="jp">${escapeHtml(x.form||"")}</span>${friendly?"":`<hr style="border:0;border-top:1px solid var(--line)"><b>뉘앙스</b><br>${escapeHtml(x.nuance||"")}`}</div>`;
  }else if(type==="kanji"){
   body=`${hanjaKoHTML(x)}<div class="lesson-explain"><b>일본어 읽기</b><br><span class="jp">${escapeHtml(x.reading||"")}</span><br><br><b>관련 단어</b><br><span class="jp">${escapeHtml(x.words||"")}</span>${x.note?`<br><br><b>포인트</b><br>${escapeHtml(x.note)}`:""}</div>`;
  }else{
   body=`<div class="ko-meaning" style="text-align:center;margin-top:18px">${escapeHtml(ko)}</div><div class="lesson-explain"><b>읽기</b><br><span class="jp">${escapeHtml(x.reading||"")}</span>${x.pos?`<br><br><b>품사</b><br>${escapeHtml(x.pos)}`:""}${x.nuance?`<br><br><b>뉘앙스</b><br>${escapeHtml(x.nuance)}`:""}</div>`;
  }
  main.innerHTML=`${progress}<div class="lesson-title jp">${escapeHtml(x.term)}</div>${body}<div class="lesson-actions"><button type="button" class="secondary" data-v104-speak>🔊 발음 듣기</button><button type="button" class="primary" data-v104-stage="2">예문으로 →</button></div>`;
 }else if(n===2){
  const exKo=await ensureKoreanExample(x),ex=x.example||"";
  let exHtml="";
  if(ex){
   exHtml=`<div class="lesson-explain"><div class="jp" style="font-size:22px;font-weight:850">${escapeHtml(ex)}</div><div style="margin-top:8px">${escapeHtml(exKo||"예문 해석 준비 중")}</div></div>`;
  }else if(x.sourceSensitive){
   exHtml='<div class="unsourced-example">📚 이 항목은 실제 문헌 용례를 확인한 뒤 예문을 표시해. 임의 예문은 만들지 않아.</div>';
  }else{
   exHtml='<div class="lesson-explain muted">이 항목은 예문 자료를 보강 중이야. 뜻·읽기부터 먼저 익혀도 돼.</div>';
  }
  main.innerHTML=`${progress}<h2>예문과 실제 쓰임</h2>${exHtml}${type==="grammar"?`<div class="lesson-explain"><b>핵심 뜻</b><br>${escapeHtml(ko)}<br><br><b>형태</b><br><span class="jp">${escapeHtml(x.form||"")}</span></div>`:""}<div class="lesson-actions"><button type="button" class="secondary" data-v104-stage="1">← 설명</button><button type="button" class="primary" data-v104-stage="3">기억 확인 →</button></div>`;
 }else{
  const prompt=type==="kanji"?"이 한자의 읽기와 뜻을 머릿속으로 떠올려 봐.":type==="grammar"?"이 문법의 뜻과 언제 쓰는지 머릿속으로 설명해 봐.":"이 단어의 읽기와 한국어 뜻을 머릿속으로 떠올려 봐.";
  main.innerHTML=`${progress}<div class="v104-recall"><span class="badge">타이핑 없음 · 머릿속 회상</span><h2 style="margin:13px 0 7px">기억 확인</h2><p class="muted">${escapeHtml(prompt)}</p><div class="v104-recall-prompt"><div class="jp" style="font-size:${type==="kanji"?"64px":"34px"};font-weight:950">${escapeHtml(x.term)}</div></div><button type="button" class="primary" style="margin-top:12px" data-v104-reveal>정답 보기</button><div class="v104-recall-answer" id="v104RecallAnswer"><b>정답</b><div style="margin-top:7px;font-size:20px;font-weight:900">${escapeHtml(ko)}</div>${x.reading?`<div class="jp muted" style="margin-top:5px">${escapeHtml(x.reading)}</div>`:""}</div><div class="rating" id="v104Rating" style="display:none"><button type="button" class="again" data-v104-rate="1">↻ 다시</button><button type="button" class="hard" data-v104-rate="2">△ 애매함</button><button type="button" class="know" data-v104-rate="3">✓ 알겠음</button></div><div class="lesson-actions"><button type="button" class="secondary" data-v104-stage="2">← 예문</button></div></div>`;
 }
}
showLessonStage=showV104LessonStage;

document.addEventListener("click",e=>{
 const stage=e.target.closest("[data-v104-stage]");if(stage){showV104LessonStage(+stage.dataset.v104Stage);return}
 if(e.target.closest("[data-v104-speak]")){const x=learnDeck[learnIndex];if(x)speak(x.term);return}
 if(e.target.closest("[data-v104-reveal]")){
  document.getElementById("v104RecallAnswer")?.classList.add("show");
  const r=document.getElementById("v104Rating");if(r)r.style.display="grid";
  e.target.closest("[data-v104-reveal]").style.display="none";return;
 }
 const rate=e.target.closest("[data-v104-rate]");if(rate){rateLearn(+rate.dataset.v104Rate);return}
 const finish=e.target.closest("[data-v104-finish]");if(finish){finish.dataset.v104Finish==="review"?startReviewMode("all"):v103QuickQuiz();return}
});

// Roadmap copy must match the no-typing lesson.
if(typeof openRoadCategory==="function"){
 const v104RoadBase=openRoadCategory;
 openRoadCategory=function(...args){
  v104RoadBase(...args);
  const p=document.getElementById("roadChapterPanel");
  if(p)p.innerHTML=p.innerHTML.replaceAll("설명 → 예문 → 회상 → 직접 입력 → 복습","설명 → 예문 → 기억 확인 → 복습");
 };
}

// ---------- Reliable study-start button ----------
const v104StartLearnBase=startLearn;
startLearn=function(forceCat){
 try{
  v104StartLearnBase(forceCat);
  setTimeout(()=>{
   const h=document.getElementById("learnSession");
   if(h&&h.innerHTML.trim())h.scrollIntoView({behavior:"smooth",block:"start"});
  },50);
 }catch(err){
  toast("학습을 시작하지 못했어. 설정을 다시 불러왔어.");
  console.error(err);
  try{configureSelectors()}catch(e){}
 }
};
function bindV104StudyStart(){
 const btn=document.getElementById("studyStartBtn");if(!btn||btn.dataset.v104Bound)return;
 btn.dataset.v104Bound="1";btn.classList.add("v104-ready");btn.removeAttribute("onclick");
 btn.addEventListener("click",e=>{
  e.preventDefault();
  if(studyView==="table"){renderTableTools();renderVocabTable();document.getElementById("learnSession")?.scrollIntoView({behavior:"smooth",block:"start"});}
  else startLearn();
 });
}
bindV104StudyStart();
const v104SetStudyView=setStudyView;
setStudyView=function(v){v104SetStudyView(v);bindV104StudyStart()};

// Keep advanced counts/UI fresh after the new data arrives.
try{auditDifficulty()}catch(e){}
try{configureSelectors()}catch(e){}
try{renderLibrary()}catch(e){}
try{renderOniCard()}catch(e){}
try{renderV103Guide()}catch(e){}
try{updateUI()}catch(e){}
bindV104StudyStart();


// ===== v10.4.1: Oni isolation + Korean grammar + full Hanja hun-eum =====
document.title="日本語 MASTER v10.4.1";

// 1) Normal mode must never expose the post-N1 ladder.
function syncV1041OniIsolation(){
 const master=document.getElementById("oniOnlyMasterRoad");
 if(master)master.style.display=oni.enabled?"block":"none";
 if(!oni.enabled){
  document.querySelectorAll("#roadLevels .level-chip").forEach(b=>{
   const t=(b.textContent||"").trim();
   if(ONI_LEVELS.includes(t)||t==="MASTER")b.remove();
  });
 }
}
syncV1041OniIsolation();

// 2) External grammar packs sometimes contain English form/nuance fields.
// Normalize them before any lesson/detail is rendered.
function normalizeV1041GrammarKo(x){
 if(!x||x._v1041KoNormalized)return;
 const key=String(x.term||"").replace(/[～~\s]/g,"");
 if(x.level==="N5"&&key==="一番"){
  x.meaning="가장 ~; 제일 ~";
  x.form="一番 + い형용사 / な형용사 / 명사\n[범위] + の中で + 一番 + 형용사";
  x.nuance="여러 대상 가운데 정도가 가장 높은 것을 나타내는 최상급 표현이야. 一番大きい는 ‘가장 크다’, 一番好き는 ‘가장 좋아하다’라는 뜻이야.";
  V104_GRAMMAR_HELP[x.term]=[
   "여러 대상 중 하나가 ‘가장 ~하다’라고 말할 때 쓰는 일본어 최상급 표현이야.",
   "크기·가격·좋아하는 것처럼 여러 대상을 비교해서 1등을 말할 때 써.",
   "一番은 원래 ‘1번’이라는 뜻이니까 ‘순위가 맨 위’라고 연결해서 기억하면 쉬워."
  ];
 }
 x.form=String(x.form||"")
  .replace(/i-adjective/gi,"い형용사")
  .replace(/na-adjective/gi,"な형용사")
  .replace(/noun/gi,"명사")
  .replace(/verb/gi,"동사")
  .replace(/\[group\]/gi,"[범위]")
  .replace(/plain form/gi,"보통형")
  .replace(/dictionary form/gi,"사전형")
  .replace(/stem/gi,"어간");
 x._v1041KoNormalized=true;
}
async function ensureV1041GrammarKo(x){
 if(!x||x._type!=="grammar"&&!(DB.grammar||[]).includes(x))return;
 normalizeV1041GrammarKo(x);
 if(hasLatin(x.form||""))x.form=await translateEnKo(x.form);
 if(hasLatin(x.nuance||""))x.nuance=await translateEnKo(x.nuance);
 if(hasLatin(x.meaning||""))x.koMeaning=await ensureKoreanMeaning(x);
}
const v1041StageBase=showV104LessonStage;
showV104LessonStage=async function(n){
 const x=learnDeck[learnIndex];
 if(x&&x._type==="grammar")await ensureV1041GrammarKo(x);
 return v1041StageBase(n);
};
showLessonStage=showV104LessonStage;

const v1041DetailBase=renderDetailAsync;
renderDetailAsync=async function(x,type){
 if(type==="grammar"){x._type="grammar";await ensureV1041GrammarKo(x)}
 return v1041DetailBase(x,type);
};

// 3) Korean Hanja fallback for non-Joyo / rare characters.
// The grade CSV already includes Korean meaning + reading; use it instead of only the Joyo mapping.
let v1041HanjaFull=new Map();
const V1041_HANJA_IMMEDIATE=new Map([
 ["瑕",{korean_hanja:"瑕",eumhun:["허물 하"],grade:"1급"}],
 ["斂",{korean_hanja:"斂",eumhun:["거둘 렴"],grade:"1급"}],
 ["齟",{korean_hanja:"齟",eumhun:["어긋날 저"],grade:"준특급"}],
 ["齬",{korean_hanja:"齬",eumhun:["어긋날 어"],grade:"준특급"}],
 ["乖",{korean_hanja:"乖",eumhun:["어그러질 괴"],grade:"1급"}]
]);
const v1041OldHanjaKoInfo=hanjaKoInfo;
hanjaKoInfo=function(ch){
 return v1041OldHanjaKoInfo(ch)||v1041HanjaFull.get(ch)||V1041_HANJA_IMMEDIATE.get(ch)||null;
};
function parseV1041GradeHun(raw,mainSound){
 const tokens=[...String(raw||"").matchAll(/'([^']+)'/g)].map(m=>m[1]);
 if(!tokens.length)return [];
 let soundIndex=tokens.findIndex(t=>t===mainSound);
 let meanings=soundIndex>0?tokens.slice(0,soundIndex):tokens.slice(0,1);
 meanings=[...new Set(meanings.filter(Boolean))].slice(0,3);
 return meanings.map(h=>h+" "+mainSound);
}
async function loadV1041FullHanja(){
 try{
  const cached=await cacheGet("v1041_hanja_full");
  if(cached&&Array.isArray(cached.rows)){
   v1041HanjaFull=new Map(cached.rows.map(x=>[x.ch,x.info]));
   return;
  }
 }catch(e){}
 try{
  const r=await fetch(V4_HANJA_GRADE_URL,{cache:"force-cache"});
  if(!r.ok)return;
  const rows=parseCSV(await r.text()),head=rows.shift();
  const ix=Object.fromEntries(head.map((h,i)=>[h.trim(),i]));
  const built=[];
  for(const row of rows){
   const ch=row[ix.hanja],level=row[ix.level],sound=row[ix.main_sound],raw=row[ix.meaning];
   if(!ch||!sound)continue;
   const eumhun=parseV1041GradeHun(raw,sound);
   if(!eumhun.length)continue;
   built.push({ch,info:{korean_hanja:ch,eumhun,grade:level||""}});
  }
  v1041HanjaFull=new Map(built.map(x=>[x.ch,x.info]));
  try{await cacheSet("v1041_hanja_full",{rows:built})}catch(e){}
  if(document.querySelector("#library.page.active"))renderLibrary();
 }catch(e){console.warn("full Korean Hanja load failed",e)}
}
loadV1041FullHanja();

// Keep list/detail text Korean as soon as the expanded map is available.
const v1041ListSubBase=listSubText;
listSubText=function(x,type){
 if(type==="kanji"){
  const inf=hanjaKoInfo(x.term);
  if(inf)return inf.eumhun.join(" · ");
 }
 return v1041ListSubBase(x,type);
};

const v1041Apply=applyMode;
applyMode=function(){v1041Apply();syncV1041OniIsolation()};
const v1041Nav=navTo;
navTo=function(id){v1041Nav(id);syncV1041OniIsolation()};
syncV1041OniIsolation();


// ===== v10.5: strict post-N1 tier audit + expansion =====
document.title="日本語 MASTER v10.5";

META["N1+"].desc="N1 범위를 안정적으로 마친 뒤 접하는 현대 학술·법률·행정·비평의 저빈도 실전어와 격식 문형.";
META["MASTER I"].desc="현대 일본어 안에서도 드문 표외읽기·문예어·수사어·고급 문어를 중심으로 하는 초고급 단계.";
META["MASTER II"].desc="난해 사자숙어·고사성어·한문투 문형을 중심으로 하는 단계. 일반 현대어보다 한자 문화권 지식 비중이 높다.";
META["MASTER III"].desc="희귀 문학어·난독 표기와 본격 고전 일본어 문법 체계를 함께 다루는 단계.";
META["深淵"].desc="한문훈독·고문헌·불교/역사 전문어·극희귀 표기를 격리한 최종 단계. 검증되지 않은 문헌 예문은 만들지 않는다.";

function addV105Extras(){
 const vv=globalThis.NMK_V105_VOCAB_EXTRA||[];
 for(const row of vv){
  const [level,term,reading,meaning,pos]=row;
  if(DB.vocab.some(x=>x.term===term&&String(x.reading||"")===String(reading||"")))continue;
  DB.vocab.push({
   id:`v105_v_${level.replace(/\s/g,"_")}_${DB.vocab.length}`,
   level,term,reading,meaning,pos,example:"",kr:"",examples:[],
   nuance:`${META[level]?.label||level} 단계 어휘. 표기·읽기·문체의 실제 난도를 함께 익혀.`,
   sourceSensitive:["MASTER II","MASTER III","深淵"].includes(level)||/고사성어|사자숙어|불교어|고전어|한문/.test(pos||""),
   tags:[level,"v10.5확장",pos||"어휘"]
  });
 }
 const kk=globalThis.NMK_V105_KANJI_EXTRA||[];
 for(const row of kk){
  const [level,term,reading,meaning,words,note]=row;
  if(DB.kanji.some(x=>x.term===term&&x.level===level))continue;
  DB.kanji.push({
   id:`v105_k_${level.replace(/\s/g,"_")}_${DB.kanji.length}`,
   level,term,reading,meaning,words,note,
   tags:[level,"v10.5고급한자"]
  });
 }
 const gg=globalThis.NMK_V105_GRAMMAR_EXTRA||[];
 for(const row of gg){
  const [level,term,meaning,form,nuance,example,kr]=row;
  if(DB.grammar.some(x=>x.term===term&&x.level===level))continue;
  DB.grammar.push({
   id:`v105_g_${level.replace(/\s/g,"_")}_${DB.grammar.length}`,
   level,term,meaning,form,nuance,example:example||"",kr:kr||"",similar:"",
   sourceSensitive:["MASTER III","深淵"].includes(level),
   tags:[level,"v10.5문법"]
  });
 }
}
addV105Extras();

function moveTerms(type,target,terms){
 const set=new Set(terms);
 (DB[type]||[]).forEach(x=>{if(set.has(x.term))x.level=target});
}

// N1+ had accumulated a number of ordinary N1/news words.
// Keep N1+ focused on genuinely post-N1 formal/academic density.
moveTerms("vocab","N1",[
 "暫定","変遷","推移","波及","波紋","捏造","隠蔽","発覚","勧告","撤回","譲歩","収拾","調停","仲裁","遵守","侵害","抑止","牽制","濫用","流用","転用","類推","補完","代替","代償","便宜","包括的","抜本的",
 "還元","算定","試算","推計","散在","内在","外在","風化","定着","浸透","拡散","蓄積","集積","累積","飽和","枯渇","充足","捻出","採算","損益","否認","黙認","容認","猶予","棚上げ","凍結","撤廃","却下","受理","立証","実証","検証","所見","知見","概観","管轄","委任","裁量","妥当性","正当性","合理性","匿名性","透明性","可視化","一般化","抽象化"
]);

// MASTER I should not be a bucket for merely common N1 words.
moveTerms("vocab","N1",[
 "簡明","緻密","粗忽","迂闊","周到","払拭","吐露","破綻","嗜好","執拗","姑息","杜絶","研鑽","鼓舞","奮起","含蓄","典雅","毅然","凛然","厳然","判然","歴然","漠然","愕然","卓抜","闊達","洒脱"
]);
moveTerms("vocab","N1+",[
 "披瀝","開陳","述懐","遡及","俎上","僥倖","偏執","妄執","因循","萎靡","醸成","涵養","砥礪","薫陶","叱咤","発奮","高邁","截然"
]);

// A few familiar four-character idioms belong below MASTER II.
moveTerms("vocab","MASTER I",["朝令暮改","栄枯盛衰","栄耀栄華","鶏群一鶴"]);
moveTerms("vocab","N1+",["杞人憂天"]);

// Common Buddhist vocabulary is not 深淵 merely because it is religious.
moveTerms("vocab","MASTER I",["涅槃","菩提","娑婆","弥勒","夜叉"]);
moveTerms("vocab","MASTER II",["唯識","中観","無明","倶舎","阿頼耶識","末那識","羅刹"]);

// Rebalance advanced kanji by character/read difficulty.
moveTerms("kanji","N1+",["僧","婆","弥","舎","遮"]);
moveTerms("kanji","MASTER I",["劫","刹"]);

// Many textbook N1 constructions were previously labeled N1+.
// Move them back so Oni N1+ feels meaningfully beyond JLPT N1.
moveTerms("grammar","N1",[
 "～ずにはおかない","～ずにはすまない","～べく","～べくもない","～べからず","～まじき","～ともなく","～ともなしに","～かたわら","～がてら","～かたがた",
 "～に即して","～に照らして","～に鑑みて","～を踏まえて","～を経て","～を皮切りに","～を契機に","～をもって","～を限りに","～を境に","～を余儀なくされる","～を顧みず","～を押して",
 "～に足る","～に足りない","～に難くない","～なくして","～なしには","～あっての","～とあって","～とあれば","～としたところで","～ともあろうものが","～ならいざ知らず","～はおろか","～はさておき","～もさることながら","～にもまして","～ならでは","～に至って","～に至るまで","～に至っては","～にして初めて",
 "～きらいがある","～ないまでも","～までもなく","～に越したことはない","～の至り","～の極み","～極まりない","～をよそに","～に先駆けて","～に先立って","～にほかならない","～てやまない"
]);

// These are useful modern idioms, but not MASTER-I grammar difficulty.
moveTerms("grammar","N1",["～がましい","～びる","～じみる","～めく","～げ"]);
moveTerms("grammar","N1+",["～に拍車をかける","～に水を差す","～を彷彿とさせる","～を髣髴させる"]);

// Full classical auxiliaries belong to MASTER III, not the idiom/kanbun-flavored MASTER II tier.
moveTerms("grammar","MASTER III",[
 "～べし","～まじ","～む","～じ","～らむ","～けむ","～けり","～つ","～ぬ","～たり・り","～る・らる","～す・さす・しむ","～まほし","～たし","～ごとし",
 "～なり（断定）","～たり（断定）","～なり（伝聞・推定）","～めり","～らし"
]);

// The old 深淵 grammar was mostly standard classical-Japanese morphology.
// Put that system in MASTER III and reserve 深淵 for Kanbun / document-level structures.
moveTerms("grammar","MASTER III",[
 "ク活用","シク活用","ナリ活用","タリ活用","ラ行変格活用","ナ行変格活用","カ行変格活用","サ行変格活用","上一段活用","下一段活用","上二段活用","下二段活用","四段活用",
 "連体形終止","係り結び「こそ～已然形」","反実仮想「ましかば～まし」","願望「ばや」","願望「てしがな」","願望「にしがな」","禁止「な～そ」","詠嘆「かな」","詠嘆「かも」","終助詞「なむ」願望",
 "助動詞「じ」","助動詞「まし」","敬語「給ふ」四段","敬語「給ふ」下二段","敬語「侍り」","敬語「候ふ」"
]);

// Remove exact duplicates after the tier surgery.
for(const type of ["vocab","grammar","kanji"]){
 const seen=new Map();
 DB[type]=DB[type].filter(x=>{
  const k=`${x.level}|${x.term}|${x.reading||x.form||""}`;
  if(!seen.has(k)){seen.set(k,x);return true}
  const keep=seen.get(k);
  if(!keep.meaning&&x.meaning)keep.meaning=x.meaning;
  if(!keep.example&&x.example){keep.example=x.example;keep.kr=x.kr||keep.kr}
  return false;
 });
}

// Tight tier counts and selector isolation after reclassification.
counts=function(level){
 return {
  vocab:DB.vocab.filter(x=>x.level===level).length,
  grammar:DB.grammar.filter(x=>x.level===level).length,
  kanji:DB.kanji.filter(x=>x.level===level).length
 };
};
getFiltered=function(type,level){
 const arr=DB[type]||[];
 if(oni.enabled)return arr.filter(x=>x.level===oni.level);
 if(level&&level!=="전체")return arr.filter(x=>x.level===level&&NORMAL_LEVELS.includes(x.level));
 return arr.filter(x=>NORMAL_LEVELS.includes(x.level));
};

try{configureSelectors()}catch(e){}
try{renderOniCard()}catch(e){}
try{renderV103Guide()}catch(e){}
try{renderLibrary()}catch(e){}
try{updateUI()}catch(e){}


// ===== v10.6: POS memorization tables + Oni field filters =====
document.title="日本語 MASTER v10.6";

let tableDomainFilter="all";
const V106_POS=[
 ["전체","전체"],
 ["명사","명사"],
 ["동사","동사"],
 ["い형용사","い형용사"],
 ["な형용사","な형용사"],
 ["부사","부사"],
 ["기타","표현·기타"]
];

function v106Domain(x){
 const p=String(x.pos||"");
 const tags=Array.isArray(x.tags)?x.tags.join(" "):String(x.tags||"");
 const blob=(p+" "+tags+" "+String(x.nuance||"")+" "+String(x.meaning||""));
 if(/불교/.test(blob))return "buddhist";
 if(/법률|행정|공문|계약|채무|재판|소송/.test(blob))return "law";
 if(/학술|통계|철학|연구|이론|논리|비평/.test(blob))return "academic";
 if(/사자숙어|고사성어|고사/.test(blob))return "idiom";
 if(/고전|한문|훈독|문헌|고문/.test(blob))return "classical";
 if(/문학|문예|수사|시문/.test(blob)||x.level==="MASTER I"||x.level==="MASTER III")return "literary";
 return "modern";
}
const V106_DOMAIN_LABELS={
 all:"전체 분야",modern:"현대·논설",academic:"학술",law:"법률·행정",
 literary:"문학·문어",idiom:"사자숙어·고사",classical:"고전·한문",buddhist:"불교"
};

function v106BaseTablePool(){
 const level=document.getElementById("learnLevel")?.value||"N5";
 const pos=document.getElementById("learnPos")?.value||"전체";
 let arr=[...getFiltered("vocab",level)];
 if(pos!=="전체")arr=arr.filter(x=>normalizedPos(x)===pos);
 if(oni.enabled&&tableDomainFilter!=="all")arr=arr.filter(x=>v106Domain(x)===tableDomainFilter);
 if(tableStatusFilter==="new")arr=arr.filter(x=>!state.seen[x.id]?.count);
 if(tableStatusFilter==="again")arr=arr.filter(x=>(state.seen[x.id]?.rating||0)===1);
 if(tableStatusFilter==="hard")arr=arr.filter(x=>(state.seen[x.id]?.rating||0)===2);
 if(tableStatusFilter==="known")arr=arr.filter(x=>(state.seen[x.id]?.rating||0)>=3);
 if(tableStatusFilter==="star")arr=arr.filter(x=>state.starred[x.id]);
 if(tableSort==="smart")arr.sort((a,b)=>(state.seen[a.id]?.count||0)-(state.seen[b.id]?.count||0)||(state.seen[a.id]?.rating||0)-(state.seen[b.id]?.rating||0));
 if(tableSort==="hard")arr.sort((a,b)=>(state.seen[a.id]?.rating||0)-(state.seen[b.id]?.rating||0));
 if(tableSort==="term")arr.sort((a,b)=>String(a.term).localeCompare(String(b.term),"ja"));
 if(tableSort==="random")arr=shuffle(arr);
 if(tableSort==="star")arr.sort((a,b)=>(state.starred[b.id]?1:0)-(state.starred[a.id]?1:0));
 return arr;
}
tablePool=v106BaseTablePool;

function v106PosCounts(){
 const level=document.getElementById("learnLevel")?.value||"N5";
 let base=[...getFiltered("vocab",level)];
 if(oni.enabled&&tableDomainFilter!=="all")base=base.filter(x=>v106Domain(x)===tableDomainFilter);
 const c={전체:base.length,명사:0,동사:0,"い형용사":0,"な형용사":0,부사:0,기타:0};
 base.forEach(x=>{const p=normalizedPos(x);c[p]=(c[p]||0)+1});
 return c;
}
function v106DomainCounts(){
 const level=document.getElementById("learnLevel")?.value||"N5";
 const base=[...getFiltered("vocab",level)];
 const c={all:base.length,modern:0,academic:0,law:0,literary:0,idiom:0,classical:0,buddhist:0};
 base.forEach(x=>{const d=v106Domain(x);c[d]=(c[d]||0)+1});
 return c;
}
function setV106Pos(pos){
 const el=document.getElementById("learnPos");if(el)el.value=pos;
 tablePage=0;renderTableTools();renderVocabTable();
}
function setV106Domain(domain){
 tableDomainFilter=domain;tablePage=0;renderTableTools();renderVocabTable();
}
globalThis.setV106Pos=setV106Pos;
globalThis.setV106Domain=setV106Domain;

renderTableTools=function(){
 const el=document.getElementById("tableTools");if(!el)return;
 const pos=document.getElementById("learnPos")?.value||"전체",pc=v106PosCounts(),dc=v106DomainCounts();
 const posChips=V106_POS.map(([value,label])=>`<button type="button" class="v106-filter-chip ${pos===value?"active":""}" onclick="setV106Pos('${value}')"><span>${label}</span><b>${pc[value]||0}</b></button>`).join("");
 const domains=oni.enabled?Object.keys(V106_DOMAIN_LABELS).filter(k=>k==="all"||(dc[k]||0)>0):[];
 const domainHtml=oni.enabled?`<div class="v106-filter-section"><div class="v106-filter-label">사용 분야</div><div class="v106-chip-scroll">${domains.map(k=>`<button type="button" class="v106-domain-chip ${tableDomainFilter===k?"active":""}" onclick="setV106Domain('${k}')">${V106_DOMAIN_LABELS[k]} <b>${dc[k]||0}</b></button>`).join("")}</div></div>`:"";
 el.innerHTML=`
  <div class="v106-table-head">
   <div><b>품사별 암기표</b><small>원하는 품사만 골라 빠르게 훑어봐.</small></div>
   <span class="v106-current">${pos==="전체"?"전체 어휘":V106_POS.find(x=>x[0]===pos)?.[1]||pos}</span>
  </div>
  <div class="v106-filter-section"><div class="v106-filter-label">품사</div><div class="v106-chip-scroll">${posChips}</div></div>
  ${domainHtml}
  <div class="table-toolbar v106-table-toolbar">
   <button class="secondary" onclick="toggleTableMask('meaning')">${tableHideMeaning?"👁 뜻 보이기":"🙈 뜻 가리기"}</button>
   <button class="secondary" onclick="toggleTableMask('reading')">${tableHideReading?"👁 읽기 보이기":"🙈 읽기 가리기"}</button>
   <select onchange="tableStatusFilter=this.value;tablePage=0;renderVocabTable()">
    <option value="all" ${tableStatusFilter==="all"?"selected":""}>상태 전체</option>
    <option value="new" ${tableStatusFilter==="new"?"selected":""}>미학습</option>
    <option value="again" ${tableStatusFilter==="again"?"selected":""}>모름</option>
    <option value="hard" ${tableStatusFilter==="hard"?"selected":""}>애매함</option>
    <option value="known" ${tableStatusFilter==="known"?"selected":""}>숙달</option>
    <option value="star" ${tableStatusFilter==="star"?"selected":""}>★ 집중</option>
   </select>
   <select onchange="tableSort=this.value;tablePage=0;renderVocabTable()">
    <option value="smart" ${tableSort==="smart"?"selected":""}>추천순</option>
    <option value="hard" ${tableSort==="hard"?"selected":""}>어려운순</option>
    <option value="term" ${tableSort==="term"?"selected":""}>일본어순</option>
    <option value="random" ${tableSort==="random"?"selected":""}>무작위</option>
    <option value="star" ${tableSort==="star"?"selected":""}>별표순</option>
   </select>
   <select onchange="tablePageSize=+this.value;tablePage=0;renderVocabTable()">
    <option ${tablePageSize===20?"selected":""}>20</option>
    <option ${tablePageSize===30?"selected":""}>30</option>
    <option ${tablePageSize===50?"selected":""}>50</option>
    <option ${tablePageSize===100?"selected":""}>100</option>
   </select>
   <span class="table-stat" id="tableStat"></span>
  </div>`;
};

const v106OldSetStudyView=setStudyView;
setStudyView=function(v){
 v106OldSetStudyView(v);
 if(v==="table"){
  const pos=document.getElementById("learnPos");if(pos)pos.style.display="none";
  renderTableTools();
 }
};
const v106OldStudyChanged=v9StudyControlChanged;
v9StudyControlChanged=function(){
 if(studyView==="table"&&document.getElementById("learnCat")?.value!=="vocab")document.getElementById("learnCat").value="vocab";
 updatePosFilterVisibility();
 if(studyView==="table"){
  const p=document.getElementById("learnPos");if(p)p.style.display="none";
  tablePage=0;renderTableTools();renderVocabTable();
 }else v106OldStudyChanged();
};

// Reset field filter when changing Oni tier so a zero-result field cannot remain selected.
const v106ApplyMode=applyMode;
applyMode=function(){
 tableDomainFilter="all";
 v106ApplyMode();
 if(studyView==="table"){renderTableTools();renderVocabTable()}
};

const v106Style=document.createElement("style");
v106Style.textContent=`
.v106-table-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:11px}
.v106-table-head>div>b{display:block;font-size:17px}.v106-table-head>div>small{display:block;color:var(--muted);margin-top:3px}
.v106-current{border-radius:999px;padding:6px 9px;background:#eef1ff;color:#5369ca;font-size:11px;font-weight:950;white-space:nowrap}
.v106-filter-section{margin-top:9px}.v106-filter-label{font-size:11px;font-weight:950;color:var(--muted);margin-bottom:6px}
.v106-chip-scroll{display:flex;gap:6px;overflow-x:auto;padding:1px 1px 5px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.v106-chip-scroll::-webkit-scrollbar{display:none}
.v106-filter-chip,.v106-domain-chip{flex:0 0 auto;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 10px;font-weight:900;white-space:nowrap}
.v106-filter-chip b,.v106-domain-chip b{font-size:10px;color:var(--muted);margin-left:4px}
.v106-filter-chip.active{background:#25262a;color:#fff;border-color:#25262a}.v106-filter-chip.active b{color:#ddd}
.v106-domain-chip.active{background:#f2e4e9;color:#7e2946;border-color:#dfb9c6}.v106-domain-chip.active b{color:#9a5169}
body.oni-mode .v106-current{background:#f2e4e9;color:#7e2946}
body.oni-mode .v106-filter-chip.active{background:#6d243d;border-color:#6d243d}
.v106-table-toolbar{padding-top:10px;border-top:1px solid var(--line);margin-top:8px}
@media(max-width:680px){
 .v106-table-head{align-items:flex-start}.v106-table-head>div>small{max-width:260px}
 .v106-filter-chip,.v106-domain-chip{padding:8px 11px}
 .v106-table-toolbar select{flex:1 1 130px}
}
`;
document.head.appendChild(v106Style);

if(studyView==="table"){renderTableTools();renderVocabTable()}


// ===== v10.7: PWA launch defaults =====
document.title="日本語 MASTER v10.7";
function syncV107Badge(){
 const b=document.querySelector(".brand .badge");
 if(b&&!oni.enabled)b.textContent="v10.7";
}
const v107Apply=applyMode;
applyMode=function(){v107Apply();syncV107Badge()};
syncV107Badge();


// ===== v10.9: JLPT N5-N1 audit + core expansion =====
document.title="日本語 MASTER v10.9";

function addV109JLPTCore(){
 const vv=globalThis.NMK_V109_JLPT_VOCAB||[];
 for(const row of vv){
  const [level,term,reading,meaning,pos]=row;
  if(DB.vocab.some(x=>NORMAL_LEVELS.includes(x.level)&&x.term===term&&String(x.reading||"")===String(reading||"")))continue;
  DB.vocab.push({
   id:`v109_v_${level}_${DB.vocab.length}`,level,term,reading,meaning,pos,
   example:"",kr:"",examples:[],nuance:`${level} 시험 대비 핵심 어휘. 읽기·문맥·유의어까지 함께 확인해.`,
   jlptPriority:3,tags:[level,"JLPT","시험대비핵심",pos||"어휘"]
  });
 }
 const gg=globalThis.NMK_V109_JLPT_GRAMMAR||[];
 for(const row of gg){
  const [level,term,meaning,form,nuance,example,kr]=row;
  if(DB.grammar.some(x=>NORMAL_LEVELS.includes(x.level)&&x.term===term))continue;
  DB.grammar.push({
   id:`v109_g_${level}_${DB.grammar.length}`,level,term,meaning,form,nuance,
   example:example||"",kr:kr||"",similar:"",jlptPriority:3,tags:[level,"JLPT","시험대비핵심"]
  });
 }
 const kk=globalThis.NMK_V109_JLPT_KANJI||[];
 for(const row of kk){
  const [level,term,reading,meaning,words]=row;
  if(DB.kanji.some(x=>NORMAL_LEVELS.includes(x.level)&&x.term===term))continue;
  DB.kanji.push({
   id:`v109_k_${level}_${DB.kanji.length}`,level,term,reading,meaning,words,
   note:`${level} 예상 범위 핵심 한자 · 단독 암기보다 주요 熟語 속 읽기를 우선해.`,
   jlptPriority:3,tags:[level,"JLPT","시험대비핵심"]
  });
 }
}
addV109JLPTCore();

function v109Move(type,target,terms){
 const set=new Set(terms);
 (DB[type]||[]).forEach(x=>{if(NORMAL_LEVELS.includes(x.level)&&set.has(x.term))x.level=target});
}

// Vocabulary audit: obvious under/over-level placements from the old 60-item seed bank.
v109Move("vocab","N4",["大切"]);
v109Move("vocab","N2",["対応","制度","積極的","消極的"]);
v109Move("vocab","N1",["強いる","省みる","膨大"]);
v109Move("vocab","N2",["努める","曖昧","無難"]);

// Grammar audit: several former N5 items are normally learned with the N4 bridge material.
v109Move("grammar","N4",["～ことがある","～つもり","～ながら","～ので","～後で"]);
v109Move("grammar","N2",["～ことから"]);

// Kanji audit: the previous seed list was built from example words, so basic characters leaked into N2/N1.
v109Move("kanji","N5",["目","見"]);
v109Move("kanji","N4",["味","結","変"]);
v109Move("kanji","N3",["向","課","針","基","準","値","供","負","改","善","省","異","優","欠","念","観","置","余","根","協"]);
v109Move("kanji","N2",["識","態","趣","恩","恵","模"]);

const v109Rank={N5:0,N4:1,N3:2,N2:3,N1:4};
function v109DedupeNormal(){
 // Vocab: identical spelling+reading belongs to its earliest expected study level.
 const bestV=new Map();
 for(const x of DB.vocab){
  if(!NORMAL_LEVELS.includes(x.level))continue;
  const k=`${x.term}|${x.reading||""}`,old=bestV.get(k);
  if(!old||v109Rank[x.level]<v109Rank[old.level])bestV.set(k,x);
 }
 DB.vocab=DB.vocab.filter(x=>{
  if(!NORMAL_LEVELS.includes(x.level))return true;
  return bestV.get(`${x.term}|${x.reading||""}`)===x;
 });
 // Grammar: same pattern should not appear in two ordinary JLPT tiers.
 const bestG=new Map();
 for(const x of DB.grammar){
  if(!NORMAL_LEVELS.includes(x.level))continue;
  const k=x.term,old=bestG.get(k);
  if(!old||v109Rank[x.level]<v109Rank[old.level])bestG.set(k,x);
 }
 DB.grammar=DB.grammar.filter(x=>!NORMAL_LEVELS.includes(x.level)||bestG.get(x.term)===x);
 // Kanji: one introduction level per character in normal mode.
 const bestK=new Map();
 for(const x of DB.kanji){
  if(!NORMAL_LEVELS.includes(x.level))continue;
  const old=bestK.get(x.term);
  if(!old||v109Rank[x.level]<v109Rank[old.level])bestK.set(x.term,x);
 }
 DB.kanji=DB.kanji.filter(x=>!NORMAL_LEVELS.includes(x.level)||bestK.get(x.term)===x);
}
v109DedupeNormal();

// Give unseen high-priority JLPT core items precedence without adding another UI switch.
const v109StartLearnBase=startLearn;
startLearn=function(...args){
 const r=v109StartLearnBase(...args);
 try{
  if(!oni.enabled&&Array.isArray(learnDeck)&&learnDeck.length&&learnIndex===0){
   learnDeck.sort((a,b)=>{
    const ca=state.seen[a.id]?.count||0,cb=state.seen[b.id]?.count||0;
    return ca-cb || (b.jlptPriority||0)-(a.jlptPriority||0);
   });
   renderLearnCard();
  }
 }catch(e){}
 return r;
};

try{configureSelectors()}catch(e){}
try{renderLibrary()}catch(e){}
try{renderRoad()}catch(e){}
try{updateUI()}catch(e){}

})();