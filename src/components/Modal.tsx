import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-container glass-card modal-${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
          animation: fadeInOverlay var(--transition-fast) forwards;
        }

        .modal-container {
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          animation: modalSlideUp var(--transition-normal) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .modal-sm { max-width: 480px; }
        .modal-md { max-width: 640px; }
        .modal-lg { max-width: 800px; }
        .modal-xl { max-width: 1024px; }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .modal-close:hover {
          background-color: var(--bg-tertiary);
          color: var(--danger);
        }

        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 576px) {
          .modal-overlay {
            padding: 12px;
          }
          .modal-container {
            max-height: 95vh;
          }
          .modal-body {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};
