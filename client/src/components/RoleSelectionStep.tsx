import React, { useState } from 'react';

interface RoleSelectionStepProps {
  selectedRole: string | null;
  onSelectRole: (roleId: 'teacher' | 'school_student' | 'independent_student' | 'tutor') => void;
  onNext: () => void;
}

export const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({
  selectedRole,
  onSelectRole,
  onNext,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoverNext, setHoverNext] = useState(false);

  const roles = [
    {
      id: 'teacher',
      title: 'مدرسة',
      subtitle: 'تعاقد مؤسسي لمدرسة ترغب في تطبيق النظام على طلابها ومعلميها',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
          <rect x="8" y="16" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2.5" />
          <path d="M24 8 L40 16 L8 16 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="16" y="24" width="6" height="8" rx="1" fill="currentColor" opacity="0.3" />
          <rect x="26" y="24" width="6" height="8" rx="1" fill="currentColor" opacity="0.3" />
        </svg>
      ),
    },
    {
      id: 'school_student',
      title: 'اشتراك مدرسي',
      subtitle: 'اشتراك لطالب مُقيّد في مدرسة، لمتابعة المناهج وتحسين المستوى الدراسي',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
          <path d="M24 8 L42 17 L24 26 L6 17 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M12 21 V32 C12 36 36 36 36 32 V21" stroke="currentColor" strokeWidth="2.5" />
          <path d="M38 19 V31" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="38" cy="33" r="2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'independent_student',
      title: 'طالب مستقل',
      disabled: true,
      subtitle: 'اشتراك فردي لمن يدرس بمفرده ويحتاج إلى تنظيم خطته التعليمية (قريبًا)',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
          <circle cx="24" cy="16" r="8" stroke="currentColor" strokeWidth="2.5" />
          <path d="M10 38 C10 30 16 26 24 26 C32 26 38 30 38 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'tutor',
      title: 'مدرّس خصوصي',
      disabled: true,
      subtitle: 'اشتراك لمعلم يقدّم دروسًا خاصة ويتابع أداء طلابه ومواعيدهم (قريبًا)',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
          <rect x="6" y="10" width="36" height="24" rx="3" stroke="currentColor" strokeWidth="2.5" />
          <path d="M18 34 L12 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M30 34 L36 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M14 20 L22 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M14 26 L28 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="role-selection-container">
      <h1 className="role-headline">إنت عايز تستخدم الاشتراك كإيه؟</h1>

      <div className="role-cards-grid">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          const isHovered = hovered === role.id && !role.disabled;

          return (
            <div
              key={role.id}
              className={`role-card ${isSelected ? 'selected' : ''} ${role.disabled ? 'disabled' : ''}`}
              onClick={() => {
                if (!role.disabled) {
                  onSelectRole(role.id as any);
                }
              }}
              onMouseEnter={() => setHovered(role.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                borderColor: isSelected || isHovered ? '#14b8a6' : '#e2e3e6',
                backgroundColor: isSelected ? '#effcfa' : '#ffffff',
                transform: isHovered ? 'translateY(-4px)' : 'none',
                boxShadow: isHovered ? '0 12px 28px rgba(20,184,166,0.14)' : 'none',
              }}
            >
              <div className={`role-icon ${isSelected ? 'selected' : ''}`}>
                {role.icon}
              </div>

              <div className="role-title">{role.title}</div>
              <div className="role-subtitle">{role.subtitle}</div>
            </div>
          );
        })}
      </div>

      <div
        className="next-btn-wrapper"
        onMouseEnter={() => setHoverNext(true)}
        onMouseLeave={() => setHoverNext(false)}
      >
        <div
          className="next-btn-circle"
          style={{
            width: hoverNext ? '48px' : '0px',
            opacity: hoverNext ? 1 : 0,
            backgroundColor: selectedRole ? '#16171a' : '#e2e3e6',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M12 4 L5 9 L12 14"
              stroke={selectedRole ? '#ffffff' : '#a8aab0'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button
          type="button"
          className="btn-next-submit"
          disabled={!selectedRole}
          onClick={onNext}
          style={{
            backgroundColor: selectedRole ? '#16171a' : '#e2e3e6',
            color: selectedRole ? '#ffffff' : '#a8aab0',
            cursor: selectedRole ? 'pointer' : 'not-allowed',
          }}
        >
          التالي: تفاصيل الاشتراك
        </button>
      </div>
    </div>
  );
};
