# MajidAccountingSystem

دفتر حسابداری ساده با Frontend (HTML/CSS/JS) و Supabase برای ذخیره‌سازی و Realtime.

## اجرا
- فایل‌ها را با یک سرور ساده استاتیک باز کنید یا مستقیماً در مرورگر (برای Supabase نیازی به بک‌اند نیست).
- متغیرهای `SUPABASE_URL` و `SUPABASE_KEY` در `app.js` باید با پروژه شما همخوان باشند.

## ساختار
- `index.html` رابط کاربری
- `style.css` استایل RTL
- `app.js` منطق CRUD + Realtime با Supabase
- `server.js` (اختیاری) نمونه بک‌اند Express/SQLite برای حالت لوکال

## انتشار
برای انتشار در GitHub:
```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/majidshilehsari/MajidAccountingSystem.git
git push -u origin main
```

