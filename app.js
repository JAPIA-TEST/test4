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
let QUESTIONS = [
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
let total = QUESTIONS.length;
function refreshTotal(){
  total = QUESTIONS.length;
  const el = document.getElementById("totalCount");
  if (el) el.textContent = String(total);
}
refreshTotal();


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
updateUserBadge();
navigate();


// 検定ページ直リンク対策：ロード時にプログレスバー初期化
$("#progressBar").style.width = "0%";
// 初期化の最後
document.querySelector("#year").textContent = new Date().getFullYear();
updateUserBadge();
navigate();
document.querySelector("#progressBar").style.width = "0%";

// ========= CSV 取り込み（UTF-8 / Shift_JIS 自動判定） =========

// 1) ざっくりCSVパーサ（"","" エスケープ対応）
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
      else if(ch=='\r'){ /* ignore */ }
      else { cur+=ch; }
    }
  }
  row.push(cur); out.push(row);
  // 空行を除去
  return out.filter(r => r.some(c => String(c).trim() !== ''));
}

// 2) rows → 既存UIの QUESTIONS 形式へ（列名はゆるく対応）
function rowsToQuestions(rows){
  if(!rows.length) return [];
  const header = rows[0].map(h => String(h||'').trim());
  const norm = s => String(s||'').toLowerCase().replace(/\s+/g,'').replace(/　/g,'');
  const findAny = keys => header.findIndex(h => keys.some(k => norm(h).includes(k)));

  const col = {
    q:      findAny(['question','問題','設問','問','q']),
    c1:     findAny(['choice1','選択肢1','a)']),
    c2:     findAny(['choice2','選択肢2','b)']),
    c3:     findAny(['choice3','選択肢3','c)']),
    c4:     findAny(['choice4','選択肢4','d)']),
    c5:     findAny(['choice5','選択肢5','e)']),
    c6:     findAny(['choice6','選択肢6','f)']),
    answer: findAny(['answer','正解','解答','ans'])
  };

  const hasHeader = col.q !== -1 && (col.c1 !== -1 || col.c2 !== -1);
  const start = hasHeader ? 1 : 0;

  const toHalf = s => String(s||'').replace(/[０-９]/g, d => String.fromCharCode(d.charCodeAt(0)-0xFEE0));

  const list=[];
  for(let r=start; r<rows.length; r++){
    const row = rows[r], get = i => (i>=0 && i<row.length) ? String(row[i]||'').trim() : '';
    const text = get(col.q); if(!text) continue;
    const choices = [get(col.c1),get(col.c2),get(col.c3),get(col.c4),get(col.c5),get(col.c6)].filter(Boolean);
    if(choices.length < 2) continue;

    let ansRaw = toHalf(get(col.answer) || '1');
    const m = ansRaw.match(/\d+/);
    const ansIndex = m ? Math.max(0, parseInt(m[0],10) - 1) : 0;

    list.push({
      id: r, title: `Q${r}`, text, type:'single',
      choices, answer:[ansIndex]
    });
  }
  return list;
}

// 3) ファイル読込 → QUESTIONS 差し替え
async function importCsvFile(file){
  const buf = await file.arrayBuffer();

  // まずUTF-8、ダメならShift_JIS
  let txt;
  try{
    const u = new TextDecoder('utf-8',{fatal:false}).decode(buf);
    if(u && !u.includes('\uFFFD')) txt = u;
  }catch(e){}
  if(!txt){
    try{ txt = new TextDecoder('shift_jis',{fatal:false}).decode(buf); }catch(e){}
  }
  if(!txt){ txt = new TextDecoder('utf-8').decode(buf); }

  const rows = parseCSV(txt.replace(/\r\n/g,'\n').replace(/\r/g,'\n'));
  const imported = rowsToQuestions(rows);
  if(!imported.length) throw new Error('CSVの形式を確認してください（問題文と選択肢2つ以上、正解は1始まり）');

  // 上書き
  QUESTIONS = imported;

  // 件数を最新化
  if (typeof refreshTotal === 'function') refreshTotal();
  else {
    // フォールバック
    const el = document.getElementById('totalCount');
    if (el) el.textContent = String(QUESTIONS.length);
  }

  // 状態表示
  const sEl = document.getElementById('csvStatus');
  if(sEl) sEl.textContent = `読み込み完了：${QUESTIONS.length}問`;

  // 進行中の受験をリセット（旧UIの場合）
  const qa = document.getElementById('questionArea');
  if (qa) {
    state.answers = {}; state.current = 0; state.score = null;
    qa.style.display = 'none';
    const resultBox = document.getElementById('resultBox');
    if(resultBox){ resultBox.className='result'; resultBox.textContent=''; }
  }
}

// 4) ボタン連携（/exam のUI起動時に使えるように）
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('csvFile');
  const btnImport = document.getElementById('btnImport');
  if(btnImport && fileInput){
    btnImport.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e)=>{
      const f = e.target.files && e.target.files[0];
      if(!f) return;
      try{
        await importCsvFile(f);
        alert('CSVを読み込みました。検定を開始すると新しい問題が出題されます。');
      }catch(err){
        console.error(err);
        alert('CSVの読み込みに失敗しました：' + err.message);
      }
    });
  }

  // 画面ロード時に件数表示を現在の QUESTIONS で反映
  if (typeof refreshTotal === 'function') refreshTotal();
});

// 5) 「検定を開始」を押した瞬間も件数を最新化（任意）
document.getElementById('startExamBtn')?.addEventListener('click', ()=>{
  if (typeof refreshTotal === 'function') refreshTotal();
}, { once:false });

// =========================
// /exam で questions.csv を自動読込
// =========================
let __csvAutoLoaded = false;

function __basePathForPages(){
  // 例: /test4/index.html → /test4/
  const p = location.pathname;
  return p.endsWith("/") ? p : p.replace(/\/[^/]*$/, "/");
}

async function __autoLoadCsvOnce(){
  if (__csvAutoLoaded) return;
  const base = __basePathForPages();                       // 例: /test4/
  const candidates = [
    new URL("questions.csv", location.origin + base).toString(),
    new URL("question.csv",  location.origin + base).toString()
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url + "?v=" + Date.now(), { cache: "no-store" });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();

      // UTF-8優先, ダメなら Shift_JIS → 最後にUTF-8ゆるデコード
      let txt;
      try { const u = new TextDecoder("utf-8",{fatal:false}).decode(buf); if (u && !u.includes("\uFFFD")) txt = u; } catch(e){}
      if (!txt) { try { txt = new TextDecoder("shift_jis",{fatal:false}).decode(buf); } catch(e){} }
      if (!txt)   txt = new TextDecoder("utf-8").decode(buf);

      const rows = parseCSV(txt.replace(/\r\n/g,"\n").replace(/\r/g,"\n"));
      const imported = rowsToQuestions(rows);
      if (Array.isArray(imported) && imported.length) {
        // 既存の問題配列を置き換え
        QUESTIONS = imported;
        if (typeof refreshTotal === "function") refreshTotal();
        const s = document.getElementById("csvStatus");
        if (s) s.textContent = `自動読込：${QUESTIONS.length}問（${url.split("/").pop()}）`;
        __csvAutoLoaded = true;
        console.log(`[auto-csv] loaded: ${url} (${QUESTIONS.length}問)`);
        return;
      }
    } catch (e) {
      console.warn("[auto-csv] fetch error", e);
    }
  }
  console.warn("[auto-csv] CSV not found at", candidates);
}

// /exam に入った時だけトリガー
document.addEventListener("DOMContentLoaded", () => {
  if (location.hash === "#/exam") __autoLoadCsvOnce();
});
window.addEventListener("hashchange", () => {
  if (location.hash === "#/exam") __autoLoadCsvOnce();
});
