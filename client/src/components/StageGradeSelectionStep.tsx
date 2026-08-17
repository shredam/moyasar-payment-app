import React, { useState } from 'react';
import type { StageDef, GradeItem, CartItem } from '../types';

interface StageGradeSelectionStepProps {
  onBack: () => void;
  onConfirm: (cartItems: CartItem[], total: number) => void;
}

export const StageGradeSelectionStep: React.FC<StageGradeSelectionStepProps> = ({
  onBack,
  onConfirm,
}) => {
  const [openStage, setOpenStage] = useState<string>('primary');
  const [subject, setSubject] = useState<string>('الفصل الدراسي الأول');
  const [selectedGrades, setSelectedGrades] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('app_selected_grades');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  React.useEffect(() => {
    localStorage.setItem('app_selected_grades', JSON.stringify(selectedGrades));
  }, [selectedGrades]);


  const stageDefs: StageDef[] = [
    {
      id: 'primary',
      name: 'المرحلة الابتدائية',
      grades: [
        { id: 'p1', name: 'الصف الأول الابتدائي', price: 1200 },
        { id: 'p2', name: 'الصف الثاني الابتدائي', price: 1200 },
        { id: 'p3', name: 'الصف الثالث الابتدائي', price: 1400 },
      ],
    },
    {
      id: 'prep',
      name: 'المرحلة المتوسطة',
      disabled: true,
      grades: [
        { id: 'g1', name: 'الصف الأول الإعدادي', price: 1600 },
        { id: 'g2', name: 'الصف الثاني الإعدادي', price: 1600 },
        { id: 'g3', name: 'الصف الثالث الإعدادي', price: 1800 },
      ],
    },
    {
      id: 'secondary',
      name: 'المرحلة الثانوية',
      disabled: true,
      grades: [
        { id: 's1', name: 'الصف الأول الثانوي', price: 2000 },
        { id: 's2', name: 'الصف الثاني الثانوي', price: 2200 },
        { id: 's3', name: 'الصف الثالث الثانوي', price: 2600 },
      ],
    },
  ];

  const subjectDefs = ['الفصل الدراسي الأول', 'الفصل الدراسي الثاني'];

  const toggleGrade = (grade: GradeItem) => {
    const key = `${subject}:${grade.id}`;
    setSelectedGrades((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }
      return next;
    });
  };

  const allGrades = stageDefs.flatMap((s) => s.grades);
  const cartItems: CartItem[] = [];

  subjectDefs.forEach((sub) => {
    allGrades.forEach((g) => {
      if (selectedGrades[`${sub}:${g.id}`]) {
        cartItems.push({ subject: sub, grade: g });
      }
    });
  });

  const total = cartItems.reduce((sum, item) => sum + item.grade.price, 0);
  const fmt = (n: number) => n.toLocaleString('ar-SA') + ' ريال سعودي';


  return (
    <div className="stage-selection-container">
      <div className="lead-back-bar">
        <button type="button" className="back-link" onClick={onBack}>
          رجوع
        </button>
      </div>

      <h1 className="stage-title">اختر المراحل والصفوف المطلوب الاشتراك فيها</h1>
      <p className="stage-subtitle">يتم تحديث قيمة الاشتراك تلقائيًا مع كل اختيار.</p>

      <div className="stage-content-layout">
        {/* Accordion List */}
        <div className="stage-accordion-list">
          {stageDefs.map((stage) => {
            const isOpen = openStage === stage.id && !stage.disabled;
            const picked = stage.grades.filter((g) => selectedGrades[`${subject}:${g.id}`]);

            return (
              <div
                key={stage.id}
                className={`stage-card ${stage.disabled ? 'disabled' : ''}`}
              >
                <div
                  className="stage-card-header"
                  onClick={() => {
                    if (!stage.disabled) {
                      setOpenStage(isOpen ? '' : stage.id);
                    }
                  }}
                >
                  <div className="stage-header-info">
                    <span className="stage-name">{stage.name}</span>

                    {!stage.disabled && (
                      <div className="subject-tabs">
                        {subjectDefs.map((sub) => (
                          <button
                            type="button"
                            key={sub}
                            className={`subject-tab ${subject === sub ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubject(sub);
                            }}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="stage-summary">
                      {stage.disabled
                        ? 'سيتم إتاحتها قريبًا'
                        : picked.length > 0
                        ? `تم اختيار ${picked.length} من ${stage.grades.length} صفوف`
                        : ''}
                    </span>
                  </div>

                  <span className="stage-toggle-label">
                    {stage.disabled
                      ? 'غير متاحة حاليًا'
                      : isOpen
                      ? 'إخفاء'
                      : 'عرض الصفوف'}
                  </span>
                </div>

                {isOpen && (
                  <div className="stage-card-body">
                    {stage.grades.map((grade) => {
                      const isSelected = !!selectedGrades[`${subject}:${grade.id}`];
                      return (
                        <div
                          key={grade.id}
                          className={`grade-row ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleGrade(grade)}
                        >
                          <div className="grade-row-left">
                            <div className={`checkbox-box ${isSelected ? 'checked' : ''}`} />
                            <span className="grade-name">{grade.name}</span>
                          </div>

                          <span className="grade-price">{fmt(grade.price)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Summary */}
        <div className="cart-summary-sidebar">
          <h2 className="cart-title">ملخص الاشتراك</h2>

          <div className="cart-items-list">
            {cartItems.length > 0 ? (
              cartItems.map((item, idx) => (
                <div key={idx} className="cart-item-row">
                  <span>
                    {item.grade.name} — {item.subject}
                  </span>
                  <span className="cart-item-price">{fmt(item.grade.price)}</span>
                </div>
              ))
            ) : (
              <div className="cart-empty-text">لم يتم اختيار أي صف حتى الآن.</div>
            )}
          </div>

          <div className="divider-line" />

          <div className="cart-meta-row">
            <span>عدد الصفوف</span>
            <span className="cart-meta-val">{cartItems.length}</span>
          </div>

          <div className="cart-total-row">
            <span>الإجمالي الشهري</span>
            <span className="cart-total-val">{fmt(total)}</span>
          </div>

          <button
            type="button"
            className="btn-confirm-next"
            disabled={cartItems.length === 0}
            onClick={() => {
              if (cartItems.length > 0) {
                onConfirm(cartItems, total);
              }
            }}
            style={{
              backgroundColor: cartItems.length > 0 ? '#16171a' : '#e2e3e6',
              color: cartItems.length > 0 ? '#ffffff' : '#a8aab0',
              cursor: cartItems.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            متابعة إدخال البيانات
          </button>
        </div>
      </div>
    </div>
  );
};
