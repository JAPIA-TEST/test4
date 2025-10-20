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
$("#progressBar").style.width = "0%";