import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' 
          ? CheckCircle2 
          : toast.type === 'error' 
            ? AlertCircle 
            : Info;
            
        return (
          <div key={toast.id} className={`toast-card toast-${toast.type} glass-card`}>
            <Icon className="toast-icon" size={20} />
            <div className="toast-content">
              <h4>{toast.title}</h4>
              {toast.description && <p>{toast.description}</p>}
            </div>
            <button className="toast-close" onClick={() => onClose(toast.id)}>
              <X size={16} />
            </button>
          </div>
        );
      })}

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
          max-width: 380px;
          width: 100%;
        }

        .toast-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          border-radius: var(--btn-radius);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          animation: toastSlideIn var(--transition-normal) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
        }

        .toast-content {
          flex: 1;
        }

        .toast-content h4 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 2px;
          color: var(--text-primary);
        }

        .toast-content p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .toast-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .toast-success .toast-icon { color: var(--success); }
        .toast-error .toast-icon { color: var(--danger); }
        .toast-info .toast-icon { color: var(--primary); }

        .toast-success { border-left: 4px solid var(--success); }
        .toast-error { border-left: 4px solid var(--danger); }
        .toast-info { border-left: 4px solid var(--primary); }

        .toast-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .toast-close:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
