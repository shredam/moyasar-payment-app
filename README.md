# منصة اشتراكات المدارس والطلاب — Moyasar Payment App

> منصة إلكترونية متكاملة باللغة العربية (RTL) مع خط **Cairo** لإدارة اشتراكات المدارس والطلاب ومتابعة المراحل والصفوف الدراسية مع بوابة دمج ميسر **Moyasar Payment Gateway (مدى / فيزا / ماستركارد / Apple Pay)** وتطوير خادم **NestJS GraphQL**.

---

## 🛠️ تقنيات المشروع (Tech Stack)

| الطبقة (Layer) | التقنية (Technology) |
|---|---|
| **الواجهة الأمامية (Frontend)** | React 18 (TypeScript), Vite, Cairo Font (RTL), Moyasar Web SDK v1.14.0 |
| **الخادم (Backend)** | NestJS 11 (TypeScript), Express, ServeStatic |
| **واجهة البرمجة (API)** | GraphQL (Code-First, Apollo Server) |
| **قاعدة البيانات (Database)** | TypeORM (PostgreSQL / In-Memory Fallback) |
| **بوابة الدفع (Payment)** | Moyasar Payment Gateway (SAR / ريال سعودي) |

---

## 🚀 المميزات الرئيسية (Key Features)

1. **التعامل بـ ريال سعودي (SAR)**: جميع المبالغ والأسعار والضريبة (14%) محسبة وممثلة بـ **ريال سعودي**.
2. **بدون شاشة تسجيل دخول (No Auth)**: الدخول المباشر إلى المنصة باسم المستخدم الافتراضي (`سارة أحمد`).
3. **اختيار نوع الاشتراك (Role Selection)**:
   - طلب تعاقد لمدرسة (School Lead Request).
   - اشتراك مدرسي للطالب (School Student Subscription).
   - طالب مستقل ومدرّس خصوصي.
4. **طلب تعاقد المدرسة (School Lead Form)**:
   - نموذج كامل لإدخال اسم المدرسة، مسؤول التواصل، المحافظة، عدد الطلاب، المراحل، ووسيلة التواصل المفضلة.
   - حفظ الطلب مباشرة في قاعدة البيانات عبر GraphQL (`createSchoolLead`).
5. **اختيار المراحل والصفوف (Stage & Grade Selection)**:
   - بطاقات المراحل (الابتدائية، المتوسطة، الثانوية).
   - تبويب الفصول الدراسية (الفصل الأول / الثاني).
   - ملخص السلة والتحديث اللحظي لعدد الصفوف والإجمالي الشهري.
6. **بيانات الطالب والمدرسة (Student Verification & Invoice)**:
   - اختيار المدرسة واستخراج كود المدرسة.
   - التحقق من كود الطالب واسترجاع بياناته.
   - تفاصيل الفاتورة وحساب ضريبة القيمة المضافة 14% والإجمالي المستحق.
7. **دمج ميسر Moyasar Payment Checkout**:
   - بدء جلسة الدفع وتوليد معرف العملية (`initiatePayment`).
   - عرض نموذج الدفع الإلكتروني المباشر من ميسر بطاقات مدى، فيزا، ماستركارد، وأبل باي.
8. **صفحة نتيجة الدفع (Payment Result Page)**:
   - شاشة عرض حالة الدفع (**ناجح 🎉** / **فاشل ⚠️**).
   - حفظ السلة والبيانات في `localStorage` لإمكانية زر **"إعادة محاولة الدفع"** عند الفشل دون فقدان البيانات.
9. **لوحة استرجاع بيانات قاعدة البيانات (Database Records Dashboard)**:
   - صفحة مخصصة لعرض جميع البيانات المخزنة في النظام: طلبات تعاقد المدارس، اشتراكات الطلاب والصفوف، وسجلات الدفع عبر بوابة ميسر.
   - إمكانية التصفية بالبحث اللحظي وزر تحديث البيانات.
10. **انتهاء صلاحية كود الطالب عند الاستخدام (Single-Use Student Code)**:
   - بمجرد استخدام كود الطالب في اشتراك ناجح، يتم تعليم الكود كمستخدم ومُنتَهي الصلاحية (`isUsed: true`).
   - تنبيه واجهة الدفع وتعطيل إمكانية إعادة الاشتراك بنفس الكود.



---

## 📋 تشغيل المشروع (Quick Start)

### 1. تثبيت الحزم (Install Dependencies)
```bash
# تثبيت حزم الخادم والواجهة الأمامية
npm install
cd client && npm install && cd ..
```

### 2. إعداد ملف البيئة (.env)
تأكد من وجود مفاتيح ميسر الاختبارية في `.env`:
```env
MOYASAR_PUBLISHABLE_KEY=pk_test_RVnhNipcchuneCmBNKfUTM74rMroJfCsvR9U5hWb
MOYASAR_SECRET_KEY=sk_test_h2mpweM3uAAeN9XEzg62nsnWnyxSLUjcbjgBHsiX
PORT=3000
APP_URL=http://localhost:3000
```

### 3. بناء وتشغيل المشروع (Build & Start)
```bash
# بناء الواجهة والـ Backend
npm run build

# تشغيل الخادم
npm start
```

الروابط المتاحة:
- **واجهة المنصة التطبيقية**: [http://localhost:3000/](http://localhost:3000/)
- **استكشاف GraphQL Playground**: [http://localhost:3000/graphql](http://localhost:3000/graphql)

---

## 📡 GraphQL API Reference

### الاستعلامات (Queries)
```graphql
# 1. قائمة المدارس المتاحة
query {
  schools {
    id
    name
    code
  }
}

# 2. التحقق من كود الطالب
query VerifyStudent($schoolCode: String!, $studentCode: String!) {
  verifyStudentCode(schoolCode: $schoolCode, studentCode: $studentCode) {
    id
    code
    fullName
    phone
    grade
    schoolCode
    guardianName
    guardianPhone
  }
}

# 3. عرض الاشتراكات
query {
  subscriptions {
    id
    studentCode
    grandTotal
    status
    createdAt
  }
}
```

### الطفرات (Mutations)
```graphql
# 1. إرسال طلب تعاقد مدرسة
mutation CreateLead($input: CreateSchoolLeadInput!) {
  createSchoolLead(input: $input) {
    id
    schoolName
    contactPerson
    email
    phone
    createdAt
  }
}

# 2. إنشاء اشتراك طالب
mutation CreateSub($input: CreateSubscriptionInput!) {
  createSubscription(input: $input) {
    id
    studentCode
    grandTotal
    status
    createdAt
  }
}

# 3. بدء جلسة دفع ميسر
mutation InitiatePayment($input: CreatePaymentInput!) {
  initiatePayment(input: $input) {
    id
    amount
    currency
    status
    callbackUrl
  }
}
```

---

## 💳 بطاقات ميسر الاختبارية (Moyasar Test Cards)

| النوع | رقم البطاقة | تاريخ الانتهاء | رمز الأمان (CVV) |
|---|---|---|---|
| **Visa (نجاح)** | `4111 1111 1111 1111` | 12/28 | 123 |
| **Mastercard** | `5500 0000 0000 0004` | 12/28 | 123 |
| **Mada** | `4242 4242 4242 4242` | 12/28 | 123 |
| **فشل (Decline)** | `4000 0000 0000 0002` | 12/28 | 123 |

---

## 📄 الترخيص (License)

MIT
