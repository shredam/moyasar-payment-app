import React from 'react';

interface NavbarProps {
  userName: string;
  userEmail: string;
  crumbs: { name: string; active?: boolean }[];
  actionLabel: string;
  onAction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  userEmail,
  crumbs,
  actionLabel,
  onAction,
}) => {
  return (
    <header className="navbar-container">
      <div className="navbar-user">
        <div className="user-avatar" aria-hidden="true" />
        <div className="user-details">
          <div className="user-name">{userName}</div>
          <div className="user-email">{userEmail}</div>
        </div>
      </div>

      <nav className="navbar-crumbs" aria-label="Breadcrumb">
        {crumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="crumb-sep">‹</span>}
            <span className={`crumb-item ${crumb.active ? 'active' : ''}`}>
              {crumb.name}
            </span>
          </React.Fragment>
        ))}
      </nav>

      <button type="button" className="navbar-action-btn" onClick={onAction}>
        {actionLabel}
      </button>
    </header>
  );
};
