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
})();