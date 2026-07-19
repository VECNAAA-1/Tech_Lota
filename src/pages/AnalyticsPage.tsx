import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Award, Users } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { candidates } = useApp();

  // Metrics
  const avgScore = Math.round(
    candidates.reduce((sum, c) => sum + c.match_score, 0) / (candidates.length || 1)
  );

  // Conversion data
  const conversionData = [
    { stage: 'Uploaded', Candidates: candidates.length + 10 },
    { stage: 'Screened', Candidates: candidates.length },
    { stage: 'Shortlisted', Candidates: candidates.filter(c => c.status === 'Strong Fit').length },
    { stage: 'Interviews', Candidates: candidates.filter(c => c.interview_status === 'Scheduled').length }
  ];

  // Candidates per role data
  const rolesData = [
    { role: 'Backend Dev', count: 5 },
    { role: 'Frontend Dev', count: 4 },
    { role: 'DevOps Eng', count: 3 },
    { role: 'Data Scientist', count: 2 },
    { role: 'Product Manager', count: 1 }
  ];

  // Match score distribution
  const scoreDistribution = [
    { scoreRange: '90-100', count: candidates.filter(c => c.match_score >= 90).length },
    { scoreRange: '80-89', count: candidates.filter(c => c.match_score >= 80 && c.match_score < 90).length },
    { scoreRange: '70-79', count: candidates.filter(c => c.match_score >= 70 && c.match_score < 80).length },
    { scoreRange: '<70', count: candidates.filter(c => c.match_score < 70).length }
  ];

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="analytics-page animate-fade-in">
      <div className="page-header">
        <h1>TalentAI Analytics</h1>
        <p>In-depth statistics and talent pipelines overview.</p>
      </div>

      <div className="metrics-summary-grid">
        <div className="summary-card glass-card">
          <TrendingUp className="summary-icon blue" />
          <div className="summary-meta">
            <span>Average Match Score</span>
            <h2>{avgScore}%</h2>
          </div>
        </div>
        <div className="summary-card glass-card">
          <Award className="summary-icon green" />
          <div className="summary-meta">
            <span>Interview Conv. Rate</span>
            <h2>42%</h2>
          </div>
        </div>
        <div className="summary-card glass-card">
          <Users className="summary-icon orange" />
          <div className="summary-meta">
            <span>Active Roles</span>
            <h2>5 Positions</h2>
          </div>
        </div>
      </div>

      <div className="analytics-charts-grid">
        {/* Stage Conversion */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Interview Conversion Rate</h3>
            <span>Stages and candidates funnel</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={conversionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="stage" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} />
                <Bar dataKey="Candidates" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roles Distribution */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Candidates per Job Role</h3>
            <span>Open reqs talent density</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={rolesData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis dataKey="role" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }} />
                <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="chart-card glass-card">
          <div className="chart-header">
            <h3>Match Score Ranges</h3>
            <span>Distribution of candidate scores</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="count"
                  nameKey="scoreRange"
                  label
                >
                  {scoreDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        .analytics-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .metrics-summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .summary-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--btn-radius);
          padding: 12px;
        }

        .summary-icon.blue { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .summary-icon.green { background-color: var(--success-light); color: var(--success); }
        .summary-icon.orange { background-color: var(--warning-light); color: var(--warning); }

        .summary-meta span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .summary-meta h2 {
          font-size: 1.5rem;
        }

        .analytics-charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 24px;
        }

        .chart-card {
          padding: 20px;
        }

        .chart-header {
          margin-bottom: 20px;
        }

        .chart-header h3 {
          font-size: 1rem;
        }

        .chart-header span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .chart-body {
          display: flex;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};
