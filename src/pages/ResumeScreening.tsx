import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UploadCloud, FileText, Trash2, Play, RefreshCw } from 'lucide-react';

interface ResumeScreeningProps {
  addToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ResumeScreening: React.FC<ResumeScreeningProps> = ({ addToast }) => {
  const { triggerScreening, setActiveTab } = useApp();
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [screeningStatus, setScreeningStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const pdfs = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
      if (pdfs.length < e.dataTransfer.files.length) {
        addToast('Invalid file format', 'Only PDF files are supported for resume screening.', 'error');
      }
      if (pdfs.length > 0) {
        setFiles(prev => [...prev, ...pdfs]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const pdfs = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      setFiles(prev => [...prev, ...pdfs]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const clearForm = () => {
    setJobTitle('');
    setJobDesc('');
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    addToast('Form Cleared', 'Screening inputs cleared.', 'info');
  };

  const startScreening = async () => {
    if (!jobTitle.trim()) {
      addToast('Missing Job Title', 'Please enter a valid Job Title.', 'error');
      return;
    }
    if (!jobDesc.trim()) {
      addToast('Missing Job Description', 'Please fill in the Job Description.', 'error');
      return;
    }
    if (files.length === 0) {
      addToast('No Resumes Uploaded', 'Please upload at least one candidate resume PDF.', 'error');
      return;
    }

    setIsScreening(true);
    setScreeningStatus('Uploading resumes...');

    try {
      await triggerScreening(jobTitle, jobDesc, files, (msg) => {
        setScreeningStatus(msg);
      });
      
      addToast('Resume Screening Completed', 'Candidates parsed successfully.', 'success');
      addToast('Candidates Updated', 'Live data list updated.', 'success');
      
      setTimeout(() => {
        setActiveTab('candidates');
      }, 1000);
    } catch (err) {
      addToast('Screening Failed', 'There was an error communicating with n8n backend.', 'error');
    } finally {
      setIsScreening(false);
    }
  };

  return (
    <div className="screening-page animate-fade-in">
      <div className="page-header">
        <h1>AI Resume Screening</h1>
        <p>Screen hundreds of resumes instantly against custom job definitions.</p>
      </div>

      <div className="screening-layout">
        {/* Form panel */}
        <div className="form-panel glass-card">
          <div className="form-group">
            <label htmlFor="job-title">Job Title</label>
            <input
              id="job-title"
              type="text"
              className="input-field"
              placeholder="e.g. Senior Backend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={isScreening}
            />
          </div>

          <div className="form-group">
            <label htmlFor="job-desc">Job Description & Requirements</label>
            <textarea
              id="job-desc"
              className="input-field rich-text-area"
              rows={8}
              placeholder="Paste job details, key skills, years of experience, and responsibilities here..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              disabled={isScreening}
            />
          </div>

          <div className="button-group">
            <button 
              className="btn btn-secondary" 
              onClick={clearForm}
              disabled={isScreening}
            >
              Clear
            </button>
            <button 
              className="btn btn-primary" 
              onClick={startScreening}
              disabled={isScreening}
            >
              {isScreening ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
              Start AI Screening
            </button>
          </div>
        </div>

        {/* Upload panel */}
        <div className="upload-panel glass-card">
          <label>Upload Resumes (Multiple PDFs)</label>
          <div
            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isScreening && fileInputRef.current?.click()}
          >
            <input
              type="file"
              multiple
              accept=".pdf"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileSelect}
              disabled={isScreening}
            />
            <UploadCloud size={48} className="upload-icon" />
            <h3>Drag & Drop files here</h3>
            <p>or click to browse your local device (PDF only)</p>
          </div>

          {/* Selected File list */}
          {files.length > 0 && (
            <div className="file-list-container">
              <h4>Files Queue ({files.length})</h4>
              <div className="file-list">
                {files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <FileText size={16} className="pdf-icon" />
                    <span className="file-name" title={file.name}>{file.name}</span>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      disabled={isScreening}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screening Progress Overlay */}
          {isScreening && (
            <div className="progress-overlay glass-card">
              <div className="progress-content">
                <RefreshCw className="animate-spin progress-spinner" size={32} />
                <h3>Analyzing Candidate Resumes...</h3>
                <p style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary)' }}>{screeningStatus}</p>
                <p className="wait-message">Please wait...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .screening-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header h1 {
          font-size: 1.6rem;
        }

        .page-header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .screening-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .form-panel, .upload-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label, .upload-panel label {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .rich-text-area {
          resize: vertical;
          font-family: inherit;
        }

        .button-group {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .upload-zone {
          border: 2px dashed var(--border-color);
          background-color: var(--bg-tertiary);
          border-radius: var(--card-radius);
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-normal);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .upload-zone.dragging, .upload-zone:hover {
          border-color: var(--primary);
          background-color: var(--primary-light);
        }

        .upload-icon {
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .upload-zone:hover .upload-icon {
          color: var(--primary);
        }

        .upload-zone h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .upload-zone p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .file-list-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .file-list-container h4 {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .file-list {
          max-height: 180px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--btn-radius);
        }

        .pdf-icon {
          color: var(--danger);
          flex-shrink: 0;
        }

        .file-name {
          flex: 1;
          font-size: 0.85rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .remove-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .remove-btn:hover {
          color: var(--danger);
        }

        /* Progress Overlay styling */
        .progress-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        [data-theme="dark"] .progress-overlay {
          background-color: rgba(17, 24, 39, 0.85);
        }

        .progress-content {
          width: 80%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .progress-spinner {
          color: var(--primary);
        }

        .wait-message {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 992px) {
          .screening-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
