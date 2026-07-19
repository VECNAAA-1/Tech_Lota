import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Candidate } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { 
  Calendar, 
  ArrowUpDown, 
  Check, 
  X, 
  ExternalLink,
  Download,
  Mail,
  Award,
  Briefcase,
  AlertCircle,
  FileText,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CandidatesProps {
  addToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const Candidates: React.FC<CandidatesProps> = ({ addToast }) => {
  const { 
    candidates, 
    bulkAction, 
    scheduleInterview, 
    searchQuery,
    isFetchingCandidates
  } = useApp();

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Filtering states
  const [minScore, setMinScore] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [skillsFilter, setSkillsFilter] = useState<string>('');

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  
  // Scheduler form states
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [meetingType, setMeetingType] = useState('Google Meet');
  const [interviewer, setInterviewer] = useState('');
  const [notes, setNotes] = useState('');
  const [isSchedulingInProgress, setIsSchedulingInProgress] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<'match_score' | 'candidate_name'>('match_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtered and Sorted candidates list
  const processedCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        const matchesSearch = c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.strengths.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesScore = c.match_score >= minScore;
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesSkills = !skillsFilter || c.strengths.toLowerCase().includes(skillsFilter.toLowerCase());
        
        return matchesSearch && matchesScore && matchesStatus && matchesSkills;
      })
      .sort((a, b) => {
        // Strong Fit candidates first
        const scoreA = a.status === 'Strong Fit' ? 2 : a.status === 'Possible Fit' ? 1 : 0;
        const scoreB = b.status === 'Strong Fit' ? 2 : b.status === 'Possible Fit' ? 1 : 0;
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }

        // Secondary sorting
        let multiplier = sortDirection === 'asc' ? 1 : -1;
        if (sortField === 'match_score') {
          return (a.match_score - b.match_score) * multiplier;
        } else {
          return a.candidate_name.localeCompare(b.candidate_name) * multiplier;
        }
      });
  }, [candidates, searchQuery, minScore, statusFilter, skillsFilter, sortField, sortDirection]);

  // Paginated list
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [processedCandidates, currentPage]);

  const totalPages = Math.ceil(processedCandidates.length / itemsPerPage);

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedCandidates.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Details Modal handler
  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsOpen(true);
  };

  // Scheduler Modal launcher
  const handleOpenScheduler = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setScheduleDate(candidate.interview_date || '');
    setScheduleTime(candidate.interview_time || '');
    setMeetingType(candidate.meeting_type || 'Google Meet');
    setInterviewer(candidate.interviewer || '');
    setNotes(candidate.notes || '');
    setIsSchedulerOpen(true);
  };

  const submitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setIsSchedulingInProgress(true);
    try {
      const success = await scheduleInterview({
        candidateId: selectedCandidate.id,
        interviewDate: scheduleDate,
        interviewTime: scheduleTime,
        meetingType,
        interviewer,
        notes
      });

      if (success) {
        addToast(
          'Interview Scheduled Successfully',
          `Calendar invitation parameters updated for ${selectedCandidate.candidate_name}.`,
          'success'
        );
        addToast('Candidates Updated', 'Live data list updated.', 'success');
        setIsSchedulerOpen(false);
      }
    } catch (err) {
      addToast('Scheduling Failed', 'There was an error communicating with n8n backend.', 'error');
    } finally {
      setIsSchedulingInProgress(false);
    }
  };

  const handleBulkAction = (action: 'invite' | 'reject' | 'next_round' | 'export_csv' | 'export_excel') => {
    if (selectedIds.length === 0) {
      addToast('No Selection', 'Please select at least one candidate.', 'info');
      return;
    }
    bulkAction(action, selectedIds);
    setSelectedIds([]);
    addToast('Bulk Action Executed', `Processed bulk ${action} request.`, 'success');
  };

  const toggleSort = (field: 'match_score' | 'candidate_name') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="candidates-page animate-fade-in">
      <div className="page-header">
        <h1>Candidates</h1>
        <p>Live synchronized records from Google Sheets database.</p>
      </div>

      {/* Filtering Control Bar */}
      <div className="filters-bar glass-card">
        <div className="filter-group">
          <label>Min Match Score ({minScore}%)</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={minScore} 
            onChange={(e) => setMinScore(Number(e.target.value))} 
            className="score-range"
          />
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select 
            className="input-field select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Strong Fit">Strong Fit</option>
            <option value="Possible Fit">Possible Fit</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filter Skills</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="e.g. AWS, React"
            value={skillsFilter}
            onChange={(e) => setSkillsFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Bulk Action Controls */}
      <div className="bulk-actions-container">
        <div className="bulk-left">
          <span className="selected-count">{selectedIds.length} selected</span>
          {isFetchingCandidates && (
            <span className="refreshing-tag">
              <span className="sync-pulse" /> Fetching Candidates...
            </span>
          )}
        </div>
        <div className="bulk-buttons">
          <button className="btn btn-secondary btn-sm" onClick={() => handleBulkAction('export_csv')}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => handleBulkAction('next_round')}>
            <Check size={14} /> Move to Next Round
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => handleBulkAction('reject')}>
            <X size={14} /> Reject Selected
          </button>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="table-wrapper glass-card">
        {candidates.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} className="empty-icon" />
            <h3>No resumes have been screened yet.</h3>
            <p>Upload files in the Resume Screening tab to trigger AI parsing pipelines.</p>
          </div>
        ) : processedCandidates.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} className="empty-icon" />
            <h3>No Candidates Match Filter Criteria</h3>
            <p>Try resetting minimum score range or status filters.</p>
          </div>
        ) : (
          <>
            <table className="results-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={selectedIds.length === paginatedCandidates.length && paginatedCandidates.length > 0} 
                    />
                  </th>
                  <th onClick={() => toggleSort('candidate_name')} className="sortable-header">
                    Candidate Name <ArrowUpDown size={14} />
                  </th>
                  <th onClick={() => toggleSort('match_score')} className="sortable-header">
                    Match Score <ArrowUpDown size={14} />
                  </th>
                  <th>Strengths</th>
                  <th>Status</th>
                  <th>Interview Date</th>
                  <th>Interview Time</th>
                  <th>Interview Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCandidates.map((candidate) => {
                  const isSelected = selectedIds.includes(candidate.id);
                  const badgeClass = candidate.status === 'Strong Fit' 
                    ? 'badge-strong' 
                    : candidate.status === 'Possible Fit' 
                      ? 'badge-possible' 
                      : 'badge-rejected';

                  return (
                    <tr key={candidate.id} className={isSelected ? 'row-selected' : ''}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => handleSelectRow(candidate.id)} 
                        />
                      </td>
                      <td>
                        <div className="candidate-cell">
                          <span className="candidate-name">{candidate.candidate_name}</span>
                          <span className="candidate-email">{candidate.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`score-badge ${candidate.match_score >= 85 ? 'high' : candidate.match_score >= 70 ? 'med' : 'low'}`}>
                          {candidate.match_score}%
                        </span>
                      </td>
                      <td>
                        <span className="strengths-text" title={candidate.strengths}>
                          {candidate.strengths}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{candidate.status}</span>
                      </td>
                      <td>{candidate.interview_date || '—'}</td>
                      <td>{candidate.interview_time || '—'}</td>
                      <td>
                        <span className={`interview-status ${candidate.interview_status.toLowerCase()}`}>
                          {candidate.interview_status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            onClick={() => handleViewDetails(candidate)}
                            title="View Details"
                          >
                            <ExternalLink size={16} />
                          </button>
                          {candidate.status !== 'Rejected' && (
                            <button 
                              className="btn-icon schedule"
                              onClick={() => handleOpenScheduler(candidate)}
                              title="Schedule Interview"
                            >
                              <Calendar size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="page-indicator">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <Modal 
          isOpen={isDetailsOpen} 
          onClose={() => setIsDetailsOpen(false)} 
          title="Candidate Detailed Analysis" 
          size="lg"
        >
          <div className="details-layout">
            <div className="details-header-card">
              <div>
                <h2>{selectedCandidate.candidate_name}</h2>
                <p className="email-display"><Mail size={14} /> {selectedCandidate.email}</p>
              </div>
              <div className="details-score-box">
                <span className="score-num">{selectedCandidate.match_score}%</span>
                <span>Match Score</span>
              </div>
            </div>

            <div className="details-grid">
              <div className="details-card-col">
                <div className="section-card">
                  <div className="section-title"><Award size={18} /> Strengths & Skills</div>
                  <p className="section-text">{selectedCandidate.strengths}</p>
                </div>

                <div className="section-card">
                  <div className="section-title"><Briefcase size={18} /> Resume Summary</div>
                  <p className="section-text">{selectedCandidate.resume_summary}</p>
                </div>
              </div>

              <div className="details-card-col">
                <div className="section-card">
                  <div className="section-title"><FileText size={18} /> Job Match Analysis</div>
                  <p className="section-text italic">{selectedCandidate.job_match_analysis || 'Relevance metrics synced.'}</p>
                </div>

                {/* Disabled Email send button with Tooltip / placeholder */}
                <div className="section-card email-prep-card">
                  <div className="section-title"><Mail size={18} /> Contact Pipelines</div>
                  <div className="email-future-integration">
                    <button 
                      className="btn btn-secondary" 
                      disabled 
                      style={{ width: '100%' }}
                      title="Coming Soon"
                    >
                      Send Interview Email
                    </button>
                    <div className="prep-notice">
                      <Info size={14} />
                      <span>Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Scheduler Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={isSchedulerOpen}
          onClose={() => setIsSchedulerOpen(false)}
          title={`Schedule Interview - ${selectedCandidate.candidate_name}`}
          size="md"
        >
          <form onSubmit={submitSchedule} className="scheduler-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Candidate Name</label>
                <input type="text" className="input-field" value={selectedCandidate.candidate_name} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label>Candidate Email</label>
                <input type="text" className="input-field" value={selectedCandidate.email} disabled />
              </div>
            </div>

            <div className="form-row flex-cols">
              <div className="form-group flex-1">
                <label>Interview Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={scheduleDate} 
                  onChange={(e) => setScheduleDate(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label>Interview Time</label>
                <input 
                  type="time" 
                  className="input-field" 
                  value={scheduleTime} 
                  onChange={(e) => setScheduleTime(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="form-row flex-cols">
              <div className="form-group flex-1">
                <label>Meeting Type</label>
                <select 
                  className="input-field select-field" 
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label>Interviewer Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Sarah Jenkins"
                  value={interviewer} 
                  onChange={(e) => setInterviewer(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea 
                className="input-field" 
                rows={3} 
                placeholder="Additional instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {isSchedulingInProgress && (
              <p className="scheduling-wait-indicator">Saving Interview Schedule...</p>
            )}

            <div className="button-group">
              <button type="button" className="btn btn-secondary" onClick={() => setIsSchedulerOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSchedulingInProgress}>
                {isSchedulingInProgress ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        .candidates-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .filters-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          align-items: center;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .score-range {
          height: 6px;
          border-radius: 3px;
          background: var(--border-color);
          outline: none;
          accent-color: var(--primary);
        }

        .select-field {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 36px;
        }

        .bulk-actions-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
        }

        .bulk-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .selected-count {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .refreshing-tag {
          font-size: 0.8rem;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .sync-pulse {
          width: 8px;
          height: 8px;
          background-color: var(--primary);
          border-radius: 50%;
          animation: pulse 1s infinite alternate;
        }

        .bulk-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-sm {
          padding: 8px 14px;
          font-size: 0.8rem;
          border-radius: 8px;
        }

        .table-wrapper {
          padding: 0;
          overflow-x: auto;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .results-table th, .results-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.88rem;
        }

        .results-table th {
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          font-weight: 600;
          user-select: none;
        }

        .sortable-header {
          cursor: pointer;
        }

        .sortable-header svg {
          margin-left: 6px;
          vertical-align: middle;
          display: inline-block;
        }

        .results-table tbody tr {
          transition: background-color var(--transition-fast);
        }

        .results-table tbody tr:hover {
          background-color: var(--bg-primary);
        }

        .results-table tbody tr.row-selected {
          background-color: var(--primary-light);
        }

        .candidate-cell {
          display: flex;
          flex-direction: column;
        }

        .candidate-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .candidate-email {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .score-badge {
          display: inline-block;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .score-badge.high { color: var(--success); background-color: var(--success-light); }
        .score-badge.med { color: var(--warning); background-color: var(--warning-light); }
        .score-badge.low { color: var(--danger); background-color: var(--danger-light); }

        .strengths-text {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
          color: var(--text-secondary);
        }

        .interview-status {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
        }

        .interview-status.pending { color: var(--text-muted); background-color: var(--bg-tertiary); }
        .interview-status.scheduled { color: var(--primary); background-color: var(--primary-light); }
        .interview-status.completed { color: var(--success); background-color: var(--success-light); }
        .interview-status.cancelled { color: var(--danger); background-color: var(--danger-light); }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          background: none;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-icon:hover {
          background-color: var(--bg-tertiary);
          color: var(--primary);
          border-color: var(--primary);
        }

        .btn-icon.schedule:hover {
          color: var(--success);
          border-color: var(--success);
        }

        .empty-state {
          text-align: center;
          padding: 60px 24px;
        }

        .empty-icon {
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.1rem;
          margin-bottom: 6px;
        }

        .empty-state p {
          color: var(--text-muted);
          font-size: 0.88rem;
        }

        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }

        .page-indicator {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Details Modal styling */
        .details-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .details-header-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background-color: var(--bg-tertiary);
          border-radius: var(--card-radius);
          border: 1px solid var(--border-color);
        }

        .email-display {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .details-score-box {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .score-num {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--primary);
        }

        .details-score-box span:last-child {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .details-card-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--card-radius);
          padding: 16px;
        }

        .section-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .section-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .section-text.italic {
          font-style: italic;
        }

        .email-prep-card {
          display: flex;
          flex-direction: column;
        }

        .email-future-integration {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .prep-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--btn-radius);
          padding: 12px;
          color: var(--text-secondary);
        }

        .prep-notice span {
          font-size: 0.78rem;
          font-weight: 500;
        }

        /* Form Layout for modal scheduler */
        .scheduler-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-row.flex-cols {
          flex-direction: row;
        }

        .flex-1 {
          flex: 1;
        }

        .scheduling-wait-indicator {
          font-size: 0.82rem;
          color: var(--primary);
          font-weight: 600;
          text-align: center;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1; }
        }

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
          .form-row.flex-cols {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};
