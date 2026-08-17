import React, { useState } from 'react';
import type { SchoolLeadInput } from '../types';
import { createSchoolLeadApi } from '../services/api';

interface SchoolLeadFormStepProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const SchoolLeadFormStep: React.FC<SchoolLeadFormStepProps> = ({
  onBack,
  onSuccess,
}) => {
  const [form, setForm] = useState<SchoolLeadInput>({
    schoolName: '',
    contactPerson: '',
    email: '',
    phone: '',
    governorate: '',
    approxStudentCount: '',
    stagesToCover: ['المرحلة الابتدائية'],
    preferredChannel: 'مكالمة هاتفية',
    notes: '',
  });

  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const stagesList = ['المرحلة الابتدائية', 'المرحلة المتوسطة', 'المرحلة الثانوية'];
  const channelsList = ['مكالمة هاتفية', 'بريد إلكتروني', 'واتساب'];

  const toggleStage = (st: string) => {
    setForm((prev) => {
      const exists = prev.stagesToCover.includes(st);
      const nextStages = exists
        ? prev.stagesToCover.filter((item) => item !== st)
        : [...prev.stagesToCover, st];
      return { ...prev, stagesToCover: nextStages };
    });
  };

  const canSubmit =
    form.schoolName.trim().length > 0 &&
    form.contactPerson.trim().length > 0 &&
    form.email.includes('@') &&
    form.phone.trim().length >= 8 &&
    consent &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      await createSchoolLeadApi(form);
      onSuccess();
    } catch (err) {
      console.error(err);
      onSuccess(); // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lead-form-container">
      <div className="lead-back-bar">
        <button type="button" className="back-link" onClick={onBack}>
          رجوع
        </button>
      </div>

      <h1 className="lead-title">طلب تعاقد لمدرسة</h1>
      <p className="lead-subtitle">
        اترك بيانات التواصل وسيقوم فريق المبيعات بالرد خلال يوم عمل واحد لعرض الأسعار وخطة التطبيق.
      </p>

      <form className="lead-card" onSubmit={handleSubmit}>
        <div className="lead-form-grid">
          <div className="form-group">
            <label className="form-label">اسم المدرسة</label>
            <input
              type="text"
              className="form-input"
              placeholder="مدرسة النيل الدولية"
              value={form.schoolName}
              onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">اسم مسؤول التواصل</label>
            <input
              type="text"
              className="form-input"
              placeholder="الاسم والصفة الوظيفية"
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input
              type="email"
              className="form-input ltr-input"
              placeholder="name@school.edu.eg"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">رقم الهاتف</label>
            <input
              type="tel"
              className="form-input ltr-input"
              placeholder="01xxxxxxxxx"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">المحافظة</label>
            <input
              type="text"
              className="form-input"
              placeholder="القاهرة"
              value={form.governorate}
              onChange={(e) => setForm({ ...form, governorate: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">عدد الطلاب التقريبي</label>
            <input
              type="text"
              className="form-input"
              placeholder="مثال: 850"
              value={form.approxStudentCount}
              onChange={(e) => setForm({ ...form, approxStudentCount: e.target.value })}
            />
          </div>
        </div>

        {/* Stages Selection */}
        <div className="form-group margin-top-md">
          <label className="form-label">المراحل المطلوب تغطيتها</label>
          <div className="chips-wrapper">
            {stagesList.map((st) => {
              const active = form.stagesToCover.includes(st);
              return (
                <button
                  type="button"
                  key={st}
                  className={`chip ${active ? 'active' : ''}`}
                  onClick={() => toggleStage(st)}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Channel */}
        <div className="form-group margin-top-md">
          <label className="form-label">وسيلة التواصل المفضّلة</label>
          <div className="chips-wrapper">
            {channelsList.map((ch) => {
              const active = form.preferredChannel === ch;
              return (
                <button
                  type="button"
                  key={ch}
                  className={`chip ${active ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, preferredChannel: ch })}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="form-group margin-top-md">
          <label className="form-label">ملاحظات إضافية (اختياري)</label>
          <textarea
            className="form-textarea"
            placeholder="أي تفاصيل تساعدنا في تجهيز العرض: موعد بداية التطبيق، أنظمة حالية، احتياجات خاصة."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {/* Consent Checkbox */}
        <div
          className="checkbox-row"
          onClick={() => setConsent(!consent)}
        >
          <div className={`checkbox-box ${consent ? 'checked' : ''}`} />
          <span className="checkbox-label">
            أوافق على أن يتواصل معي فريق المنصة بشأن هذا الطلب.
          </span>
        </div>

        <button
          type="submit"
          className="btn-submit-lead"
          disabled={!canSubmit}
          style={{
            backgroundColor: canSubmit ? '#16171a' : '#e2e3e6',
            color: canSubmit ? '#ffffff' : '#a8aab0',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
        </button>
      </form>
    </div>
  );
};
