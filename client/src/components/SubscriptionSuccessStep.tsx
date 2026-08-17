import React from 'react';

interface SubscriptionSuccessStepProps {
  grandTotal: number;
  onGoHome: () => void;
}

export const SubscriptionSuccessStep: React.FC<SubscriptionSuccessStepProps> = ({
  grandTotal,
  onGoHome,
}) => {
  const fmt = (n: number) => n.toLocaleString('ar-SA') + ' ريال سعودي';


  return (
    <div className="lead-done-container">
      <div className="lead-done-card">
        <div className="lead-done-icon">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path
              d="M7 15.5 L12.5 21 L23 9"
              stroke="#14b8a6"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="done-title">تم الاشتراك بنجاح</h2>
        <p className="done-description">
          تم تسجيل الاشتراك وإرسال تفاصيل الفاتورة إلى بريدك الإلكتروني. يمكنك الوصول إلى المحتوى والبدء فورًا.
        </p>

        <div className="success-amount-badge">
          <span>الإجمالي المدفوع</span>
          <span className="amount-val">{fmt(grandTotal)}</span>
        </div>

        <button type="button" className="btn-restart-link" onClick={onGoHome}>
          الذهاب للوحة المعلومات
        </button>
      </div>
    </div>
  );
};
