<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Follower AI</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#080c14;color:#fff;font-family:Arial,sans-serif}
.app{max-width:680px;margin:auto;padding:18px}
header{text-align:center;padding:18px 0 10px}
.logo{font-size:45px}
h1{margin:5px 0;font-size:28px}
.sub{color:#9ba6ba}
.card{background:#121927;border:1px solid #273249;border-radius:18px;padding:18px;margin:14px 0}
h2{font-size:19px;margin:0 0 15px}
label{display:block;color:#cbd3e1;margin:12px 0 7px}
input,select{width:100%;padding:13px;border-radius:10px;border:1px solid #303b52;background:#0b111d;color:#fff;font-size:15px}
button{width:100%;padding:14px;margin-top:16px;border:0;border-radius:11px;background:#ff6900;color:#fff;font-size:16px;font-weight:bold}
.result{line-height:2;color:#dce4f1;margin-top:18px}
.item{background:#0b111d;border-radius:12px;padding:13px;margin:10px 0}
.tag{display:inline-block;background:#202b40;padding:5px 9px;border-radius:8px;margin:3px;font-size:13px}
.stat{display:inline-block;width:48%;background:#0b111d;padding:13px;border-radius:12px;margin:1%;text-align:center}
.small{color:#8e99ad;font-size:12px}
</style>
</head>

<body>
<div class="app">

<header>
<div class="logo">🔥</div>
<h1>Follower AI</h1>
<div class="sub">دستیار هوشمند رشد پیج اینستاگرام</div>
</header>

<div class="card">
<h2>🎯 پروفایل پیج</h2>

<label>موضوع پیج</label>
<input id="niche" placeholder="مثلاً آتش نشانی + بدنسازی">

<label>تعداد فالوور فعلی</label>
<input id="followers" type="number" placeholder="مثلاً 2126">

<label>هدف اصلی</label>
<select id="goal">
<option>افزایش فالوور هدفمند</option>
<option>افزایش بازدید ریلز</option>
<option>افزایش تعامل</option>
<option>ساخت برند شخصی</option>
</select>

<button onclick="generate()">تحلیل و ساخت استراتژی 🚀</button>
<div id="strategy" class="result"></div>
</div>

<div class="card">
<h2>🧠 مخاطب هدف</h2>
<div id="audience" class="result">
اطلاعات پیج را وارد کن تا مخاطب هدف مشخص شود.
</div>
</div>

<div class="card">
<h2>🔥 ایده‌های ریلز</h2>
<div id="ideas" class="result"></div>
</div>

<div class="card">
<h2>📅 برنامه ۷ روزه</h2>
<div id="week" class="result"></div>
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

<script>
function generate(){

const niche=document.getElementById("niche").value || "حوزه فعالیت شما";
const followers=document.getElementById("followers").value || "نامشخص";
const goal=document.getElementById("goal").value;

document.getElementById("strategy").innerHTML=`
<strong>استراتژی اختصاصی</strong><br><br>
👥 فالوور فعلی: ${followers}<br>
🎯 هدف: ${goal}<br><br>
تمرکز اصلی باید روی محتوایی باشد که مخاطب ${niche} را متوقف کند، ارزش بدهد و دلیل مشخصی برای دنبال کردن پیج ایجاد کند.
`;

document.getElementById("audience").innerHTML=`
<strong>مخاطب پیشنهادی:</strong><br><br>
🎯 افراد علاقه‌مند به ${niche}<br>
🎯 افرادی که دنبال آموزش، تجربه واقعی و محتوای کاربردی هستند<br>
🎯 مخاطبانی که با چالش‌های ورزشی و عملکردی ارتباط می‌گیرند<br><br>
<strong>کلیدواژه‌ها:</strong><br>
<span class="tag">${niche}</span>
<span class="tag">تمرین</span>
<span class="tag">آمادگی جسمانی</span>
<span class="tag">چالش</span>
<span class="tag">فیتنس</span>
`;

const ideas=[
["Hook","اگر فکر می‌کنی برای این کار آماده‌ای، این چالش رو امتحان کن!"],
["ایده ۱","یک چالش سخت مرتبط با "+niche+" اجرا کن و نتیجه را نشان بده."],
["ایده ۲","۳ اشتباه رایج که باعث می‌شود عملکردت ضعیف شود."],
["ایده ۳","تمرین کوتاه و کاربردی برای افزایش استقامت و قدرت."],
["ایده ۴","قبل و بعد از یک تمرین سخت؛ بدون فیلتر و بدون اغراق."],
["ایده ۵","یک سؤال چالشی از مخاطب بپرس و او را به کامنت دعوت کن."]
];

document.getElementById("ideas").innerHTML=ideas.map(x=>
`<div class="item"><strong>${x[0]}</strong><br>${x[1]}</div>`
).join("");

const days=[
"روز ۱: ریلز آموزشی + پاسخ به کامنت‌ها",
"روز ۲: استوری نظرسنجی + تعامل با مخاطبان مرتبط",
"روز ۳: ریلز چالشی + CTA برای فالو",
"روز ۴: استوری پشت صحنه + سؤال از مخاطب",
"روز ۵: ریلز اشتباهات رایج + آموزش",
"روز ۶: بازنشر بهترین موضوع هفته با اجرای جدید",
"روز ۷: بررسی آمار + انتخاب بهترین فرمت هفته"
];

document.getElementById("week").innerHTML=days.map(x=>`<div class="item">${x}</div>`).join("");
}

function analyze(){

const v=Number(document.getElementById("views").value)||0;
const l=Number(document.getElementById("likes").value)||0;
const c=Number(document.getElementById("comments").value)||0;
const s=Number(document.getElementById("shares").value)||0;
const sa=Number(document.getElementById("saves").value)||0;
const f=Number(document.getElementById("newfollowers").value)||0;

if(v<=0){
document.getElementById("analysis").innerHTML="⚠️ تعداد بازدید را وارد کن.";
return;
}

const engagement=((l+c+s+sa)/v*100).toFixed(2);
const conversion=(f/v*100).toFixed(2);

let advice="";

if(engagement<3){
advice="تعامل پایین است؛ موضوع و Hook سه ثانیه اول را قوی‌تر کن.";
}else if(engagement<7){
advice="تعامل متوسط است؛ روی Share و Save بیشتر تمرکز کن.";
}else{
advice="تعامل بسیار خوب است؛ همین فرمت را با موضوعات جدید تکرار کن.";
}

document.getElementById("analysis").innerHTML=`
<div class="stat"><strong>${engagement}%</strong><br><span class="small">نرخ تعامل</span></div>
<div class="stat"><strong>${conversion}%</strong><br><span class="small">تبدیل بازدید به فالو</span></div>
<br><br>
📌 ${advice}<br><br>
🚀 پیشنهاد: در پایان ریلز یک دلیل مشخص برای فالو کردن بده و بهترین موضوعات را دوباره با اجرای متفاوت تولید کن.
`;
}
</script>

</div>
</body>
</html>
