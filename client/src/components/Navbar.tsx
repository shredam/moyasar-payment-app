import React, { useState } from 'react';

interface NavbarProps {
  userName: string;
  userEmail: string;
  crumbs: { name: string; active?: boolean }[];
  actionLabel: string;
  onAction: () => void;
  onViewData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  userEmail,
  crumbs,
  actionLabel,
  onAction,
  onViewData,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeCrumbIdx = crumbs.findIndex((c) => c.active);
  const activeCrumb = activeCrumbIdx !== -1 ? crumbs[activeCrumbIdx] : crumbs[crumbs.length - 1];

  return (
    <header className="navbar-container">
      <div className="navbar-top-row">
        <div className="navbar-user">
          <div className="user-avatar" aria-hidden="true">
            {userName ? userName[0] : 'S'}
          </div>
          <div className="user-details">
            <div className="user-name">{userName}</div>
            <div className="user-email">{userEmail}</div>
          </div>
        </div>

        {/* Breadcrumbs for Tablet/Desktop middle section */}
        {crumbs.length > 0 && (
          <nav className="navbar-crumbs navbar-crumbs-desktop" aria-label="Breadcrumb">
            {crumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="crumb-sep">‹</span>}
                <span className={`crumb-item ${crumb.active ? 'active' : ''}`}>
                  {crumb.name}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Actions for Desktop */}
        <div className="navbar-actions-desktop">
          {onViewData && (
            <button
              type="button"
              className="navbar-action-btn data-btn"
              onClick={onViewData}
            >
              📊 سجلات البيانات
            </button>
          )}
          <button type="button" className="navbar-action-btn logout-btn" onClick={onAction}>
            {actionLabel}
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="القائمة الرئيسية"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Active Crumb Bar */}
      {crumbs.length > 0 && activeCrumb && (
        <div className="navbar-active-crumb-mobile">
          <span className="mobile-step-badge">الخطوة {activeCrumbIdx !== -1 ? activeCrumbIdx + 1 : 1}/{crumbs.length}</span>
          <span className="mobile-step-title">{activeCrumb.name}</span>
        </div>
      )}

      {/* Mobile Menu Dropdown / Drawer */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          {onViewData && (
            <button
              type="button"
              className="mobile-menu-item"
              onClick={() => {
                setMobileMenuOpen(false);
                onViewData();
              }}
            >
              📊 سجلات قاعدة البيانات
            </button>
          )}
          <button
            type="button"
            className="mobile-menu-item danger"
            onClick={() => {
              setMobileMenuOpen(false);
              onAction();
            }}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </header>
  );
};

