import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Mail, Clock, User, CheckCircle } from 'lucide-react';

export const Scheduler: React.FC = () => {
  const { candidates } = useApp();

  const scheduledInterviews = candidates.filter(
    (c) => c.interview_status === 'Scheduled' && c.interview_date
  );

  // Derive active email delivery timeline logs from candidates scheduled state
  const emailHistory = scheduledInterviews.map((c) => ({
    id: `email-${c.id}`,
    candidate_name: c.candidate_name,
    email: c.email,
    sent_time: 'Webhook Saved',
    interview_date: c.interview_date || '',
    status: 'Pending'
  }));

  return (
    <div className="scheduler-page animate-fade-in">
      <div className="page-header">
        <h1>Interview Scheduler & Status</h1>
        <p>Monitor active interview pipelines and auto-triggered email notifications.</p>
      </div>

      <div className="scheduler-layout">
        {/* Scheduled pipeline */}
        <div className="scheduled-card glass-card">
          <div className="card-header">
            <Calendar size={18} className="header-icon" />
            <h3>Upcoming Interviews ({scheduledInterviews.length})</h3>
          </div>
          <div className="interviews-list">
            {scheduledInterviews.length === 0 ? (
              <div className="empty-state">
                <Calendar size={32} className="empty-icon" />
                <p>No interviews scheduled yet. Move candidates to screening/invite state to schedule.</p>
              </div>
            ) : (
              scheduledInterviews.map((c) => (
                <div key={c.id} className="interview-item">
                  <div className="item-left">
                    <div className="candidate-avatar">
                      <User size={16} />
                    </div>
                    <div className="candidate-meta">
                      <h4>{c.candidate_name}</h4>
                      <span>{c.email}</span>
                    </div>
                  </div>
                  <div className="item-right">
                    <div className="time-badge">
                      <Clock size={12} />
                      <span>{c.interview_date} at {c.interview_time} ({c.meeting_type})</span>
                    </div>
                    <span className="interviewer-tag">Interviewer: <strong>{c.interviewer}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Email logs */}
        <div className="email-history-card glass-card">
          <div className="card-header">
            <Mail size={18} className="header-icon" />
            <h3>Email Delivery History ({emailHistory.length})</h3>
          </div>
          <div className="email-timeline">
            {emailHistory.length === 0 ? (
              <div className="empty-state">
                <Mail size={32} className="empty-icon" />
                <p>No invitation logs found.</p>
              </div>
            ) : (
              emailHistory.map((log) => (
                <div key={log.id} className="timeline-item">
                  <div className="timeline-marker">
                    <CheckCircle size={16} className="delivered-icon" />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-meta">
                      <h4>Invitation Status for {log.candidate_name}</h4>
                      <span className="time-stamp">{log.sent_time}</span>
                    </div>
                    <p className="email-details">
                      Queued for <strong>{log.email}</strong> regarding schedule on {log.interview_date}.
                    </p>
                    <div className="status-indicator">
                      <span className="dot warning" />
                      <span>Email Delivery: <strong>{log.status} (Email workflow will be connected later)</strong></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scheduler-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .scheduler-layout {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
          margin-bottom: 20px;
        }

        .card-header h3 {
          font-size: 1.05rem;
          font-weight: 600;
        }

        .header-icon {
          color: var(--primary);
        }

        .interviews-list, .email-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .interview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--card-radius);
          transition: border-color var(--transition-fast);
        }

        .interview-item:hover {
          border-color: var(--primary);
        }

        .item-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .candidate-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .candidate-meta h4 {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .candidate-meta span {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .item-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .time-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary);
          background-color: var(--primary-light);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .interviewer-tag {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        /* Timeline styling */
        .timeline-item {
          display: flex;
          gap: 16px;
          position: relative;
        }

        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .delivered-icon {
          color: var(--warning);
          z-index: 2;
          background-color: var(--bg-secondary);
        }

        .timeline-content {
          flex: 1;
          background-color: var(--bg-tertiary);
          border-radius: var(--card-radius);
          padding: 16px;
          border: 1px solid var(--border-color);
        }

        .timeline-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .timeline-meta h4 {
          font-size: 0.88rem;
          font-weight: 600;
        }

        .time-stamp {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .email-details {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .dot.warning {
          background-color: var(--warning);
        }

        .empty-state {
          text-align: center;
          padding: 32px 16px;
          color: var(--text-muted);
        }

        .empty-icon {
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 0.82rem;
        }

        @media (max-width: 992px) {
          .scheduler-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
