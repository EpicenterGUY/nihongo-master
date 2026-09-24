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
let oni=(()=>{try{return JSON.parse(localStorage.getItem("nmk_oni_mode")||"null")||{enabled:false,level:"N1+"}}catch(e){return {enabled:false,level:"N1+"}}})();
if(!ONI_LEVELS.includes(oni.level))oni.level="N1+";

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
function enterOni(level){oni={enabled:true,level};localStorage.setItem("nmk_oni_mode",JSON.stringify(oni));applyMode();navTo("home");toast(`👹 ${level} 오니 모드`)}
function exitOni(){oni.enabled=false;localStorage.setItem("nmk_oni_mode",JSON.stringify(oni));applyMode();navTo("home");toast("일반 모드로 돌아왔어")}
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
v101Style.textContent=\`
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
\`;
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
 card.innerHTML=\`<div class="title"><span>👹 오니 모드</span><span class="badge">N1+ 이상 전용</span></div>
 <p class="muted small">일반 학습과 완전히 분리된 초고급 코스야. 난이도를 하나 고르면 학습·암기표·찾기·퀴즈·복습·로드맵이 그 단계만 취급해.</p>
 <select id="oniLevelSelect" class="oni-select-fallback" aria-label="오니 난이도">\${ONI_LEVELS.map(l=>\`<option value="\${l}">\${l}</option>\`).join("")}</select>
 <div class="oni-tier-grid">\${ONI_LEVELS.map(l=>\`<button type="button" class="oni-tier-btn" data-oni-pick="\${l}"><span>\${l}</span><small>\${META[l].label}</small></button>\`).join("")}</div>
 <div id="oniLevelInfo" class="oni-level-info"></div>
 <div class="oni-setting-actions"><button type="button" class="oni-enter" id="oniEnterBtn">선택한 난이도로 입장</button><button type="button" class="secondary" id="oniExitBtn" style="display:none">일반 모드로 돌아가기</button></div>\`;
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

const v101OldRenderOniCard=renderOniCard;
renderOniCard=function(){
 v101OldRenderOniCard();
 const sel=document.getElementById("oniLevelSelect");const level=sel?.value||oni.level;
 document.querySelectorAll("[data-oni-pick]").forEach(b=>b.classList.toggle("active",b.dataset.oniPick===level));
 const enter=document.getElementById("oniEnterBtn");if(enter)enter.textContent=oni.enabled&&level===oni.level?\`\${level} 적용 중\`:\`\${level}로 입장\`;
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
 host.innerHTML=\`<div class="oni-home-shell"><div class="oni-home-head"><div><span class="oni-rank-mark">👹 鬼級 · \${escapeHtml(oni.level)}</span><h2>\${escapeHtml(meta.label)} 전용 학습실</h2><p>\${escapeHtml(meta.desc)}</p></div><button class="secondary" type="button" data-oni-action="settings">난이도 변경</button></div>
 <div class="oni-progress-grid">\${rows.map(r=>\`<div class="oni-progress-card"><b>\${r.icon} \${r.name}</b><div class="oni-pct">\${r.p.pct}%</div><small>\${r.p.seen}/\${r.p.total} 학습 · \${r.p.mastered} 숙달</small><div class="progress"><span style="width:\${r.p.pct}%"></span></div></div>\`).join("")}</div>
 <div class="oni-quick-actions"><button class="oni-action primary-action" type="button" data-oni-action="recommended"><span>▶</span><b>오니 학습 시작</b><small>가장 덜 진행된 영역부터</small></button><button class="oni-action" type="button" data-oni-action="table"><span>▦</span><b>어휘 암기표</b><small>\${c.vocab}개 중 빠르게 훑기</small></button><button class="oni-action" type="button" data-oni-action="grammar"><span>🧩</span><b>문법 집중</b><small>\${c.grammar}개 문형 학습</small></button><button class="oni-action" type="button" data-oni-action="quiz"><span>🎯</span><b>오니 퀴즈</b><small>\${escapeHtml(oni.level)}만 출제</small></button></div></div>\`;
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
 const learnLock=document.getElementById("oniLearnLock"),quizLock=document.getElementById("oniQuizLock");if(learnLock)learnLock.textContent=\`👹 \${oni.level}\`;if(quizLock)quizLock.textContent=\`👹 \${oni.level}\`;
 const chip=document.querySelector("#home .reco-chip");if(chip)chip.textContent=oni.enabled?"鬼級 전용 코스":"오늘의 일본어";
 const heroStart=document.querySelector("#home .hero-start");if(heroStart)heroStart.textContent=oni.enabled?"오니 학습 시작":"오늘 공부 시작";
 const reviewBtn=document.querySelector("#home .simple-hero .secondary");if(reviewBtn&&oni.enabled)reviewBtn.childNodes[0].nodeValue="오니 복습 ";
 if(reviewBtn&&!oni.enabled)reviewBtn.childNodes[0].nodeValue="복습 ";
 const findTitle=document.querySelector("#library .find-head h2"),findDesc=document.querySelector("#library .find-head p");if(findTitle)findTitle.textContent=oni.enabled?\`👹 \${oni.level} 찾기\`:"찾기";if(findDesc)findDesc.textContent=oni.enabled?\`\${oni.level} 안에서만 어휘·문법·한자를 찾아.\`:"단어·문법·한자를 바로 찾고 자세히 볼 수 있어.";
 const sourceLevel=document.getElementById("sourceLevel");if(sourceLevel){
   if(!sourceLevel.dataset.normalOptions)sourceLevel.dataset.normalOptions=sourceLevel.innerHTML;
   if(oni.enabled){sourceLevel.innerHTML=\`<option value="\${oni.level}">\${oni.level}</option>\`;sourceLevel.value=oni.level}else if(sourceLevel.dataset.normalOptions){sourceLevel.innerHTML=sourceLevel.dataset.normalOptions}
 }
 const more=document.getElementById("more");if(more){
   const road=more.querySelector(".more-card[onclick*=\\"jlpt\\"]"),diag=more.querySelector(".more-card[onclick*=\\"diagnosis\\"]"),stats=more.querySelector(".more-card[onclick*=\\"stats\\"]"),reset=more.querySelector(".more-card[onclick*=\\"openResetModal\\"]"),details=more.querySelector(":scope > details");
   [diag,stats,reset].forEach(x=>{if(x)x.style.display=oni.enabled?"none":""});if(details)details.style.display=oni.enabled?"none":"";
   if(road){const b=road.querySelector("b"),s=road.querySelector("small");if(b)b.textContent=oni.enabled?\`\${oni.level} 로드맵\`:"전체 로드맵";if(s)s.textContent=oni.enabled?"선택 난이도만 진행":"급수·단원별 진행"}
 }
 const roadIntro=document.getElementById("oniRoadIntro");if(roadIntro&&oni.enabled)roadIntro.innerHTML=\`<span class="oni-rank-mark">👹 \${escapeHtml(oni.level)}</span><h2 style="margin:9px 0 4px">\${escapeHtml(META[oni.level].label)} 로드맵</h2><p class="muted" style="margin:0">\${escapeHtml(META[oni.level].desc)}</p>\`;
 const roadCards=[...document.querySelectorAll("#jlpt > .card")];roadCards.slice(0,2).forEach(x=>x.style.display=oni.enabled?"none":"");
 const roadTitle=document.querySelector("#jlpt .book-head h2");if(roadTitle){if(!roadTitle.dataset.normalText)roadTitle.dataset.normalText=roadTitle.textContent;roadTitle.textContent=oni.enabled?\`鬼級 \${oni.level} 로드맵\`:roadTitle.dataset.normalText}
 if(oni.enabled&&libType&&!['vocab','grammar','kanji'].includes(libType)){libType='vocab';document.querySelectorAll('#libTabs .tab').forEach(x=>x.classList.toggle('active',x.dataset.type==='vocab'))}
 const pt=document.getElementById("pageTitle");if(pt&&oni.enabled&&document.querySelector(".page.active")){
   const id=document.querySelector(".page.active").id;const labels={home:"홈",learnmode:"배우기",reviewpage:"복습",library:"찾기",more:"설정",quizpage:"퀴즈",jlpt:"로드맵",searchpage:"검색"};if(labels[id])pt.textContent=\`👹 \${oni.level} · \${labels[id]}\`;
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

})();