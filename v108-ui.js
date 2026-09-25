// 日本語 MASTER v10.8 — JLPT-first UI
(()=>{
"use strict";

const JLPT_LEVELS=["N5","N4","N3","N2","N1"];
let jlptTarget=(()=>{
 try{
  const v=localStorage.getItem("nmk_jlpt_target");
  return JLPT_LEVELS.includes(v)?v:"N5";
 }catch(e){return "N5"}
})();

function esc(s){return typeof escapeHtml==="function"?escapeHtml(s):String(s??"")}
function oniState(){try{return globalThis.nmkGetOniState?.()||{enabled:false,level:"N1+"}}catch(e){return {enabled:false,level:"N1+"}}}
function targetLevel(){const o=oniState();return o.enabled?o.level:jlptTarget}
function setUnderlyingTarget(){
 if(oniState().enabled)return;
 ["learnLevel","quizLevel","libLevel"].forEach(id=>{
   const el=document.getElementById(id);
   if(el&&[...el.options].some(o=>o.value===jlptTarget))el.value=jlptTarget;
 });
}
function setJLPTTarget(level){
 if(!JLPT_LEVELS.includes(level))return;
 jlptTarget=level;
 try{localStorage.setItem("nmk_jlpt_target",level)}catch(e){}
 setUnderlyingTarget();
 try{scheduleKoreanWarmup(level)}catch(e){}
 renderJLPTDashboard();
 renderLearnSetup();
 renderQuizSetup();
}
globalThis.setJLPTTarget=setJLPTTarget;

function p(level,cat){
 try{return progressFor(level,cat)}catch(e){return {total:0,seen:0,mastered:0,pct:0,mpct:0}}
}
function targetReviewItems(){
 const level=targetLevel(),types=["vocab","grammar","kanji"],out=[];
 for(const type of types){
  let arr=[];
  try{arr=getFiltered(type,level)}catch(e){}
  for(const x of arr){
   const s=state.seen[x.id];
   if(s&&(s.rating||0)<3)out.push({...x,_type:type});
  }
 }
 return out;
}
function weakestCat(level){
 const rows=["vocab","grammar","kanji"].map(cat=>({cat,...p(level,cat)})).filter(x=>x.total>0);
 rows.sort((a,b)=>a.pct-b.pct||a.seen-b.seen);
 return rows[0]?.cat||"vocab";
}
const CAT_UI={
 vocab:{icon:"🈶",name:"어휘",sub:"뜻·읽기·쓰임"},
 grammar:{icon:"🧩",name:"문법",sub:"접속·의미·차이"},
 kanji:{icon:"漢",name:"한자",sub:"단어 속 읽기"},
 mixed:{icon:"📚",name:"종합",sub:"어휘·문법·한자"}
};

function hiddenLegacyHooks(){
 return `<div class="v108-legacy-hooks" aria-hidden="true">
 <span id="dbCount"></span><span id="xpHome"></span><span id="streakHome"></span>
 <span id="reviewCount"></span><span id="overallLevel"></span><span id="overallBar"></span>
 <span id="estimate"></span><span id="skillHome"></span>
 </div>`;
}
function targetChips(){
 return JLPT_LEVELS.map(l=>`<button type="button" class="v108-target ${jlptTarget===l?"active":""}" data-jlpt-target="${l}">${l}</button>`).join("");
}
function progressCard(cat){
 const level=targetLevel(),q=p(level,cat),m=CAT_UI[cat];
 return `<button type="button" class="v108-area-card" data-v108-study="${cat}">
   <div class="v108-area-icon">${m.icon}</div>
   <div class="v108-area-body"><b>${m.name}</b><small>${m.sub}</small>
   <div class="v108-mini-progress"><span style="width:${q.pct}%"></span></div>
   <em>${q.seen}/${q.total} · ${q.pct}%</em></div>
 </button>`;
}

function renderJLPTDashboard(){
 const home=document.querySelector("#home .home-simple, #home .guided-home");
 if(!home)return;
 home.dataset.v103="1";
 home.className="v108-dashboard";
 const oniOn=oniState().enabled;
 const level=targetLevel();
 const rev=targetReviewItems().length;
 const weak=weakestCat(level);
 const w=CAT_UI[weak];
 const total=["vocab","grammar","kanji"].map(c=>p(level,c)).reduce((a,x)=>({seen:a.seen+x.seen,total:a.total+x.total}),{seen:0,total:0});
 const overall=total.total?Math.round(total.seen/total.total*100):0;

 if(oniOn){
   home.innerHTML=`
    <section class="v108-hero oni">
     <div class="v108-hero-top"><span class="v108-eyebrow">👹 鬼級 전용 학습</span><span class="v108-target-badge">${esc(level)}</span></div>
     <h2>${esc(level)}에서 오늘 할 것만</h2>
     <p>일반 JLPT 과정과 분리된 초고급 코스야. 현재 단계 안에서 어휘·문법·한자만 집중해.</p>
     <div class="v108-main-progress"><span style="width:${overall}%"></span></div>
     <div class="v108-main-action">
       <div><small>추천 시작</small><b>${rev>=5?`복습 ${rev}개 먼저`:`${w.name} 10개`}</b></div>
       <button class="primary" type="button" data-v108-primary>${rev>=5?"복습 시작":"학습 시작"} →</button>
     </div>
    </section>
    <section class="v108-section"><div class="v108-section-head"><h3>영역별 학습</h3><small>${esc(level)}만 출제</small></div>
      <div class="v108-area-grid">${["vocab","grammar","kanji"].map(progressCard).join("")}<button class="v108-area-card test" data-v108-test><div class="v108-area-icon">🎯</div><div class="v108-area-body"><b>문제풀이</b><small>10문제로 확인</small><em>현재 단계 전용</em></div></button></div>
    </section>
    ${hiddenLegacyHooks()}`;
   return;
 }

 home.innerHTML=`
  <section class="v108-target-panel">
   <div><span class="v108-label">목표 JLPT</span><b>어느 급수를 준비할까?</b></div>
   <div class="v108-targets">${targetChips()}</div>
  </section>
  <section class="v108-hero">
   <div class="v108-hero-top"><span class="v108-eyebrow">JLPT ${level} 합격 준비</span><span class="v108-overall">${overall}% 진행</span></div>
   <h2>오늘은 ${rev>=5?"복습부터":w.name+"부터"} 시작하면 돼</h2>
   <p>${rev>=5?`헷갈린 항목 ${rev}개가 남아 있어. 새 내용을 늘리기 전에 먼저 정리하자.`:`${level}에서 현재 가장 덜 진행된 영역이 ${w.name}이야. 10개만 공부하고 문제로 확인하면 돼.`}</p>
   <div class="v108-main-progress"><span style="width:${overall}%"></span></div>
   <div class="v108-main-action">
    <div><small>오늘의 첫 단계</small><b>${rev>=5?`복습 ${Math.min(rev,30)}개`:`${w.icon} ${w.name} 10개`}</b></div>
    <button class="primary" type="button" data-v108-primary>${rev>=5?"복습 시작":"오늘 학습 시작"} →</button>
   </div>
  </section>
  <section class="v108-section">
   <div class="v108-section-head"><h3>언어지식</h3><small>문자·어휘·문법을 급수별로</small></div>
   <div class="v108-area-grid">${["vocab","kanji","grammar"].map(progressCard).join("")}<button class="v108-area-card test" data-v108-test><div class="v108-area-icon">🎯</div><div class="v108-area-body"><b>문제풀이</b><small>${level} 10문제</small><em>학습한 내용 확인</em></div></button></div>
  </section>
  <section class="v108-section compact">
   <div class="v108-section-head"><h3>시험 준비</h3><small>필요할 때만</small></div>
   <div class="v108-exam-grid">
    <button data-v108-nav="diagnosis"><span>🩺</span><b>급수 진단</b><small>시작점·약점 확인</small></button>
    <button data-v108-nav="jlpt"><span>🗺️</span><b>${level} 로드맵</b><small>전체 범위 보기</small></button>
    <button data-v108-nav="reviewpage"><span>🔁</span><b>복습</b><small>${rev}개 남음</small></button>
   </div>
  </section>
  ${hiddenLegacyHooks()}`;
}

function startTargetStudy(cat,size=10){
 navTo("learnmode");
 const level=targetLevel();
 const lv=document.getElementById("learnLevel"),ct=document.getElementById("learnCat"),sz=document.getElementById("learnSize");
 if(lv)lv.value=level;if(ct)ct.value=cat;if(sz)sz.value=String(size);
 try{setStudyView("card")}catch(e){}
 startLearn(cat);
}
function startTargetReview(){
 const pool=targetReviewItems();
 if(!pool.length){startTargetStudy(weakestCat(targetLevel()),10);return}
 navTo("learnmode");
 try{setStudyView("card")}catch(e){}
 learnDeck=shuffle(pool).slice(0,30);learnIndex=0;
 renderLearnCard();
 syncStudyResetButton();
}
function startTargetQuiz(){
 navTo("quizpage");
 const lv=document.getElementById("quizLevel"),ct=document.getElementById("quizCat"),sz=document.getElementById("quizSize");
 if(lv)lv.value=targetLevel();if(ct)ct.value="mixed";if(sz)sz.value="10";
 startQuiz();
 syncQuizResetButton();
}
function startPrimary(){
 const rev=targetReviewItems().length;
 if(rev>=5)startTargetReview();else startTargetStudy(weakestCat(targetLevel()),10);
}

function ensureLearnUI(){
 const page=document.getElementById("learnmode");
 if(!page||document.getElementById("v108LearnHeader"))return;
 const top=page.querySelector(".study-top");
 if(!top)return;
 const h=document.createElement("div");
 h.id="v108LearnHeader";
 h.className="v108-learn-head";
 h.innerHTML=`<div><span class="v108-label">JLPT 학습</span><h2 id="v108LearnTitle">학습 설정</h2><p id="v108LearnSub">급수와 영역을 정하고 바로 시작해.</p></div><button class="secondary v108-reset" id="v108StudyReset" type="button">↩ 처음으로</button>`;
 top.before(h);
 const setup=document.createElement("div");
 setup.id="v108LearnSetup";
 setup.className="card v108-learn-setup";
 top.before(setup);
 top.classList.add("v108-legacy-study-top");
 renderLearnSetup();
}

function renderLearnSetup(){
 ensureLearnUI();
 const box=document.getElementById("v108LearnSetup");if(!box)return;
 const oniOn=oniState().enabled,level=targetLevel();
 const currentCat=document.getElementById("learnCat")?.value||"mixed";
 const size=document.getElementById("learnSize")?.value||"10";
 box.innerHTML=`
  <div class="v108-setup-top">
   <div><span class="v108-label">${oniOn?"鬼級":"목표 급수"}</span><b>${esc(level)}</b></div>
   ${oniOn?"":`<button type="button" class="ghost" data-v108-home-target>급수 변경</button>`}
  </div>
  <div class="v108-setup-block"><span>공부할 영역</span><div class="v108-choice-grid">
   ${["vocab","grammar","kanji","mixed"].map(c=>{const m=CAT_UI[c];return `<button type="button" class="${currentCat===c?"active":""}" data-v108-cat="${c}"><i>${m.icon}</i><b>${m.name}</b><small>${m.sub}</small></button>`}).join("")}
  </div></div>
  <div class="v108-setup-bottom">
   <div class="v108-amount"><span>학습량</span>${["10","20","30"].map(n=>`<button type="button" class="${size===n?"active":""}" data-v108-size="${n}">${n}개</button>`).join("")}</div>
   <div class="v108-start-actions"><button type="button" class="secondary" data-v108-table>▦ 암기표</button><button type="button" class="primary" data-v108-start>학습 시작 →</button></div>
  </div>`;
 syncStudyResetButton();
}
function resetStudyToSetup(){
 learnDeck=[];learnIndex=0;learnRevealed=false;
 const host=document.getElementById("learnSession");if(host)host.innerHTML="";
 const tools=document.getElementById("tableTools");if(tools)tools.style.display="none";
 try{setStudyView("card")}catch(e){}
 renderLearnSetup();
 syncStudyResetButton();
 window.scrollTo({top:0,behavior:"smooth"});
}
globalThis.resetStudyToSetup=resetStudyToSetup;
function syncStudyResetButton(){
 const btn=document.getElementById("v108StudyReset");
 const host=document.getElementById("learnSession");
 if(btn)btn.style.display=(host&&host.innerHTML.trim())?"inline-flex":"none";
 const setup=document.getElementById("v108LearnSetup");
 if(setup)setup.classList.toggle("session-active",!!(host&&host.innerHTML.trim()));
 const title=document.getElementById("v108LearnTitle"),sub=document.getElementById("v108LearnSub");
 if(title)title.textContent=(host&&host.innerHTML.trim())?"학습 진행 중":"학습 설정";
 if(sub)sub.textContent=(host&&host.innerHTML.trim())?"다른 메뉴에 다녀와도 이 세션은 그대로 유지돼. 처음부터 고르려면 오른쪽 버튼을 눌러.":"급수와 영역만 고르면 바로 시작돼.";
}

function ensureQuizUI(){
 const page=document.getElementById("quizpage");if(!page||document.getElementById("v108QuizSetup"))return;
 const old=document.getElementById("quizSetup");if(!old)return;
 const head=document.createElement("div");
 head.className="v108-learn-head";
 head.innerHTML=`<div><span class="v108-label">JLPT 문제풀이</span><h2 id="v108QuizTitle">10문제로 확인</h2><p>학습한 어휘·문법·한자를 바로 점검해.</p></div><button type="button" class="secondary v108-reset" id="v108QuizReset">↩ 처음으로</button>`;
 old.before(head);
 const box=document.createElement("div");box.id="v108QuizSetup";box.className="card v108-quiz-setup";old.before(box);
 old.classList.add("v108-legacy-quiz");
 renderQuizSetup();
}
function renderQuizSetup(){
 ensureQuizUI();
 const box=document.getElementById("v108QuizSetup");if(!box)return;
 const level=targetLevel(),cat=document.getElementById("quizCat")?.value||"mixed",size=document.getElementById("quizSize")?.value||"10";
 box.innerHTML=`<div class="v108-quiz-top"><div><span class="v108-label">${oniState().enabled?"鬼級":"목표 급수"}</span><b>${esc(level)}</b></div><span>정답은 바로 표시돼</span></div>
 <div class="v108-quiz-options"><div><span>출제 영역</span><div class="v108-inline-choices">${["mixed","vocab","grammar","kanji"].map(c=>`<button class="${cat===c?"active":""}" data-v108-qcat="${c}">${CAT_UI[c].name}</button>`).join("")}</div></div>
 <div><span>문항 수</span><div class="v108-inline-choices">${["10","20","30"].map(n=>`<button class="${size===n?"active":""}" data-v108-qsize="${n}">${n}문제</button>`).join("")}</div></div></div>
 <button type="button" class="primary v108-full-start" data-v108-qstart>문제풀이 시작 →</button>`;
 syncQuizResetButton();
}
function resetQuizToSetup(){
 quizDeck=[];quizIndex=0;quizAnswered=false;
 const h=document.getElementById("quizSession");if(h)h.innerHTML="";
 renderQuizSetup();syncQuizResetButton();window.scrollTo({top:0,behavior:"smooth"});
}
globalThis.resetQuizToSetup=resetQuizToSetup;
function syncQuizResetButton(){
 const btn=document.getElementById("v108QuizReset"),h=document.getElementById("quizSession");
 if(btn)btn.style.display=(h&&h.innerHTML.trim())?"inline-flex":"none";
 const box=document.getElementById("v108QuizSetup");if(box)box.style.display=(h&&h.innerHTML.trim())?"none":"block";
}

function simplifyNavigation(){
 const side=document.querySelector(".side .nav");
 if(side){
  side.innerHTML=`
   <button data-page="home">🏠 홈</button>
   <button data-page="learnmode">📘 JLPT 학습</button>
   <button data-page="reviewpage">🔁 복습</button>
   <button data-page="quizpage">🎯 문제풀이</button>
   <button data-page="more">☰ 더보기</button>`;
 }
 const bottom=document.querySelector(".bottom");
 if(bottom){
  bottom.innerHTML=`
   <button data-page="home">🏠<br>홈</button>
   <button data-page="learnmode">📘<br>학습</button>
   <button data-page="reviewpage">🔁<br>복습</button>
   <button data-page="quizpage">🎯<br>문제</button>
   <button data-page="more">☰<br>더보기</button>`;
 }
 document.querySelectorAll(".side .nav [data-page],.bottom [data-page]").forEach(b=>b.addEventListener("click",()=>navTo(b.dataset.page)));
}
function simplifyMore(){
 const grid=document.querySelector("#more .more-grid");if(!grid)return;
 const quiz=[...grid.querySelectorAll(".more-card")].find(x=>x.getAttribute("onclick")?.includes("quizpage"));
 if(quiz)quiz.style.display="none";
 const source=[...grid.querySelectorAll(".more-card")].find(x=>x.getAttribute("onclick")?.includes("openSourceLibraryFromMore"));
 if(source)source.style.display="none";
 const reset=[...grid.querySelectorAll(".more-card")].find(x=>x.getAttribute("onclick")?.includes("openResetModal"));
 if(reset)reset.style.display="none";
 if(!document.getElementById("v108FindCard")){
   const b=document.createElement("button");b.type="button";b.className="more-card";b.id="v108FindCard";
   b.innerHTML="<span>🔎</span><b>학습자료 찾기</b><small>단어·문법·한자 검색</small>";
   b.addEventListener("click",()=>navTo("library"));
   const road=[...grid.children].find(x=>x.getAttribute("onclick")?.includes("jlpt"));
   grid.insertBefore(b,road||grid.firstChild);
 }
 const r=[...grid.querySelectorAll(".more-card")].find(x=>x.getAttribute("onclick")?.includes("jlpt"));
 if(r){r.querySelector("b").textContent="JLPT 로드맵";r.querySelector("small").textContent="급수별 전체 범위";}
}

function syncTargetToPages(){
 if(!(oniState().enabled))setUnderlyingTarget();
 renderJLPTDashboard();renderLearnSetup();renderQuizSetup();
}
function init108(){
 simplifyNavigation();simplifyMore();ensureLearnUI();ensureQuizUI();syncTargetToPages();
}

document.addEventListener("click",e=>{
 const t=e.target.closest("[data-jlpt-target]");if(t){setJLPTTarget(t.dataset.jlptTarget);return}
 if(e.target.closest("[data-v108-primary]")){startPrimary();return}
 const s=e.target.closest("[data-v108-study]");if(s){startTargetStudy(s.dataset.v108Study,10);return}
 if(e.target.closest("[data-v108-test]")){startTargetQuiz();return}
 const n=e.target.closest("[data-v108-nav]");if(n){if(n.dataset.v108Nav==="jlpt"){try{roadLevel=jlptTarget;renderRoad();document.querySelectorAll("#roadLevels .level-chip").forEach(b=>b.classList.toggle("active",(b.textContent||"").trim()===jlptTarget))}catch(e){} }navTo(n.dataset.v108Nav);return}
 const c=e.target.closest("[data-v108-cat]");if(c){const el=document.getElementById("learnCat");if(el)el.value=c.dataset.v108Cat;renderLearnSetup();return}
 const z=e.target.closest("[data-v108-size]");if(z){const el=document.getElementById("learnSize");if(el)el.value=z.dataset.v108Size;renderLearnSetup();return}
 if(e.target.closest("[data-v108-start]")){const c=document.getElementById("learnCat")?.value||"mixed",size=+(document.getElementById("learnSize")?.value||10);startTargetStudy(c,size);return}
 if(e.target.closest("[data-v108-table]")){const lv=document.getElementById("learnLevel");if(lv)lv.value=targetLevel();const c=document.getElementById("learnCat");if(c)c.value="vocab";setStudyView("table");syncStudyResetButton();return}
 if(e.target.closest("[data-v108-home-target]")){navTo("home");return}
 const qc=e.target.closest("[data-v108-qcat]");if(qc){const el=document.getElementById("quizCat");if(el)el.value=qc.dataset.v108Qcat;renderQuizSetup();return}
 const qs=e.target.closest("[data-v108-qsize]");if(qs){const el=document.getElementById("quizSize");if(el)el.value=qs.dataset.v108Qsize;renderQuizSetup();return}
 if(e.target.closest("[data-v108-qstart]")){startTargetQuiz();return}
 if(e.target.closest("#v108StudyReset")){resetStudyToSetup();return}
 if(e.target.closest("#v108QuizReset")){resetQuizToSetup();return}
});

// Keep active sessions when navigating, but always expose a clear way back to setup.
const baseNavTo108=navTo;
navTo=function(id){
 baseNavTo108(id);
 const titles={home:"JLPT 홈",learnmode:"JLPT 학습",reviewpage:"복습",quizpage:"문제풀이",more:"더보기",library:"학습자료",jlpt:"JLPT 로드맵",diagnosis:"급수 진단",stats:"통계",searchpage:"검색"};
 const h=document.getElementById("pageTitle");if(h&&titles[id])h.textContent=titles[id];
 document.querySelectorAll(".side .nav [data-page],.bottom [data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
 if(id==="home")renderJLPTDashboard();
 if(id==="learnmode"){renderLearnSetup();syncStudyResetButton()}
 if(id==="quizpage"){renderQuizSetup();syncQuizResetButton()}
};

const baseRenderLearn108=renderLearnCard;
renderLearnCard=async function(...args){
 const r=await baseRenderLearn108(...args);
 syncStudyResetButton();return r;
};
const baseRenderQuiz108=renderQuiz;
renderQuiz=function(...args){const r=baseRenderQuiz108(...args);syncQuizResetButton();return r};

const baseStartLearn108=startLearn;
startLearn=function(...args){const r=baseStartLearn108(...args);setTimeout(syncStudyResetButton,30);return r};
const baseStartQuiz108=startQuiz;
startQuiz=function(...args){const r=baseStartQuiz108(...args);setTimeout(syncQuizResetButton,30);return r};

if(typeof applyMode==="function"){
 const baseApply108=applyMode;
 applyMode=function(){const r=baseApply108();setTimeout(syncTargetToPages,0);return r};
}

const style=document.createElement("style");
style.textContent=`
.v108-legacy-hooks{display:none!important}\nbody:not(.oni-mode) .top-actions button[title="진도 백업"]{display:none!important}
.v108-dashboard{max-width:1040px;margin:0 auto;display:grid;gap:13px}
.v108-target-panel{display:flex;align-items:center;justify-content:space-between;gap:14px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:13px 15px}
.v108-target-panel>div:first-child b{display:block;font-size:16px;margin-top:2px}.v108-label{display:block;color:var(--muted);font-size:11px;font-weight:950;letter-spacing:.02em}
.v108-targets{display:flex;gap:6px}.v108-target{border:1px solid var(--line);background:#fff;border-radius:11px;padding:8px 11px;font-weight:950}.v108-target.active{background:#202228;color:#fff;border-color:#202228}
.v108-hero{border:1px solid #eadfd4;border-radius:24px;background:linear-gradient(145deg,#fff9f1,#fff 58%,#f4f2ff);padding:23px;box-shadow:var(--shadow)}
.v108-hero.oni{background:linear-gradient(145deg,#fff7f9,#fff 55%,#f0e9f7);border-color:#e5ccd5}
.v108-hero-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.v108-eyebrow,.v108-target-badge{font-size:12px;font-weight:950}.v108-eyebrow{color:var(--accent)}.v108-target-badge{border-radius:999px;background:#542034;color:#fff;padding:6px 9px}.v108-overall{font-size:12px;font-weight:900;color:var(--muted)}
.v108-hero h2{margin:12px 0 7px;font-size:29px;line-height:1.3}.v108-hero p{margin:0;color:var(--muted);line-height:1.55}
.v108-main-progress{height:8px;background:#eee9e3;border-radius:99px;overflow:hidden;margin:16px 0}.v108-main-progress span,.v108-mini-progress span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),#ffb65b);border-radius:99px}
.v108-main-action{display:flex;align-items:center;justify-content:space-between;gap:12px;background:rgba(255,255,255,.85);border:1px solid #efe5dc;border-radius:16px;padding:12px}.v108-main-action small,.v108-main-action b{display:block}.v108-main-action small{color:var(--muted);font-size:11px}.v108-main-action b{font-size:17px;margin-top:3px}.v108-main-action .primary{min-width:160px}
.v108-section{background:#fff;border:1px solid var(--line);border-radius:20px;padding:16px}.v108-section-head{display:flex;align-items:end;justify-content:space-between;gap:10px;margin-bottom:10px}.v108-section-head h3{margin:0;font-size:18px}.v108-section-head small{color:var(--muted)}
.v108-area-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.v108-area-card{border:1px solid var(--line);background:#fff;border-radius:16px;padding:13px;text-align:left;display:flex;gap:10px;min-width:0}.v108-area-card:hover{border-color:#e7c9bd;background:#fffaf6}.v108-area-icon{font-size:23px;flex:0 0 auto}.v108-area-body{min-width:0;flex:1}.v108-area-body b,.v108-area-body small,.v108-area-body em{display:block}.v108-area-body small{font-size:11px;color:var(--muted);margin-top:2px}.v108-area-body em{font-size:10px;color:var(--muted);font-style:normal;margin-top:5px}.v108-mini-progress{height:5px;background:#eee;border-radius:99px;overflow:hidden;margin-top:9px}
.v108-area-card.test{background:#f8f8ff}
.v108-exam-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.v108-exam-grid button{border:1px solid var(--line);background:#fff;border-radius:14px;padding:12px;text-align:left}.v108-exam-grid span{font-size:21px}.v108-exam-grid b,.v108-exam-grid small{display:block}.v108-exam-grid b{margin:5px 0 2px}.v108-exam-grid small{color:var(--muted);font-size:11px}
.v108-learn-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;max-width:980px;margin:0 auto 10px}.v108-learn-head h2{margin:3px 0;font-size:23px}.v108-learn-head p{margin:0;color:var(--muted);font-size:12px}.v108-reset{display:none;white-space:nowrap}
.v108-learn-setup,.v108-quiz-setup{max-width:980px;margin:0 auto 12px;padding:16px}.v108-learn-setup.session-active{display:none}
.v108-legacy-study-top,.v108-legacy-quiz{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;opacity:0!important;pointer-events:none!important}
.v108-setup-top,.v108-quiz-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.v108-setup-top>div b,.v108-quiz-top>div b{display:block;font-size:22px}.v108-quiz-top>span{font-size:11px;color:var(--muted)}
.v108-setup-block{margin-top:14px}.v108-setup-block>span,.v108-quiz-options>div>span{display:block;font-size:11px;color:var(--muted);font-weight:950;margin-bottom:7px}
.v108-choice-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.v108-choice-grid button{border:1px solid var(--line);background:#fff;border-radius:14px;padding:12px;text-align:left}.v108-choice-grid button i{font-style:normal;font-size:21px}.v108-choice-grid button b,.v108-choice-grid button small{display:block}.v108-choice-grid button b{margin-top:5px}.v108-choice-grid button small{color:var(--muted);font-size:10px;margin-top:2px}.v108-choice-grid button.active{border-color:#ffad97;background:#fff7f3;box-shadow:0 0 0 2px rgba(255,120,88,.08)}
.v108-setup-bottom{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-top:13px;border-top:1px solid var(--line);padding-top:12px}.v108-amount span{display:block;font-size:11px;color:var(--muted);font-weight:950;margin-bottom:6px}.v108-amount button,.v108-inline-choices button{border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 10px;font-weight:850;margin-right:4px}.v108-amount button.active,.v108-inline-choices button.active{background:#25262a;color:#fff;border-color:#25262a}.v108-start-actions{display:flex;gap:7px}
.v108-quiz-options{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.v108-inline-choices{display:flex;gap:5px;flex-wrap:wrap}.v108-full-start{width:100%;margin-top:14px;padding:13px}
body.oni-mode .v108-choice-grid button.active,body.oni-mode .v108-inline-choices button.active{background:#68233c;border-color:#68233c}.v108-hero.oni .v108-eyebrow{color:#7d2947}
@media(max-width:760px){
 .v108-target-panel{align-items:flex-start;flex-direction:column}.v108-targets{width:100%;display:grid;grid-template-columns:repeat(5,1fr)}.v108-target{padding:8px 4px}
 .v108-hero{padding:17px}.v108-hero h2{font-size:24px}.v108-main-action{align-items:stretch;flex-direction:column}.v108-main-action .primary{width:100%}
 .v108-area-grid{grid-template-columns:1fr 1fr}.v108-exam-grid{grid-template-columns:1fr 1fr}.v108-exam-grid button:last-child{grid-column:1/-1}
 .v108-choice-grid{grid-template-columns:1fr 1fr}.v108-setup-bottom{align-items:stretch;flex-direction:column}.v108-start-actions{display:grid;grid-template-columns:1fr 1fr;width:100%}.v108-start-actions button{width:100%}
 .v108-quiz-options{grid-template-columns:1fr}.v108-learn-head{align-items:center}
}
@media(max-width:390px){.v108-area-grid{grid-template-columns:1fr}.v108-exam-grid{grid-template-columns:1fr}.v108-exam-grid button:last-child{grid-column:auto}}
`;
document.head.appendChild(style);

init108();
})();