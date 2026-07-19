import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { candidates, recentActivities } = useApp();

  // Metrics calculations
  const totalCandidates = candidates.length;
  const strongFit = candidates.filter((c) => c.status === 'Strong Fit').length;
  const possibleFit = candidates.filter((c) => c.status === 'Possible Fit').length;
  const rejected = candidates.filter((c) => c.status === 'Rejected').length;
  const interviewsScheduled = candidates.filter((c) => c.interview_status === 'Scheduled').length;
  
  const avgMatchScore = totalCandidates > 0 ? Math.round(
    candidates.reduce((sum, c) => sum + c.match_score, 0) / totalCandidates
  ) : 0;

  // 1. Live Candidate Distribution (Pie)
  const distributionData = [
    { name: 'Strong Fit', value: strongFit, color: '#10b981' },
    { name: 'Possible Fit', value: possibleFit, color: '#f59e0b' },
    { name: 'Rejected', value: rejected, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // 2. Live Top Skills parsed from candidate records (Bar)
  const skillCounts: { [key: string]: number } = {};
  candidates.forEach(c => {
    if (c.strengths) {
      c.strengths.split(/[,/]+/).forEach(s => {
        const skill = s.trim();
        if (skill && skill !== 'N/A') {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        }
      });
    }
  });

  const skillData = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 3. Live Interview Status Distribution (Bar)
  const interviewStatuses = {
    Pending: candidates.filter(c => c.interview_status === 'Pending').length,
    Scheduled: candidates.filter(c => c.interview_status === 'Scheduled').length,
    Completed: candidates.filter(c => c.interview_status === 'Completed').length,
    Cancelled: candidates.filter(c => c.interview_status === 'Cancelled').length
  };

  const statusChartData = Object.entries(interviewStatuses).map(([name, count]) => ({
    name,
    count
  })).filter(item => item.count > 0);


  const kpis = [
    { label: 'Total Candidates', value: totalCandidates, icon: FileText, color: 'blue' },
    { label: 'Strong Fit', value: strongFit, icon: CheckCircle, color: 'green' },
    { label: 'Possible Fit', value: possibleFit, icon: AlertTriangle, color: 'orange' },
    { label: 'Rejected', value: rejected, icon: XCircle, color: 'red' },
    { label: 'Scheduled Interviews', value: interviewsScheduled, icon: Calendar, color: 'purple' },
    { label: 'Average Match Score', value: `${avgMatchScore}%`, icon: Sparkles, color: 'teal' }
  ];

  if (totalCandidates === 0) {
    return (
      <div className="dashboard-page animate-fade-in">
        <div className="welcome-banner glass-card">
          <div className="banner-left">
            <h1>Welcome back to TalentAI Recruiter</h1>
            <p>Your applicant screening database is currently empty.</p>
          </div>
          <div className="banner-right">
            <Database className="banner-sparkle" size={32} />
          </div>
        </div>

        <div className="empty-state-dashboard glass-card">
          <Database size={64} className="empty-icon" />
          <h2>No resumes have been screened yet.</h2>
          <p>Navigate to the <strong>Resume Screening</strong> tab in the sidebar to upload files and evaluate candidates.</p>
        </div>

        <style>{`
          .dashboard-page {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .welcome-banner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: linear-gradient(135deg, var(--primary-light) 0%, rgba(139, 92, 246, 0.05) 100%);
            border-left: 5px solid var(--primary);
            padding: 24px;
          }
          .welcome-banner h1 {
            font-size: 1.5rem;
            margin-bottom: 6px;
          }
          .welcome-banner p {
            color: var(--text-secondary);
            font-size: 0.95rem;
          }
          .banner-sparkle {
            color: var(--primary);
          }
          .empty-state-dashboard {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 100px 24px;
            gap: 16px;
          }
          .empty-icon {
            color: var(--text-muted);
            animation: pulse 2s infinite;
          }
          .empty-state-dashboard h2 {
            font-size: 1.3rem;
            font-weight: 600;
          }
          .empty-state-dashboard p {
            font-size: 0.9rem;
            color: var(--text-secondary);
            max-width: 480px;
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="welcome-banner glass-card">
        <div className="banner-left">
          <h1>Welcome back to TalentAI Recruiter</h1>
          <p>Displaying live synchronized metrics from n8n backend pipelines.</p>
        </div>
        <div className="banner-right">
          <Sparkles className="banner-sparkle" size={32} />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="kpi-card glass-card">
              <div className={`kpi-icon-wrapper ${kpi.color}`}>
                <Icon size={20} />
              </div>
              <div className="kpi-info">
                <span>{kpi.label}</span>
                <h2>{kpi.value}</h2>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Candidate Distribution Pie */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Candidate Distribution</h3>
            <span>Live match segmentation</span>
          </div>
          <div className="chart-body">
            {distributionData.length === 0 ? (
              <p className="no-data-msg">No distribution metrics available</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Skill distribution bar */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Top Skills Distribution</h3>
            <span>Extracted dynamically from parsed resume strengths</span>
          </div>
          <div className="chart-body">
            {skillData.length === 0 ? (
              <p className="no-data-msg">No skill matrices extracted yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={skillData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Interview Status Distribution bar */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Interview Status Funnel</h3>
            <span>Live pipeline routing states</span>
          </div>
          <div className="chart-body">
            {statusChartData.length === 0 ? (
              <p className="no-data-msg">No interviews scheduled yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Activity and Action Grid */}
      <div className="activity-layout">
        <div className="recent-activity-card glass-card">
          <div className="activity-header">
            <h3>Recent Activity</h3>
            <span>Latest events logged</span>
          </div>
          <div className="activity-list">
            {recentActivities.length === 0 ? (
              <p className="no-activity">No recent activities logged.</p>
            ) : (
              recentActivities.map((act) => (
                <div key={act.id} className="activity-row">
                  <div className={`activity-icon ${act.type}`}>
                    <ArrowUpRight size={14} />
                  </div>
                  <div className="activity-details">
                    <p>{act.message}</p>
                    <span>{act.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .welcome-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, var(--primary-light) 0%, rgba(139, 92, 246, 0.05) 100%);
          border-left: 5px solid var(--primary);
        }

        .welcome-banner h1 {
          font-size: 1.5rem;
          margin-bottom: 6px;
        }

        .welcome-banner p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .banner-sparkle {
          color: var(--primary);
          animation: pulse 2s infinite;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        .kpi-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
        }

        .kpi-icon-wrapper {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon-wrapper.blue { background-color: rgba(37, 99, 235, 0.1); color: #3b82f6; }
        .kpi-icon-wrapper.indigo { background-color: rgba(99, 102, 241, 0.1); color: #6366f1; }
        .kpi-icon-wrapper.green { background-color: var(--success-light); color: var(--success); }
        .kpi-icon-wrapper.orange { background-color: var(--warning-light); color: var(--warning); }
        .kpi-icon-wrapper.red { background-color: var(--danger-light); color: var(--danger); }
        .kpi-icon-wrapper.purple { background-color: rgba(168, 85, 247, 0.1); color: #a855f7; }
        .kpi-icon-wrapper.teal { background-color: rgba(20, 184, 166, 0.1); color: #14b8a6; }

        .kpi-info span {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .kpi-info h2 {
          font-size: 1.4rem;
          font-weight: 700;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .chart-card {
          padding: 20px;
        }

        .chart-header {
          margin-bottom: 20px;
        }

        .chart-header h3 {
          font-size: 1rem;
          font-weight: 600;
        }

        .chart-header span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .chart-body {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 240px;
        }

        .no-data-msg {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .activity-layout {
          display: grid;
          grid-template-columns: 1fr;
        }

        .recent-activity-card {
          padding: 24px;
        }

        .activity-header {
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .activity-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-icon.resume { background-color: var(--primary-light); color: var(--primary); }
        .activity-icon.shortlist { background-color: var(--success-light); color: var(--success); }
        .activity-icon.interview { background-color: var(--warning-light); color: var(--warning); }
        .activity-icon.email { background-color: var(--primary-light); color: var(--primary); }

        .activity-details p {
          font-size: 0.88rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .activity-details span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .no-activity {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          padding: 20px 0;
        }
      `}</style>
    </div>
  );
};
