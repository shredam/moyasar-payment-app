import React from 'react';

interface SchoolLeadDoneStepProps {
  onRestart: () => void;
}

export const SchoolLeadDoneStep: React.FC<SchoolLeadDoneStepProps> = ({ onRestart }) => {
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

        <h2 className="done-title">تم إرسال الطلب</h2>
        <p className="done-description">
          سيتواصل معك فريق المبيعات خلال يوم عمل واحد على بيانات التواصل التي أدخلتها لعرض التفاصيل وتحديد الخطوات القادمة.
        </p>

        <button type="button" className="btn-restart-link" onClick={onRestart}>
          العودة للبداية
        </button>
      </div>
    </div>
  );
};
