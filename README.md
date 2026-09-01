<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Follower AI</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#090d16;color:#fff;font-family:Arial,sans-serif}
.app{max-width:650px;margin:auto;padding:22px}
header{text-align:center;padding:20px 0}
.logo{font-size:42px}
h1{margin:8px 0;font-size:28px}
.sub{color:#9da8bb}
.card{background:#131a27;border:1px solid #263044;border-radius:18px;padding:20px;margin:14px 0}
h2{font-size:19px;margin-top:0}
label{display:block;margin:14px 0 7px;color:#cbd3e1}
input,select,textarea{
width:100%;padding:13px;border-radius:10px;
border:1px solid #303b52;background:#0c121e;color:#fff;
font-size:15px
}
textarea{min-height:90px;resize:vertical}
button{
width:100%;padding:14px;margin-top:18px;border:0;
border-radius:11px;background:#ff6b00;color:#fff;
font-size:16px;font-weight:bold
}
.result{margin-top:18px;line-height:2;color:#dbe3ef}
.stat{display:inline-block;width:48%;background:#0c121e;padding:14px;border-radius:12px;margin:1%;text-align:center}
.small{color:#929db1;font-size:13px}
</style>
</head>

<body>
<div class="app">

<header>
<div class="logo">🔥</div>
<h1>Follower AI</h1>
<div class="sub">دستیار هوشمند رشد فالوور هدفمند</div>
</header>

<div class="card">
<h2>🎯 پروفایل پیج</h2>

<label>موضوع پیج</label>
<input id="niche" placeholder="مثلاً آتش نشانی + بدنسازی">

<label>فالوور فعلی</label>
<input id="followers" type="number" placeholder="مثلاً 2500">

<label>هدف اصلی</label>
<select id="goal">
<option>افزایش فالوور هدفمند</option>
<option>افزایش بازدید ریلز</option>
<option>افزایش تعامل</option>
</select>

<button onclick="createPlan()">ساخت استراتژی 🚀</button>
</div>

<div class="card">
<h2>📊 تحلیل ریلز</h2>

<label>بازدید</label>
<input id="views" type="number" placeholder="3000">

<label>لایک</label>
<input id="likes" type="number" placeholder="150">

<label>کامنت</label>
<input id="comments" type="number" placeholder="20">

<label>اشتراک‌گذاری</label>
<input id="shares" type="number" placeholder="10">

<label>ذخیره</label>
<input id="saves" type="number" placeholder="15">

<label>فالوور جدید</label>
<input id="newfollowers" type="number" placeholder="30">

<button onclick="analyze()">تحلیل ریلز 🔍</button>
<div id="analysis" class="result"></div>
</div>

<div class="card">
<h2>🔥 برنامه امروز</h2>
<div id="daily" class="result">
برای دریافت برنامه، ابتدا اطلاعات پیجت را وارد کن.
</div>
</div>

</div>

<script>
function createPlan(){

const niche=document.getElementById("niche").value || "حوزه فعالیت شما";
const followers=document.getElementById("followers").value || "نامشخص";
const goal=document.getElementById("goal").value;

document.getElementById("daily").innerHTML=`
<strong>استراتژی رشد برای: ${niche}</strong><br><br>
👥 فالوور فعلی: ${followers}<br>
🎯 هدف: ${goal}<br><br>

<strong>برنامه امروز:</strong><br>
1️⃣ یک ریلز کوتاه با Hook بسیار قوی منتشر کن.<br>
2️⃣ موضوع ریلز باید یک مشکل واقعی مخاطب هدف را حل کند.<br>
3️⃣ در 3 ثانیه اول نتیجه یا
