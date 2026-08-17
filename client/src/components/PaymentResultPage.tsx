import React from 'react';

interface PaymentResultPageProps {
  status: 'paid' | 'failed' | 'error';
  paymentId: string | null;
  grandTotal?: number;
  message?: string | null;
  onRetry: () => void;
  onGoHome: () => void;
}

export const PaymentResultPage: React.FC<PaymentResultPageProps> = ({
  status,
  paymentId,
  grandTotal,
  message,
  onRetry,
  onGoHome,
}) => {
  const isPaid = status === 'paid';
  const fmt = (n: number) => n.toLocaleString('ar-SA') + ' ريال سعودي';

  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        {/* Status Icon */}
        <div className={`result-icon-box ${isPaid ? 'success' : 'failed'}`}>
          {isPaid ? (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M10 20.5 L16.5 27 L30 13"
                stroke="#14b8a6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M12 12 L28 28 M28 12 L12 28"
                stroke="#e11d48"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Title & Subtitle */}
        <h1 className={`result-title ${isPaid ? 'success-text' : 'failed-text'}`}>
          {isPaid ? 'تمت عملية الدفع بنجاح! 🎉' : 'فشلت عملية الدفع ⚠️'}
        </h1>

        <p className="result-description">
          {isPaid
            ? 'تمت معالجة دفعتك الإلكترونية بنجاح عبر ميسر Moyasar وتفعيل اشتراكك في الصفوف الدراسية المختارة.'
            : message
            ? `سبب عدم التكلفة: ${message}`
            : 'تعذّرت عملية الدفع عبر بوابة ميسر. يرجى التثبت من بيانات البطاقة (مدى / فيزا / ماستركارد)، الرصيد المتاح، أو محاولة استخدام بطاقة أخرى.'}
        </p>

        {/* Transaction Details Table / Card */}
        <div className="result-details-box">
          <div className="details-header">تفاصيل عملية الدفع</div>
          
          <div className="details-grid">
            <div className="details-field">
              <span className="field-label">حالة الدفع</span>
              <span className={`status-pill ${isPaid ? 'paid' : 'failed'}`}>
                {isPaid ? 'مكتمل وناجح (Paid)' : 'غير مكتمل (Failed)'}
              </span>
            </div>

            <div className="details-field">
              <span className="field-label">بوابة الدفع</span>
              <span className="field-value">ميسر Moyasar (SAR)</span>
            </div>

            {grandTotal && grandTotal > 0 ? (
              <div className="details-field">
                <span className="field-label">قيمة الاشتراك</span>
                <span className="field-value" style={{ color: 'var(--primary-teal)', fontWeight: 700 }}>
                  {fmt(grandTotal)}
                </span>
              </div>
            ) : (
              <div className="details-field">
                <span className="field-label">العملة</span>
                <span className="field-value">ريال سعودي (SAR)</span>
              </div>
            )}

            <div className="details-field">
              <span className="field-label">تاريخ العملية</span>
              <span className="field-value">
                {new Date().toLocaleDateString('ar-SA')}
              </span>
            </div>

            {paymentId && (
              <div className="details-field full-width">
                <span className="field-label">رقم العملية (Payment ID)</span>
                <span className="field-value mono-code">{paymentId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          {isPaid ? (
            <button type="button" className="btn-primary-dark" onClick={onGoHome}>
              الذهاب للوحة المعلومات
            </button>
          ) : (
            <>
              <button type="button" className="btn-primary-teal" onClick={onRetry}>
                ↩ إعادة محاولة الدفع
              </button>
              <button type="button" className="btn-secondary-link" onClick={onGoHome}>
                العودة للرئيسية
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
