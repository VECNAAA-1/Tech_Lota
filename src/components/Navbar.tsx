import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, Sun, Moon, User, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, searchQuery, setSearchQuery, settings, recentActivities, logoutUser, user } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <header className="navbar glass-card">
      <div className="navbar-left">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search candidates by name, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="navbar-right">
        {/* Theme Switcher */}
        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications */}
        <div className="notification-container">
          <button 
            className="icon-btn relative" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            {recentActivities.length > 0 && <span className="badge-dot" />}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown glass-card">
              <div className="dropdown-header">
                <h3>Recent Updates</h3>
                <span className="clear-btn" onClick={() => setShowNotifications(false)}>Close</span>
              </div>
              <div className="dropdown-list">
                {recentActivities.length === 0 ? (
                  <p className="no-activity">No new notifications.</p>
                ) : (
                  recentActivities.slice(0, 5).map((act) => (
                    <div key={act.id} className="dropdown-item">
                      <div className={`activity-dot ${act.type}`} />
                      <div className="activity-content">
                        <p>{act.message}</p>
                        <span>{act.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card & Logout Dropdown */}
        <div className="profile-container">
          <div 
            className="profile-card" 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="avatar">
              <User size={18} />
            </div>
            <div className="profile-info">
              <span className="profile-name">{user?.name || settings.recruiterName}</span>
              <span className="profile-role">{user?.role || 'Recruiter'}, {user?.company || settings.companyName}</span>
            </div>
          </div>

          {showProfileDropdown && (
            <div className="profile-dropdown glass-card">
              <div className="user-details">
                <h4>{user?.name || settings.recruiterName}</h4>
                <span>{user?.email || settings.recruiterEmail}</span>
              </div>
              <button className="logout-btn" onClick={logoutUser}>
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          margin-bottom: 24px;
          border-radius: 16px;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
        }

        .navbar-left {
          flex: 1;
          max-width: 480px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--btn-radius);
          padding: 8px 16px;
          gap: 12px;
          transition: border-color var(--transition-fast);
        }

        .search-bar:focus-within {
          border-color: var(--primary);
        }

        .search-bar input {
          border: none;
          background: none;
          color: var(--text-primary);
          width: 100%;
          outline: none;
          font-family: var(--font-body);
          font-size: 0.9rem;
        }

        .search-icon {
          color: var(--text-muted);
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 10px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .icon-btn:hover {
          background-color: var(--bg-tertiary);
          color: var(--primary);
        }

        .relative {
          position: relative;
        }

        .badge-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background-color: var(--danger);
          border-radius: 50%;
          border: 2px solid var(--bg-secondary);
        }

        .notification-container {
          position: relative;
        }

        .notifications-dropdown {
          position: absolute;
          right: 0;
          top: 48px;
          width: 320px;
          max-height: 400px;
          overflow-y: auto;
          z-index: 200;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: fadeIn var(--transition-fast) forwards;
        }

        .dropdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .dropdown-header h3 {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .clear-btn {
          font-size: 0.75rem;
          color: var(--primary);
          cursor: pointer;
        }

        .dropdown-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dropdown-item {
          display: flex;
          gap: 12px;
          padding: 8px;
          border-radius: var(--btn-radius);
          transition: background-color var(--transition-fast);
        }

        .dropdown-item:hover {
          background-color: var(--bg-tertiary);
        }

        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .activity-dot.resume { background-color: var(--primary); }
        .activity-dot.shortlist { background-color: var(--success); }
        .activity-dot.interview { background-color: var(--warning); }
        .activity-dot.email { background-color: var(--primary); }

        .activity-content p {
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .activity-content span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .no-activity {
          font-size: 0.82rem;
          color: var(--text-muted);
          text-align: center;
        }

        /* Profile Dropdown styling */
        .profile-container {
          position: relative;
        }

        .profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 12px;
          border-radius: var(--btn-radius);
          border: 1px solid var(--border-color);
          background-color: var(--bg-tertiary);
          cursor: pointer;
          user-select: none;
          transition: border-color var(--transition-fast);
        }

        .profile-card:hover {
          border-color: var(--primary);
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
        }

        .profile-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .profile-role {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .profile-dropdown {
          position: absolute;
          right: 0;
          top: 52px;
          width: 220px;
          padding: 12px;
          z-index: 200;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: fadeIn var(--transition-fast) forwards;
        }

        .user-details {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .user-details h4 {
          font-size: 0.88rem;
          font-weight: 600;
        }

        .user-details span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--danger);
          padding: 8px;
          border-radius: var(--btn-radius);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color var(--transition-fast);
          width: 100%;
          text-align: left;
        }

        .logout-btn:hover {
          background-color: var(--danger-light);
        }

        @media (max-width: 768px) {
          .profile-info {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
