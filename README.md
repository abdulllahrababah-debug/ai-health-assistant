# 🩺 AI Health Assistant

نظام ويب متكامل يجمع بيانات المستخدم الصحية (العمر، الجنس، الأعراض، التاريخ المرضي)
ثم يستخدم الذكاء الاصطناعي (OpenAI) لاقتراح الحالات الصحية المحتملة مع نسبة احتمال
وشرح مبسط، مع نظام تحذير فوري للحالات الطارئة.

> ⚠️ **إخلاء مسؤولية**: هذا النظام لأغراض تعليمية ومعلوماتية فقط، ولا يعتبر تشخيصاً طبياً
> أو بديلاً عن استشارة الطبيب.

## البنية التقنية

| الطبقة | التقنية |
|---|---|
| Frontend | React 18 + React Router + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MySQL |
| AI | OpenAI API (gpt-4o-mini بشكل افتراضي) |
| Auth | JWT + bcrypt |

## هيكل المشروع

```
ai-health-assistant/
├── backend/
│   ├── config/db.js              # اتصال MySQL
│   ├── controllers/              # منطق كل مسار (auth/symptoms/diagnosis/admin)
│   ├── middleware/auth.js        # حماية JWT + صلاحيات الأدمن
│   ├── routes/                   # تعريف الـ REST API
│   ├── services/aiService.js     # التكامل مع OpenAI + منطق الطوارئ
│   ├── database/schema.sql       # مخطط قاعدة البيانات + بيانات أولية
│   ├── database/init.js          # سكربت لإنشاء القاعدة تلقائياً
│   ├── server.js                 # نقطة تشغيل السيرفر
│   └── .env.example
└── frontend/
    ├── src/pages/                # Home / Assessment / Login / Admin
    ├── src/components/           # Navbar, EmergencyAlert, ProgressSteps...
    ├── src/context/AppContext.jsx# اللغة + الوضع الليلي + المستخدم
    ├── src/i18n/translations.js  # عربي/إنجليزي
    ├── src/api/client.js         # عميل Axios
    └── .env.example
```

## 1) تشغيل قاعدة البيانات

تأكد من تشغيل خادم MySQL محلياً، ثم:

```bash
cd backend
cp .env.example .env
# عدّل بيانات الاتصال بقاعدة البيانات (DB_HOST, DB_USER, DB_PASSWORD) داخل .env
npm install
npm run db:init     # ينشئ قاعدة البيانات وجميع الجداول + بيانات أولية للأعراض والأسئلة
```

## 2) تشغيل الباك اند

```bash
# داخل مجلد backend
# أضف مفتاح OpenAI الخاص بك في .env => OPENAI_API_KEY
# أضف سر JWT قوي في .env => JWT_SECRET
npm run dev          # أو npm start
# السيرفر يعمل على http://localhost:5000
```

للتحقق: افتح `http://localhost:5000/api/health` يجب أن يعيد `{ "status": "ok" }`.

## 3) تشغيل الفرونت اند

```bash
cd frontend
cp .env.example .env
npm install
npm start
# يفتح تلقائياً على http://localhost:3000
```

## 4) إنشاء حساب أدمن

سجّل حساباً عادياً من واجهة الموقع (`/login` → إنشاء حساب)، ثم حدّث الصلاحية يدوياً في قاعدة البيانات:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

بعدها سجّل الدخول مجدداً لرؤية رابط "لوحة الإدارة" في القائمة العلوية.

## أهم نقاط الـ API

| Method | Endpoint | الوصف |
|---|---|---|
| POST | `/api/auth/register` | إنشاء حساب |
| POST | `/api/auth/login` | تسجيل الدخول |
| GET  | `/api/symptoms` | قائمة الأعراض |
| POST | `/api/symptoms/followup-questions` | جلب الأسئلة الذكية المرتبطة بالأعراض المختارة |
| POST | `/api/diagnosis/assess` | تشغيل محرك الذكاء الاصطناعي وإرجاع النتيجة |
| GET  | `/api/admin/stats` | إحصائيات لوحة الإدارة (يتطلب صلاحية admin) |

## آلية التحذير الطبي

- كل عرض من الأعراض الخطيرة (ألم صدر، ضيق تنفس شديد، فقدان وعي، أعراض سكتة دماغية)
  ومعه أي سؤال متابعة تم تصنيفه كـ `is_emergency_trigger` في قاعدة البيانات، يُفعّلان
  علم الطوارئ **بشكل مستقل عن استجابة الذكاء الاصطناعي** (`services/aiService.js`).
- إن أعاد النموذج نفسه `is_emergency: true` يتم اعتماده أيضاً — أيهما يتحقق أولاً يفوز.
- عند التفعيل، تظهر في الواجهة بطاقة حمراء كبيرة (`EmergencyAlert.jsx`) توصي بالتوجه للطوارئ فوراً.

## ملاحظات أمان وإنتاج

- استخدم HTTPS ومفتاح `JWT_SECRET` طويلاً وعشوائياً في الإنتاج.
- لا تُخزّن مفتاح OpenAI في الفرونت اند أبداً — الاستدعاء يتم فقط من الباك اند.
- أضف `express-rate-limit` (مُفعّل بالفعل على مسار `/api/diagnosis/assess`) لمنع إساءة الاستخدام.
- لأي بيانات صحية حقيقية للمستخدمين، راجع متطلبات الامتثال المحلية لحماية البيانات الصحية.
