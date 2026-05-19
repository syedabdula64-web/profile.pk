import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  type = 'danger',
  isLoading = false 
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={isLoading ? null : onClose}>
      <div className="modal-content reveal" style={{ maxWidth: '400px', padding: '40px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        {!isLoading && (
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        )}

        <div style={{ 
          width: '72px', 
          height: '72px', 
          borderRadius: '24px', 
          background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 28px',
          color: type === 'danger' ? '#ef4444' : 'var(--accent)',
          border: `1px solid ${type === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-accent)'}`
        }}>
          {isLoading ? <Loader2 size={32} className="spinner" /> : <AlertTriangle size={32} />}
        </div>

        <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.5px' }}>{title}</h3>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '36px' }}>{message}</p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading} style={{ flex: 1 }}>
            Dismiss
          </button>
          <button 
            className="btn" 
            onClick={onConfirm} 
            disabled={isLoading}
            style={{ 
              flex: 1.5, 
              background: type === 'danger' ? '#ef4444' : 'var(--accent)',
              color: type === 'danger' ? '#fff' : '#000',
              fontWeight: '800'
            }}
          >
            {isLoading ? 'Processing...' : (confirmText || 'Authorize')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
