import React, { useState, useEffect } from 'react';
import type { CartItem, SchoolItem, StudentProfile } from '../types';
import { getSchoolsApi, verifyStudentCodeApi, createSubscriptionApi, initiatePaymentApi } from '../services/api';

declare global {
  interface Window {
    Moyasar?: {
      init: (config: any) => void;
    };
  }
}

const MOYASAR_PK = 'pk_test_RVnhNipcchuneCmBNKfUTM74rMroJfCsvR9U5hWb';

interface StudentCheckoutStepProps {
  cartItems: CartItem[];
  subtotal: number;
  onBackToGrades: () => void;
  onSuccess: (grandTotal: number) => void;
}

export const StudentCheckoutStep: React.FC<StudentCheckoutStepProps> = ({
  cartItems,
  subtotal,
  onBackToGrades,
  onSuccess,
}) => {
  const [schools, setSchools] = useState<SchoolItem[]>([
    { id: 'sch-1', name: 'مدرسة النيل الدولية', code: 'NIS-1042' },
    { id: 'sch-2', name: 'مدرسة المستقبل الحديثة', code: 'MFS-2318' },
    { id: 'sch-3', name: 'مدرسة الأندلس التجريبية', code: 'AND-7710' },
    { id: 'sch-4', name: 'مدرسة الحكمة الخاصة', code: 'HKM-5063' },
  ]);
  const [selectedSchoolCode, setSelectedSchoolCode] = useState<string>(() => {
    return localStorage.getItem('app_school_code') || 'NIS-1042';
  });
  const [studentCode, setStudentCode] = useState<string>(() => {
    return localStorage.getItem('app_student_code') || '';
  });
  const [student, setStudent] = useState<StudentProfile | null>(null);

  const [agreeData, setAgreeData] = useState<boolean>(() => {
    return localStorage.getItem('app_agree_data') === 'true';
  });
  const [agreeTerms, setAgreeTerms] = useState<boolean>(() => {
    return localStorage.getItem('app_agree_terms') === 'true';
  });
  const [loading, setLoading] = useState(false);
  const [showMoyasarForm, setShowMoyasarForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('app_school_code', selectedSchoolCode);
    if (selectedSchoolCode === 'NIS-1042') setStudentCode('20451');
    else if (selectedSchoolCode === 'MFS-2318') setStudentCode('30101');
    else if (selectedSchoolCode === 'AND-7710') setStudentCode('40201');
    else if (selectedSchoolCode === 'HKM-5063') setStudentCode('50301');
  }, [selectedSchoolCode]);


  useEffect(() => {
    localStorage.setItem('app_student_code', studentCode);
  }, [studentCode]);

  useEffect(() => {
    localStorage.setItem('app_agree_data', String(agreeData));
  }, [agreeData]);

  useEffect(() => {
    localStorage.setItem('app_agree_terms', String(agreeTerms));
  }, [agreeTerms]);

  useEffect(() => {
    getSchoolsApi().then((data) => {
      if (data && data.length > 0) {
        setSchools(data);
        setSelectedSchoolCode(data[0].code);
      }
    });
  }, []);

  useEffect(() => {
    if (studentCode.trim().length >= 4) {
      verifyStudentCodeApi(selectedSchoolCode, studentCode.trim()).then((profile) => {
        setStudent(profile);
      });
    } else {
      setStudent(null);
    }
  }, [selectedSchoolCode, studentCode]);

  const vatAmount = Math.round(subtotal * 0.14);
  const grandTotal = subtotal + vatAmount;
  const fmt = (n: number) => n.toLocaleString('ar-SA') + ' ريال سعودي';

  const currentSchool = schools.find((s) => s.code === selectedSchoolCode) || schools[0];
  const registeredSchool = student ? schools.find((s) => s.code === student.schoolCode) : null;
  const isSchoolMismatch = student !== null && student.schoolCode !== selectedSchoolCode;
  const isCodeExpired = !!student?.isUsed;

  const canPay =
    subtotal > 0 &&
    agreeData &&
    agreeTerms &&
    studentCode.trim().length >= 4 &&
    student !== null &&
    !isCodeExpired &&
    !isSchoolMismatch &&
    !loading;

  const handleInitiateMoyasar = async () => {
    if (!canPay) return;
    setLoading(true);

    try {
      const payerName = student ? student.fullName : 'طالب المنصة';
      const payment = await initiatePaymentApi({
        amount: Math.round(grandTotal * 100),
        description: `اشتراك صفوف: ${cartItems.map((i) => i.grade.name).join('، ')}`,
        payerName,
        payerEmail: 'sara.ahmed@example.com',
      });

      setShowMoyasarForm(true);

      setTimeout(() => {
        if (window.Moyasar) {
          const container = document.getElementById('moyasar-subscription-container');
          if (container) {
            container.innerHTML = '<div class="mysr-form"></div>';
          }
          window.Moyasar.init({
            element: '.mysr-form',
            amount: Math.round(grandTotal * 100),
            currency: 'SAR',
            description: `اشتراك مدرسة (${currentSchool.name}) — ${studentCode}`,
            publishable_api_key: MOYASAR_PK,
            callback_url: `${window.location.origin}/payments/callback?payment_id=${payment.id}`,
            methods: ['creditcard'],
            supported_networks: ['mada', 'visa', 'mastercard', 'amex'],
            on_completed: function (paymentObj: any) {
              if (paymentObj && paymentObj.status === 'paid') {
                createSubscriptionApi({
                  studentCode: studentCode.trim(),
                  schoolCode: selectedSchoolCode,
                  gradePackage: cartItems.map((item) => `${item.grade.name} (${item.subject})`),
                  gradeCount: cartItems.length,
                  subtotal,
                  vatAmount,
                  grandTotal,
                }).then(() => onSuccess(grandTotal));
              }
            },
            on_failure: function (err: any) {
              console.warn('Moyasar payment failure:', err);
            },
          });
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setShowMoyasarForm(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-step-container">
      <div className="lead-back-bar">
        <button type="button" className="back-link" onClick={onBackToGrades}>
          رجوع
        </button>
      </div>

      <h1 className="checkout-title">بيانات الطالب والمدرسة</h1>
      <p className="checkout-subtitle">أدخل بيانات الطالب لاستكمال الاشتراك ومراجعة الفاتورة.</p>

      <div className="checkout-layout">
        {/* Form Details Column */}
        <div className="checkout-form-column">
          {/* Package Summary Header Card */}
          <div className="package-summary-card">
            <div className="package-info">
              <span className="package-title">باكدج {cartItems.length} صفوف</span>
              <span className="package-desc">
                {cartItems.map((item) => `${item.grade.name} (${item.subject})`).join(' · ')}
              </span>
            </div>
            <button type="button" className="btn-edit-package" onClick={onBackToGrades}>
              تعديل الباكدج
            </button>
          </div>

          {/* Student Form Box */}
          <div className="student-details-card">
            <h2 className="card-section-title">تفاصيل الطالب</h2>

            <div className="school-select-grid">
              <select
                className="form-select"
                value={selectedSchoolCode}
                onChange={(e) => setSelectedSchoolCode(e.target.value)}
              >
                {schools.map((sch) => (
                  <option key={sch.id} value={sch.code}>
                    {sch.name}
                  </option>
                ))}
              </select>

              <div className="school-code-badge">
                <span className="code-label">كود المدرسة</span>
                <span className="code-value">{currentSchool.code}</span>
              </div>
            </div>

            <input
              type="text"
              className="form-input"
              placeholder="كود الطالب (مثال: 20451)"
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
            />

            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>أكواد الطلاب المتاحة لهذه المدرسة:</span>
              {(selectedSchoolCode === 'NIS-1042'
                ? ['20451', '20452', '20453']
                : selectedSchoolCode === 'MFS-2318'
                ? ['30101', '30102']
                : selectedSchoolCode === 'AND-7710'
                ? ['40201', '40202']
                : ['50301', '50302']
              ).map((c) => (
                <button
                  key={c}
                  type="button"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    background: studentCode === c ? 'var(--primary-teal-dark)' : '#ffffff',
                    color: studentCode === c ? '#ffffff' : 'var(--primary-teal-dark)',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                  onClick={() => setStudentCode(c)}
                >
                  {c}
                </button>
              ))}
            </div>


            {student ? (
              <div className={`student-profile-box ${isCodeExpired || isSchoolMismatch ? 'expired-box' : ''}`}>
                <div className="profile-header-title" style={{ color: isCodeExpired || isSchoolMismatch ? '#e11d48' : undefined }}>
                  بيانات الطالب {isSchoolMismatch ? '— (عدم تطابق المدرسة ⚠️)' : isCodeExpired ? '— (كود مستخدم ومنتهي الصلاحية ⚠️)' : ''}
                </div>

                {isSchoolMismatch && (
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
                    ⚠️ كود الطالب ({student.code}) تابع لـ "{registeredSchool ? registeredSchool.name : student.schoolCode}" وليس تابعًا لـ "{currentSchool.name}". يرجى اختيار المدرسة الصحيحة من القائمة أعلاه.
                  </div>
                )}

                {isCodeExpired && !isSchoolMismatch && (
                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>
                    ⚠️ تم استخدام كود الطالب ({student.code}) مسبقًا في اشتراك آخر وهو منتهي الصلاحية حاليًا. لا يمكن إعادة استخدام هذا الكود.
                  </div>
                )}

                <div className="profile-grid">
                  <div className="profile-field">
                    <span className="field-label">الاسم الكامل</span>
                    <span className="field-val">{student.fullName}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">كود الطالب</span>
                    <span className="field-val">{student.code}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">رقم الهاتف</span>
                    <span className="field-val">{student.phone}</span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">الصف الدراسي</span>
                    <span className="field-val">
                      {cartItems.length > 0 ? cartItems[0].grade.name : student.grade}
                    </span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">المدرسة التابع لها</span>
                    <span className="field-val" style={{ color: isSchoolMismatch ? '#e11d48' : undefined, fontWeight: 700 }}>
                      {registeredSchool ? registeredSchool.name : student.schoolCode}
                    </span>
                  </div>
                  <div className="profile-field">
                    <span className="field-label">ولي الأمر</span>
                    <span className="field-val">
                      {student.guardianName} — {student.guardianPhone}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="input-hint-text">أدخل كود الطالب (4 أرقام على الأقل) لعرض بياناته.</div>
            )}

            <div className="divider-line" />

            <div className="checkbox-row" onClick={() => setAgreeData(!agreeData)}>
              <div className={`checkbox-box ${agreeData ? 'checked' : ''}`} />
              <span className="checkbox-label">
                أُقرّ بأن البيانات الظاهرة أعلاه صحيحة وتخصّني.
              </span>
            </div>

            <div className="checkbox-row" onClick={() => setAgreeTerms(!agreeTerms)}>
              <div className={`checkbox-box ${agreeTerms ? 'checked' : ''}`} />
              <span className="checkbox-label">
                أوافق على شروط استخدام المنصة وسياسة الخصوصية.
              </span>
            </div>

            {/* Moyasar SDK Embedded Form */}
            {showMoyasarForm && !isCodeExpired && !isSchoolMismatch && (
              <div style={{ marginTop: '16px', border: '1px solid var(--primary-teal)', borderRadius: '14px', padding: '18px', background: '#fafafa' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-teal-dark)', marginBottom: '12px' }}>
                  💳 الدفع الإلكتروني عبر ميسر Moyasar (مدى / فيزا / ماستركارد)
                </div>
                <div id="moyasar-subscription-container">
                  <div className="mysr-form"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Sidebar */}
        <div className="invoice-summary-sidebar">
          <h2 className="cart-title">الفاتورة</h2>

          <div className="cart-items-list">
            {cartItems.map((item, idx) => (
              <div key={idx} className="cart-item-row">
                <span>{item.grade.name}</span>
                <span className="cart-item-price">{fmt(item.grade.price)}</span>
              </div>
            ))}
          </div>

          <div className="divider-line" />

          <div className="cart-meta-row">
            <span>ضريبة القيمة المضافة (14%)</span>
            <span className="cart-meta-val">{fmt(vatAmount)}</span>
          </div>

          <div className="cart-total-row">
            <span>الإجمالي المستحق</span>
            <span className="cart-total-val">{fmt(grandTotal)}</span>
          </div>

          {/* Payment Action Button */}
          <button
            type="button"
            className="btn-pay-confirm"
            disabled={!canPay}
            onClick={handleInitiateMoyasar}
            style={{
              backgroundColor: canPay ? '#14b8a6' : '#e2e3e6',
              color: canPay ? '#ffffff' : (isCodeExpired || isSchoolMismatch ? '#e11d48' : '#a8aab0'),
              cursor: canPay ? 'pointer' : 'not-allowed',
            }}
          >
            {isSchoolMismatch
              ? '⚠️ كود الطالب غير متطابق مع المدرسة'
              : isCodeExpired
              ? '⚠️ كود الطالب مستخدم ومنتهي الصلاحية'
              : '💳 الدفع بالبطاقة عبر ميسر Moyasar'}
          </button>
        </div>
      </div>
    </div>
  );
};
