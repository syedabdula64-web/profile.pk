import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPages.css';
import ProfileLogo from '../components/ProfileLogo';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');
    
    setConfirmModal({
      isOpen: true,
      title: 'Initialize Account Recovery?',
      message: `A password reset link will be sent to ${email}. This link will expire in 1 hour.`,
      confirmText: 'Send Recovery Link',
      onConfirm: async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
          const { data } = await api.post('/auth/forgotpassword', { email });
          setSuccess(data.message || 'If an account exists with this email, you will receive a reset link shortly.');
          toast.success('Security protocol initialized.');
          setConfirmModal({ isOpen: false });
        } catch (err) {
          setError(err.response?.data?.message || 'Authorization server timeout. Please retry.');
          toast.error('Identity recovery failed.');
          setConfirmModal({ isOpen: false });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orbs">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-container animate-scale-in">
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '24px' }}>
          <ProfileLogo size='sm' />
        </Link>
        
        <div className="auth-header">
          <h1 className="auth-title">Account Recovery</h1>
          <p className="auth-subtitle">Regain access to your premium digital ecosystem.</p>
        </div>

        {error && (
          <div className="overview-tip" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', marginTop: '0', marginBottom: '24px' }}>
            <span style={{ borderLeft: '4px solid var(--error)' }}></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}>
              <AlertCircle size={16} /> {error}
            </span>
          </div>
        )}

        {success ? (
          <div className="reveal">
            <div className="overview-tip" style={{ marginTop: '0', marginBottom: '32px' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--accent)' }} />
              <span>
                <strong>Verification Sent</strong>
                {success}
              </span>
            </div>
            <Link to="/login" className="btn btn-primary btn-full" title="Return to login page">
              Return to Login
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Identifier</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  className="form-input"
                  required 
                  placeholder="ahad@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  title="Enter your registered email address"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full" 
              disabled={loading}
              title="Send password reset link to your email"
            >
              {loading ? <>Processing Recovery...</> : 'Dispatch Recovery Link'}
            </button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '32px' }}>
          <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} title="Back to login">
            <ArrowLeft size={16} /> Back to Authorization
          </Link>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type="success"
      />
    </div>
  );
}