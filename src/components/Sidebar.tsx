import React from 'react';

import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  FileSearch,
  Users,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab } = useApp();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'screening', label: 'Resume Screening', icon: FileSearch },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'scheduler', label: 'Interview Scheduler', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <Sparkles className="logo-icon" />
          {!collapsed && <span className="logo-text">Talent<span className="accent">AI</span></span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="nav-icon" />
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {isActive && !collapsed && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="sidebar-toggle"
        aria-label="Toggle Sidebar"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <style>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 100;
          transition: width var(--transition-normal);
        }

        .sidebar.collapsed {
          width: 80px;
        }

        .sidebar-header {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          color: var(--primary);
          flex-shrink: 0;
          animation: pulse 2s infinite;
        }

        .logo-text {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.3rem;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .logo-text .accent {
          color: var(--primary);
        }

        .sidebar-nav {
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          border: none;
          background: none;
          color: var(--text-secondary);
          border-radius: var(--btn-radius);
          cursor: pointer;
          font-family: var(--font-body);
          font-weight: 500;
          font-size: 0.95rem;
          transition: all var(--transition-fast);
          position: relative;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover {
          background-color: var(--primary-light);
          color: var(--primary);
        }

        .nav-item.active {
          background-color: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }

        .nav-icon {
          flex-shrink: 0;
        }

        .active-indicator {
          position: absolute;
          right: 0;
          top: 12px;
          bottom: 12px;
          width: 4px;
          background-color: var(--primary);
          border-radius: 4px 0 0 4px;
        }

        .sidebar-toggle {
          position: absolute;
          bottom: 24px;
          right: -16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: all var(--transition-fast);
          z-index: 101;
        }

        .sidebar-toggle:hover {
          background-color: var(--primary-light);
          color: var(--primary);
          transform: scale(1.05);
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.collapsed {
            transform: translateX(0);
            width: 80px;
          }
        }
      `}</style>
    </aside>
  );
};
