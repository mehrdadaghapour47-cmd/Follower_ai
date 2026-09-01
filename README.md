<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Follower AI</title>

<style>
*{
box-sizing:border-box;
}

body{
margin:0;
background:#080c14;
color:#fff;
font-family:Arial,sans-serif;
}

.app{
max-width:680px;
margin:auto;
padding:18px;
}

header{
text-align:center;
padding:18px 0 10px;
}

.logo{
font-size:45px;
}

h1{
margin:5px 0;
font-size:28px;
}

.sub{
color:#9ba6ba;
}

.card{
background:#121927;
border:1px solid #273249;
border-radius:18px;
padding:18px;
margin:14px 0;
}

h2{
font-size:19px;
margin:0 0 15px;
}

label{
display:block;
color:#cbd3e1;
margin:12px 0 7px;
}

input,
select{
width:100%;
padding:13px;
border-radius:10px;
border:1px solid #303b52;
background:#0b111d;
color:#fff;
font-size:15px;
}

button{
width:100%;
padding:14px;
margin-top:16px;
border:0;
border-radius:11px;
background:#ff6900;
color:#fff;
font-size:16px;
font-weight:bold;
cursor:pointer;
}

button:active{
transform:scale(.98);
}

.result{
line-height:2;
color:#dce4f1;
margin-top:18px;
}

.item{
background:#0b111d;
border-radius:12px;
padding:13px;
margin:10px 0;
}

.tag{
display:inline-block;
background:#202b40;
padding:5px 9px;
border-radius:8px;
margin:3px;
font-size:13px;
}

.stat{
display:inline-block;
width:48%;
background:#0b111d;
padding:13px;
border-radius:12px;
margin:1%;
text-align:center;
}

.small{
color:#8e99ad;
font-size:12px;
}

.good{
border-right:4px solid #18c964;
}

.warning{
border-right:4px solid #ffb000;
}

.bad{
border-right:4px solid #ff3b30;
}
</style>
</head>

<body>

<div class="app">

<header>
<div class="logo">🔥</div>

<h1>Follower AI</h1>

<div class="sub">
دستیار هوشمند رشد پیج اینستاگرام
</div>
</header>


<!-- PROFILE -->

<div class="card">

<h2>🎯 پروفایل پیج</h2>

<label>موضوع پیج</label>

<input
id="niche"
placeholder="مثلاً آتش نشانی + بدنسازی"
>


<label>تعداد فالوور فعلی</label>

<input
id="followers"
type="number"
placeholder="مثلاً 2126"
>


<label>هدف اصلی</label>

<select id="goal">

<option>افزایش فالوور هدفمند</option>

<option>افزایش بازدید ریلز</option>

<option>افزایش تعامل</option>

<option>ساخت برند شخصی</option>

</select>


<button onclick="generate()">
تحلیل و ساخت استراتژی 🚀
</button>

<div id="strategy" class="result"></div>

</div>


<!-- AUDIENCE -->

<div class="card">

<h2>🧠 مخاطب هدف</h2>

<div id="audience" class="result">

اطلاعات پیج را وارد کن تا مخاطب هدف مشخص شود.

</div>

</div>


<!-- REEL IDEAS -->

<div class="card">

<h2>🔥 ایده‌های ریلز</h2>

<div id="ideas" class="result">

برای دریافت ایده، ابتدا تحلیل پیج را انجام بده.

</div>

</div>


<!-- WEEK PLAN -->

<div class="card">

<h2>📅 برنامه ۷ روزه</h2>

<div id="week" class="result">

برای دریافت برنامه، ابتدا تحلیل پیج را انجام بده.

</div>

</div>


<!-- REEL ANALYZER -->

<div class="card">

<h2>📊 تحلیل ریلز</h2>


<label>بازدید</label>

<input
id="views"
type="number"
placeholder="مثلاً 3000"
>


<label>لایک</label>

<input
id="likes"
type="number"
placeholder="مثلاً 150"
>


<label>کامنت</label>

<input
id="comments"
type="number"
placeholder="مثلاً 20"
>


<label>اشتراک‌گذاری</label>

<input
id="shares"
type="number"
placeholder="مثلاً 10"
>


<label>ذخیره</label>

<input
id="saves"
type="number"
placeholder="مثلاً 15"
>


<label>فالوور جدید</label>

<input
id="newfollowers"
type="number"
placeholder="مثلاً 30"
>


<button onclick="analyze()">
تحلیل ریلز 🔍
</button>

<div id="analysis" class="result"></div>

</div>


</div>


<script>


/* =========================
   STRATEGY
========================= */

function generate(){

const niche =
document.getElementById("niche").value ||
"حوزه فعالیت شما";

const followers =
document.getElementById("followers").value ||
"نامشخص";

const goal =
document.getElementById("goal").value;


document.getElementById("strategy").innerHTML = `

<div class="item good">

<strong>🎯 استراتژی اختصاصی پیج</strong>

<br><br>

👥 فالوور فعلی:
${followers}

<br>

🎯 هدف:
${goal}

<br><br>

برای پیج با موضوع
<strong>${niche}</strong>

تمرکز اصلی باید روی محتوای واقعی،
سریع، کاربردی و قابل اشتراک‌گذاری باشد.

<br><br>

🔥 فرمول پیشنهادی:

Hook قوی
+
ارزش واقعی
+
تصویر جذاب
+
CTA مشخص

</div>

`;



document.getElementById("audience").innerHTML = `

<strong>مخاطب هدف پیشنهادی:</strong>

<br><br>

🎯 افراد علاقه‌مند به
${niche}

<br>

🎯 افرادی که دنبال آموزش،
تجربه واقعی و محتوای کاربردی هستند.

<br>

🎯 مخاطبانی که به چالش،
آمادگی جسمانی و عملکرد علاقه دارند.

<br><br>

<strong>کلیدواژه‌ها:</strong>

<br>

<span class="tag">${niche}</span>

<span class="tag">تمرین</span>

<span class="tag">آمادگی جسمانی</span>

<span class="tag">چالش</span>

<span class="tag">فیتنس</span>

<span class="tag">آتش نشانی</span>

`;



const ideas = [

[
"🎯 Hook",
"اگر فکر می‌کنی برای این کار آماده‌ای، این چالش رو امتحان کن!"
],

[
"🔥 ایده ۱",
"یک چالش سخت مرتبط با " + niche +
" اجرا کن و نتیجه واقعی را نشان بده."
],

[
"💪 ایده ۲",
"۳ اشتباه رایج که باعث می‌شود عملکردت ضعیف شود."
],

[
"🏋️ ایده ۳",
"یک تمرین کوتاه و کاربردی برای افزایش قدرت و استقامت."
],

[
"⚡ ایده ۴",
"قبل و بعد از یک تمرین سخت؛ بدون فیلتر و بدون اغراق."
],

[
"💬 ایده ۵",
"یک سؤال چالشی از مخاطب بپرس و او را به کامنت دعوت کن."
]

];


document.getElementById("ideas").innerHTML =

ideas.map(function(x){

return `

<div class="item">

<strong>${x[0]}</strong>

<br>

${x[1]}

</div>

`;

}).join("");



const days = [

"روز ۱: ریلز آموزشی + پاسخ به کامنت‌ها",

"روز ۲: استوری نظرسنجی + تعامل با مخاطبان مرتبط",

"روز ۳: ریلز چالشی + CTA برای فالو",

"روز ۴: استوری پشت صحنه + سؤال از مخاطب",

"روز ۵: ریلز اشتباهات رایج + آموزش",

"روز ۶: اجرای دوباره بهترین موضوع هفته با زاویه جدید",

"روز ۷: بررسی آمار + انتخاب بهترین فرمت هفته"

];


document.getElementById("week").innerHTML =

days.map(function(x){

return `

<div class="item">

${x}

</div>

`;

}).join("");

}


/* =========================
   REEL ANALYZER
========================= */

function analyze(){

const v =
Number(document.getElementById("views").value) || 0;

const l =
Number(document.getElementById("likes").value) || 0;

const c =
Number(document.getElementById("comments").value) || 0;

const s =
Number(document.getElementById("shares").value) || 0;

const sa =
Number(document.getElementById("saves").value) || 0;

const f =
Number(document.getElementById("newfollowers").value) || 0;


if(v <= 0){

document.getElementById("analysis").innerHTML = `

<div class="item bad">

⚠️ تعداد بازدید را وارد کن.

</div>

`;

return;

}


const engagement =
((l + c + s + sa) / v * 100).toFixed(2);


const conversion =
(f / v * 100).toFixed(2);


let advice = "";

let className = "";


if(engagement < 3){

advice =
"تعامل پایین است؛ موضوع، Hook سه ثانیه اول و تدوین ریلز را قوی‌تر کن.";

className = "bad";

}

else if(engagement < 7){

advice =
"تعامل متوسط است؛ روی Share، Save و شروع قدرتمند ریلز بیشتر تمرکز کن.";

className = "warning";

}

else{

advice =
"تعامل بسیار خوب است؛ این فرمت را با موضوعات جدید دوباره تولید کن.";

className = "good";

}


let conversionAdvice = "";


if(conversion < 0.5){

conversionAdvice =
"تبدیل بازدید به فالو پایین است؛ دلیل واضح‌تری برای دنبال کردن پیج بده.";

}

else if(conversion < 1){

conversionAdvice =
"تبدیل بازدید به فالو متوسط است؛ CTA انتهای ریلز را قوی‌تر کن.";

}

else{

conversionAdvice =
"تبدیل بازدید به فالو خوب است؛ این مدل محتوا ظرفیت جذب فالوور دارد.";

}


document.getElementById("analysis").innerHTML = `

<div class="stat">

<strong>${engagement}%</strong>

<br>

<span class="small">

نرخ تعامل

</span>

</div>


<div class="stat">

<strong>${conversion}%</strong>

<br>

<span class="small">

تبدیل بازدید به فالو

</span>

</div>


<br><br>


<div class="item ${className}">

📌 ${advice}

</div>


<div class="item">

🚀 ${conversionAdvice}

</div>


<div class="item">

<strong>💡 پیشنهاد Follower AI</strong>

<br><br>

در پایان ریلز یک دلیل مشخص برای فالو کردن بده.

همچنین موضوعاتی که بیشترین
Share و Save را می‌گیرند،
با اجرای متفاوت دوباره تولید کن.

</div>

`;

}


</script>

</body>
</html>
