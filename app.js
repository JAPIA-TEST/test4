// -----------------------------
// ユーティリティ & ルーター
// -----------------------------
const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => [...parent.querySelectorAll(sel)];


const routes = $$("[data-route]").reduce((acc, el) => { acc[el.dataset.route] = el; return acc; }, {});
function setActiveLink(){
$$(".nav a[data-link]").forEach(a=>{
a.classList.toggle("active", a.getAttribute("href") === location.hash || (location.hash==="#/" && a.getAttribute("href")==="#/"));
})
}
function navigate(){
const hash = location.hash || "#/";
Object.values(routes).forEach(sec => sec.style.display = "none");
const key = hash.replace(/^#/, "");
(routes[key] || routes["/"]).style.display = "grid";
setActiveLink();
if(key === "/certificate") renderCertificate();
}
window.addEventListener("hashchange", navigate);

// -----------------------------
// 問題データ
// -----------------------------
const QUESTIONS = [
{ id:1, title:"HTMLの基本", text:"HTML文書の正しいDoctypeはどれ？", type:"single",
choices:["<!DOCTYPE html>", "<!DOCTYPE HTML5>", "<doctype html>", "<!HTML>"] , answer:[0] },
{ id:2, title:"CSSの優先順位", text:"優先順位が最も高いのは？", type:"single",
choices:["タグセレクタ", "!important付きスタイル", "クラスセレクタ", "子孫セレクタ"], answer:[1] },
{ id:3, title:"Flexbox", text:"メイン軸の方向を決めるプロパティは？", type:"single",
choices:["justify-content", "align-items", "flex-direction", "flex-wrap"], answer:[2] },
{ id:4, title:"JavaScriptの型", text:"次のうちプリミティブ型でないものは？", type:"single",
choices:["number", "string", "object", "boolean"], answer:[2] },
{ id:5, title:"イベント", text:"クリック時に実行される正しいイベント名は？", type:"single",
choices:["onpress", "onclick", "onpointer", "onfire"], answer:[1] },
{ id:6, title:"アクセシビリティ", text:"画像に代替テキストを設定する属性は？", type:"single",
choices:["title", "aria-label", "alt", "longdesc"], answer:[2] },
{ id:7, title:"ES Modules", text:"モジュールを読み込むscriptの正しい属性は？", type:"single",
choices:["type=module", "module=true", "esm", "import"], answer:[0] },
{ id:8, title:"配列メソッド", text:"条件を満たす最初の要素を返すメソッドは？", type:"single",
choices:["map", "filter", "find", "some"], answer:[2] },
{ id:9, title:"セキュリティ", text:"XSS対策として正しいのは？", type:"single",
choices:["ユーザー入力をHTMLとしてそのまま挿入", "入力値のエスケープ・サニタイズ", "全てのscriptを許可", "Cookieを常に共有"], answer:[1] },
{ id:10, title:"DOM操作", text:"id=appの要素を取得する最短の方法は？", type:"single",
choices:["document.getElementById('app')", "$('#app')", "document.query('#app')", "find('app')"], answer:[0] }
];


const PASSING_SCORE = 80; // 合格ライン

// -----------------------------
// 状態管理
// -----------------------------
const state = {
user: JSON.parse(localStorage.getItem("demo-user")||"null"),
answers: JSON.parse(localStorage.getItem("demo-answers")||"{}"),
current: 0,
score: null,
passedAt: localStorage.getItem("demo-passedAt") || null,
};


function save(){
localStorage.setItem("demo-user", JSON.stringify(state.user));
localStorage.setItem("demo-answers", JSON.stringify(state.answers));
if(state.passedAt) localStorage.setItem("demo-passedAt", state.passedAt);
}


function resetExam(){
state.answers = {}; state.current = 0; state.score = null; save();
$("#resultBox").className = "result"; $("#resultBox").textContent = "";
}

// -----------------------------
// ユーザー表示
// -----------------------------
function updateUserBadge(){
const badge = $("#userBadge");
const logout = $("#logoutBtn");
if(state.user){
badge.textContent = `ようこそ、${state.user.name} さん`;
logout.style.display = "inline-flex";
}else{
badge.textContent = "未ログイン";
logout.style.display = "none";
}
}


$("#logoutBtn").addEventListener("click", ()=>{
state.user = null; state.passedAt = null; save(); updateUserBadge();
alert("ログアウトしました"); location.hash = "#/";
})


// -----------------------------
// ログイン
// -----------------------------
$("#loginForm").addEventListener("submit", (e)=>{
e.preventDefault();
const name = e.target.name.value.trim();
if(!name){ alert("名前を入力してください"); return; }
state.user = { name };
save(); updateUserBadge();
alert("ログインしました");
location.hash = "#/exam";
})

// -----------------------------
// 検定UI
// -----------------------------
const total = QUESTIONS.length; $("#totalCount").textContent = total;


function renderQuestion(){
const q = QUESTIONS[state.current];
$("#qTitle").textContent = `Q${state.current+1}. ${q.title}`;
$("#qText").textContent = q.text;


const list = $("#choiceList");
list.innerHTML = "";
q.choices.forEach((c, i)=>{
const id = `q${q.id}-c${i}`;
const lab = document.createElement("label"); lab.className = "choice";
lab.innerHTML = `<input type="radio" name="q${q.id}" value="${i}" aria-labelledby="${id}"> <span id="${id}">${c}</span>`;
list.appendChild(lab);
})


// 既存解答を復元
const saved = state.answers[q.id];
if(typeof saved === 'number'){
const el = list.querySelector(`input[value="${saved}"]`); if(el) el.checked = true;
}


// ページ情報
$("#pageInfo").textContent = `${state.current+1} / ${total}`;
$("#progressBar").style.width = `${((state.current)/ (total)) * 100}%`;

// ボタン表示
$("#prevBtn").disabled = state.current===0;
$("#nextBtn").style.display = state.current < total-1 ? "inline-flex" : "none";
$("#submitBtn").style.display = state.current === total-1 ? "inline-flex" : "none";
}


function ensureLogin(){
if(!state.user){
if(confirm("ログインしてから開始しますか？")) location.hash = "#/login";
return false;
}
return true;
}


$("#startExamBtn").addEventListener("click", ()=>{
if(!ensureLogin()) return;
resetExam();
$("#questionArea").style.display = "block";
renderQuestion();
})


$("#prevBtn").addEventListener("click", ()=>{
saveSelection();
if(state.current>0){ state.current--; renderQuestion(); }
})
$("#nextBtn").addEventListener("click", ()=>{
if(!saveSelection()) return;
if(state.current<total-1){ state.current++; renderQuestion(); }
})


function saveSelection(){
const q = QUESTIONS[state.current];
const checked = $(`input[name="q${q.id}"]:checked`);
if(!checked){ alert("選択してください"); return false; }
state.answers[q.id] = Number(checked.value); save();
return true;
}


$("#submitBtn").addEventListener("click", () => {
  if (!saveSelection()) return;

  // 採点
  let correct = 0;
  for (const q of QUESTIONS) {
    if (typeof state.answers[q.id] !== "number") continue;
    if (q.answer.includes(state.answers[q.id])) correct++;
  }
  const score = Math.round((correct / total) * 100);
  state.score = score;

  const box = $("#resultBox");
  box.className = "result " + (score >= PASSING_SCORE ? "pass" : "fail");
  box.innerHTML =
    score >= PASSING_SCORE
      ? `<strong>合格！</strong> おめでとうございます。スコア：<strong>${score}点</strong>。<br>合格証ページから証書をダウンロードできます。`
      : `<strong>残念！</strong> スコア：<strong>${score}点</strong>。80点以上で合格です。もう一度挑戦しましょう！`;

  if (score >= PASSING_SCORE) {
    state.passedAt = new Date().toISOString();
    save();
  }
  $("#progressBar").style.width = "100%";
});
// -----------------------------
// 合格証の生成(Canvas)
// -----------------------------
function renderCertificate(){
const canvas = $("#certCanvas"); if(!canvas) return;
const ctx = canvas.getContext("2d");
// 背景
const w = canvas.width, h = canvas.height;
const grd = ctx.createLinearGradient(0,0,w,h);
grd.addColorStop(0, "#1b2555"); grd.addColorStop(.5, "#20306f"); grd.addColorStop(1, "#243a84");
ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);


// 額縁
ctx.strokeStyle = "#c6d2ff"; ctx.lineWidth = 10; ctx.strokeRect(30,30,w-60,h-60);
ctx.strokeStyle = "#9bb5ff"; ctx.lineWidth = 2; ctx.strokeRect(50,50,w-100,h-100);


// タイトル
ctx.fillStyle = "#ffffff";
ctx.font = "bold 64px system-ui, sans-serif"; ctx.textAlign = "center";
ctx.fillText("CERTIFICATE", w/2, 160);
ctx.font = "28px system-ui, sans-serif"; ctx.fillStyle = "#cfe1ff";
ctx.fillText("合格証書", w/2, 205);


// 受験者名
const name = state.user?.name || "（未ログイン）";
ctx.fillStyle = "#ffffff"; ctx.font = "48px system-ui, sans-serif";
ctx.fillText(name, w/2, 315);


// 本文
ctx.font = "24px system-ui, sans-serif"; ctx.fillStyle = "#deecff";
const lines = [
"あなたは当サイトのフロントエンド基礎検定において、",
"所定の基準を満たす成績を収めたことをここに証します。"
];
lines.forEach((t, i)=> ctx.fillText(t, w/2, 370 + i*32));


// 成績
const scoreLine = (state.score!=null) ? `${state.score} 点 / 合格ライン ${PASSING_SCORE} 点` : "スコア情報がありません";
ctx.font = "26px system-ui, sans-serif"; ctx.fillStyle = "#ffffff";
ctx.fillText(scoreLine, w/2, 450);

// 日付・ID
const dt = state.passedAt ? new Date(state.passedAt) : new Date();
const dateStr = `${dt.getFullYear()}年${String(dt.getMonth()+1).padStart(2,'0')}月${String(dt.getDate()).padStart(2,'0')}日`;
ctx.font = "22px system-ui, sans-serif"; ctx.fillStyle = "#cfe1ff";
ctx.fillText(`発行日：${dateStr}`, w/2, 490);


// シール
const cx = w - 210, cy = h - 210;
const g2 = ctx.createRadialGradient(cx-30, cy-30, 10, cx, cy, 120);
g2.addColorStop(0, "#ffe08a"); g2.addColorStop(1, "#d99100");
ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI*2); ctx.fill();
ctx.fillStyle = "#5a3d00"; ctx.font = "bold 44px system-ui, sans-serif"; ctx.textAlign = "center";
ctx.fillText("PASS", cx, cy+15);


// 署名
ctx.font = "20px system-ui, sans-serif"; ctx.fillStyle = "#cfe1ff"; ctx.textAlign = "left";
ctx.fillText("発行者：検定ポータル運営", 90, h-120);


// ダウンロードリンク更新
const link = $("#downloadCert");
link.href = canvas.toDataURL("image/png");
}


$("#renderCertBtn").addEventListener("click", renderCertificate);


// 年表示
$("#year").textContent = new Date().getFullYear();


// 初期表示
document.addEventListener("DOMContentLoaded", () => {
updateUserBadge();
navigate();
const pb = document.querySelector("#progressBar");
  if (pb) pb.style.width = "0%";
});

// 検定ページ直リンク対策：ロード時にプログレスバー初期化
$("#progressBar").style.width = "0%";
// 初期化の最後
document.querySelector("#year").textContent = new Date().getFullYear();
updateUserBadge();
navigate();
document.querySelector("#progressBar").style.width = "0%";

/* =========================
   Exam extended (CSV + Grade + HUD)
   元: index(20).html の試験ページを移植
   ========================= */

// ---- Core State ----
window.questions = window.questions || [];
window.dataReady = false;
window.selectedGrade = window.selectedGrade || 0;
let bank = [], order = [], current = 0, answers = {};

// ---- CSV Parsers ----
function parseCSV(str){
  const out=[]; let row=[], cur='', q=false;
  for(let i=0;i<str.length;i++){
    const ch=str[i], nx=str[i+1];
    if(q){
      if(ch=='"' && nx=='"'){ cur+='"'; i++; }
      else if(ch=='"'){ q=false; }
      else { cur+=ch; }
    }else{
      if(ch=='"'){ q=true; }
      else if(ch==','){ row.push(cur); cur=''; }
      else if(ch=='\n'){ row.push(cur); out.push(row); row=[]; cur=''; }
      else if(ch=='\r'){ /* skip */ }
      else { cur+=ch; }
    }
  }
  row.push(cur); out.push(row);
  return out.filter(r=>r.some(c=>String(c).trim()!==''));
}

function rowsToQuestions(rows){
  if(!rows.length) return [];
  const header = rows[0].map(h=>String(h||'').trim());
  const norm = s => String(s||'').toLowerCase().replace(/\s+/g,'').replace(/　/g,'');
  const findAny = cands => header.findIndex(h => cands.some(k => norm(h).includes(k)));
  const col = {
    id:     findAny(['id','識別','番号']),
    grade:  findAny(['grade','級','レベル','level','等級']),
    q:      findAny(['q','question','問題','設問','問']),
    c1:     findAny(['choice1','選択肢1','こたえ1','解答1','a)']),
    c2:     findAny(['choice2','選択肢2','こたえ2','解答2','b)']),
    c3:     findAny(['choice3','選択肢3','こたえ3','解答3','c)']),
    c4:     findAny(['choice4','選択肢4','こたえ4','解答4','d)']),
    c5:     findAny(['choice5','選択肢5','こたえ5','解答5','e)']),
    c6:     findAny(['choice6','選択肢6','こたえ6','解答6','f)']),
    answer: findAny(['answer','正解','解答','ans']),
    exp:    findAny(['exp','解説','説明','comment']),
    tags:   findAny(['tags','タグ','分類','カテゴリ']),
  };
  const hasHeader = col.q !== -1 && (col.c1 !== -1 || col.c2 !== -1);
  const start = hasHeader ? 1 : 0;
  const toHalf = s => String(s||'').replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0)-0xFEE0));
  const list = [];
  for(let r=start; r<rows.length; r++){
    const row = rows[r];
    const get = i => (i>=0 && i<row.length) ? String(row[i]||'').trim() : '';
    const q = get(col.q); if(!q) continue;
    const choices = [get(col.c1),get(col.c2),get(col.c3),get(col.c4),get(col.c5),get(col.c6)].filter(Boolean);
    if(choices.length<2) continue;
    let ansRaw = toHalf(get(col.answer)||'1'); const ansDig = ansRaw.match(/\d+/);
    const answer = ansDig ? Math.max(0, parseInt(ansDig[0],10)-1) : 0;
    let gRaw = toHalf(get(col.grade)||'4'); const gDig = gRaw.match(/[1-4]/);
    const grade = gDig ? parseInt(gDig[0],10) : 4;
    list.push({ id: get(col.id)||`q${r}`, grade, q, choices, answer });
  }
  return list;
}

// ---- Autoload CSV (UTF-8 / Shift_JIS fallback) ----
(function(){
  function stripBOM(s){ return s && s.charCodeAt(0)===0xFEFF ? s.slice(1) : s; }
  function decodeWithFallback(buf){
    try{ const u = new TextDecoder('utf-8',{fatal:false}).decode(buf); if(u && u.indexOf('\uFFFD')===-1) return u; }catch(e){}
    try{ return new TextDecoder('shift_jis',{fatal:false}).decode(buf); }catch(e){}
    try{ return new TextDecoder('utf-8').decode(buf); }catch(e){ return ''; }
  }
  async function fetchCsvTry(files){
    for(const f of files){
      try{
        const res = await fetch(f + '?v=' + Date.now(), {cache:'no-store'});
        if(res.ok){
          const buf = await res.arrayBuffer();
          const txt = decodeWithFallback(buf);
          if (txt && txt.trim()) return {name:f, text:txt};
        }
      }catch(e){ /* ignore */ }
    }
    return null;
  }
  async function autoload(){
    const got = await fetchCsvTry(['questions.csv','question.csv']);
    if(!got){ console.warn('[autoload] CSV not found'); return; }
    let csv = stripBOM(got.text).replace(/\r\n/g,'\n').replace(/\r/g,'\n');
    const rows = parseCSV(csv);
    const imported = rowsToQuestions(rows);
    if(Array.isArray(imported) && imported.length){
      window.questions.splice(0, window.questions.length, ...imported);
      window.dataReady = true;
      const el = document.getElementById('total-count'); if(el) el.textContent = String(imported.length);
      recountByGrade();
      console.log(`[autoload] ${got.name}: ${imported.length} questions`);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoload); else autoload();
})();

// ---- UI helpers ----
function recountByGrade(){
  const c = {1:0,2:0,3:0,4:0};
  (window.questions||[]).forEach(q=>{ const g=Number(q.grade); if(g>=1 && g<=4) c[g]++; });
  const tc = document.getElementById('total-count'); if(tc) tc.textContent = String((window.questions||[]).length || 0);
  return c;
}
function prepareBank(grade){
  const g = Number(grade||0);
  bank = (window.questions||[]).filter(q => Number(q.grade) === g);
  order = bank.map((_,i)=>i);
  current = 0; answers = {};
}
function renderCurrent(){
  const qi = order[current]; if(qi==null) return;
  const q = bank[qi];
  const box = document.getElementById('choices');
  document.getElementById('qtext').innerHTML = `<strong>Q.</strong> ${q.q}`;
  box.innerHTML = '';
  const nextBtn = document.getElementById('btn-next'); if(nextBtn) nextBtn.disabled = true;

  q.choices.forEach((c,idx)=>{
    const b = document.createElement('button');
    b.className = 'choice' + (answers[qi]===idx ? ' selected' : '');
    b.type = 'button';
    b.textContent = `${idx+1}. ${c}`;
    b.addEventListener('click', ()=>{
      answers[qi] = idx;
      box.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      if(nextBtn) nextBtn.disabled = false;
    });
    box.appendChild(b);
  });

  // 既回答ならNext有効
  if(answers.hasOwnProperty(qi) && nextBtn){ nextBtn.disabled = false; }
  document.getElementById('progress').textContent = `${current+1} / ${order.length}`;
  const prev = document.getElementById('btn-prev'); if(prev) prev.disabled = (current===0);
}
function finish(){
  let correct = 0;
  order.forEach(qi => { if(answers[qi] === bank[qi].answer) correct++; });
  const scorePct = Math.round((correct / order.length) * 100);
  document.getElementById('score').textContent = `正解数：${correct} / ${order.length}（${scorePct}点）`;

  // 既存の合格証機能へスコアを反映
  state.score = scorePct;
  if(scorePct >= PASSING_SCORE){ state.passedAt = new Date().toISOString(); save(); }

  document.getElementById('quiz').classList.add('hidden');
  document.getElementById('summary').classList.remove('hidden');
}
function backToMenu(skipConfirm){
  if(!skipConfirm && !confirm('試験を中断してメニューに戻ります。進捗は失われます。よろしいですか？')) return;
  answers = {}; current = 0; order = []; bank = [];
  document.getElementById('menu').classList.remove('hidden');
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('quiz').classList.add('hidden');
  document.getElementById('summary').classList.add('hidden');
}

// ---- bindings ----
document.addEventListener('DOMContentLoaded', ()=>{
  // CSV手動読み込み
  const fi = document.getElementById('file-questions');
  const btnImport = document.getElementById('btn-import');
  if(btnImport && fi){
    btnImport.addEventListener('click', ()=> fi.click());
    fi.addEventListener('change', async (e)=>{
      const f = e.target.files && e.target.files[0]; if(!f) return;
      const buf = await f.arrayBuffer();
      const dec = new TextDecoder('utf-8');
      const txt = dec.decode(buf);
      const rows = parseCSV(txt);
      const imported = rowsToQuestions(rows);
      if(imported.length){
        window.questions.splice(0, window.questions.length, ...imported);
        window.dataReady = true;
        recountByGrade();
        alert(`読み込み完了：${imported.length}問`);
      }else{
        alert('CSVの形式を確認してください（問題文と選択肢が必要です）');
      }
    });
  }

  // 級カード
  document.querySelectorAll('.grade').forEach(el=>{
    el.addEventListener('click', ()=>{
      window.selectedGrade = Number(el.dataset.grade||0);
      document.querySelectorAll('.grade').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      const lab = document.getElementById('selected-grade-label');
      if(lab) lab.textContent = '選択中: ' + window.selectedGrade + '級';
    });
  });

  // スタート
  const btnStart = document.getElementById('btn-start');
  if(btnStart){
    btnStart.addEventListener('click', (e)=>{
      e.preventDefault();
      if(!dataReady || !(window.questions||[]).length){ alert('問題データを読み込み中です'); return; }
      if(!window.selectedGrade){ alert('級を選んでください'); return; }
      prepareBank(window.selectedGrade);
      if(!bank.length){ alert(`${window.selectedGrade}級の問題が0件です`); return; }
      document.getElementById('menu').classList.add('hidden');
      document.getElementById('intro').classList.remove('hidden');
      document.getElementById('quiz').classList.remove('hidden');
      renderCurrent();
      // タイマー（級ごと制限時間）—必要なら調整
      startCountdown();
    });
  }

  // 前・次
  const pb = document.getElementById('btn-prev');
  const nb = document.getElementById('btn-next');
  if(pb) pb.addEventListener('click', ()=>{ if(current>0){ current--; renderCurrent(); } });
  if(nb) nb.addEventListener('click', ()=>{ if(current<order.length-1){ current++; renderCurrent(); } else { stopCountdown(); finish(); } });

  // メニューに戻る
  const rb = document.getElementById('btn-retry');
  const back = document.getElementById('btn-back-menu');
  if(rb) rb.addEventListener('click', ()=> backToMenu(true));
  if(back) back.addEventListener('click', ()=> backToMenu(false));
});

// ---- HUD タイマー（級ごとの制限時間）----
window.TIME_LIMIT_MINUTES = window.TIME_LIMIT_MINUTES || {1:30,2:25,3:20,4:15};
let _deadlineTs = null, _hudTimer = null;
function pad(n){ return (n<10?'0':'')+n; }
function fmt(secs){ secs=Math.max(0,secs|0); return pad(Math.floor(secs/60))+':'+pad(secs%60); }
function updateHud(){
  const timeEl = document.getElementById('hud-time');
  const remEl  = document.getElementById('hud-remaining');
  const secs = _deadlineTs ? Math.max(0, Math.floor((_deadlineTs-Date.now())/1000)) : 0;
  if(timeEl) timeEl.textContent = '残り時間: ' + fmt(secs);
  const total = order.length; const answered = Object.keys(answers).length;
  if(remEl) remEl.textContent = '残り問題数: ' + Math.max(0, total-answered) + '問';
  if(secs<=0){ stopCountdown(); finish(); }
}
function startCountdown(){
  const g = Number(window.selectedGrade||0);
  const min = Number((window.TIME_LIMIT_MINUTES||{})[g] || 20);
  _deadlineTs = Date.now() + min*60*1000;
  if(_hudTimer) clearInterval(_hudTimer);
  _hudTimer = setInterval(updateHud, 1000);
  updateHud();
}
function stopCountdown(){ if(_hudTimer){ clearInterval(_hudTimer); _hudTimer=null; } _deadlineTs=null; }


