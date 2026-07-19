import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Sun, Moon } from 'lucide-react';

interface SettingsPageProps {
  addToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ addToast }) => {
  const { settings, updateSettings, theme, toggleTheme } = useApp();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [recruiterName, setRecruiterName] = useState(settings.recruiterName);
  const [recruiterEmail, setRecruiterEmail] = useState(settings.recruiterEmail);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      recruiterName,
      recruiterEmail
    });
    addToast('Settings Saved', 'Configurations updated successfully.', 'success');
  };

  return (
    <div className="settings-page animate-fade-in">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure evaluation properties, theme preferences, and account details.</p>
      </div>

      <div className="settings-layout">
        <form onSubmit={handleSave} className="settings-form glass-card">
          <div className="form-section-title">General Preferences</div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                required
              />
            </div>

            <div className="form-group">
              <label>Recruiter Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={recruiterName} 
                onChange={(e) => setRecruiterName(e.target.value)} 
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Recruiter Email</label>
              <input 
                type="email" 
                className="input-field" 
                value={recruiterEmail} 
                onChange={(e) => setRecruiterEmail(e.target.value)} 
                required
              />
            </div>
          </div>

          <div className="btn-container">
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Settings
            </button>
          </div>
        </form>

        {/* Integration Status column */}
        <div className="integrations-sidebar glass-card">
          <h3>Integration Status</h3>
          <p className="sidebar-description">Connected workspace preferences.</p>
          
          <div className="integration-cards">
            {/* Theme switcher card */}
            <div className="integration-status-card">
              <div className="card-top">
                <div className="icon-badge gmail">
                  {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                </div>
                <div className="status-name">
                  <h4>Theme Selector</h4>
                  <span>Light / Dark mode preference</span>
                </div>
              </div>
              <div className="card-bottom">
                <span className="status-badge active" style={{ textTransform: 'capitalize' }}>
                  {theme} Mode
                </span>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={toggleTheme}
                >
                  Switch Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .settings-form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-section-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .btn-container {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
          margin-top: 10px;
        }

        .integrations-sidebar {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-description {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .integration-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .integration-status-card {
          border: 1px solid var(--border-color);
          border-radius: var(--card-radius);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background-color: var(--bg-tertiary);
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-badge.gmail { background-color: rgba(59, 130, 246, 0.1); color: var(--primary); }

        .status-name h4 {
          font-size: 0.88rem;
          font-weight: 600;
        }

        .status-name span {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.active { color: var(--success); }

        .btn-sm {
          padding: 8px 14px;
          font-size: 0.8rem;
          border-radius: 8px;
        }

        @media (max-width: 992px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
