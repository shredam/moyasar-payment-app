import React from 'react';

interface HomePageProps {
  userName: string;
  onGoToSubscriptions: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  userName,
  onGoToSubscriptions,
}) => {
  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-badge">
          <div className="status-dot" />
          الحساب جاهز للاستخدام
        </div>

        <h1 className="home-title">أهلًا {userName}</h1>

        <p className="home-description">
          لم يتم تفعيل أي اشتراك على هذا الحساب حتى الآن. يمكنك بدء تجربة التعليم التفاعلية ومتابعة المناهج باختيار خطة الاشتراك المناسبة.
        </p>

        <button
          type="button"
          className="btn-primary-dark"
          onClick={onGoToSubscriptions}
        >
          الذهاب لصفحة الاشتراكات
        </button>
      </div>
    </div>
  );
};
