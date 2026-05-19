import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Lock, AlertCircle, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPages.css';
import ProfileLogo from '../components/ProfileLogo';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Authorization keys do not match.');
      return;
    }
    if (password.length < 8) {
      setError('New key must be at least 8 characters.');
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      title: 'Update Your Password?',
      message: 'You will need to login with your new password after this change.',
      confirmText: 'Update Password',
      onConfirm: async () => {
        setLoading(true);
        setError('');

        try {
          await api.put(`/auth/resetpassword/${token}`, { password });
          toast.success('Access credentials updated.');
          navigate('/login');
          setConfirmModal({ isOpen: false });
        } catch (err) {
          setError(err.response?.data?.message || 'Invalid or expired authorization token.');
          toast.error('Identity update failed.');
          setConfirmModal({ isOpen: false });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getPasswordStrength = () => {
    const p = password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#10b981'];

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
          <h1 className="auth-title">Update Credentials</h1>
          <p className="auth-subtitle">Establish a new secure authorization key for your ecosystem.</p>
        </div>

        {error && (
          <div className="overview-tip" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', marginTop: '0', marginBottom: '24px' }}>
            <span style={{ borderLeft: '4px solid var(--error)' }}></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}>
              <AlertCircle size={16} /> {error}
            </span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Authorization Key</label>
            <div className="input-password-wrap">
              <Lock className="input-icon" size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showPass ? 'text' : 'password'} 
                className="form-input"
                style={{ paddingLeft: '44px' }}
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                title="Enter your new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPass(p => !p)}
                aria-label="Toggle password visibility"
                title={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {strength !== null && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div
                      key={n}
                      className="strength-bar"
                      style={{ background: n <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.08)' }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthColors[strength] }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm Authorization Key</label>
            <div className="input-password-wrap">
              <ShieldCheck className="input-icon" size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showConfirmPass ? 'text' : 'password'} 
                className="form-input"
                style={{ paddingLeft: '44px' }}
                required 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                title="Confirm your new password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPass(p => !p)}
                aria-label="Toggle password visibility"
                title={showConfirmPass ? "Hide password" : "Show password"}
              >
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading}
            title="Set new password"
          >
            <KeyRound size={18} /> {loading ? 'Updating Credentials...' : 'Set New Authorization Key'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '32px' }}>
          <Link to="/login" className="auth-link" title="Back to login">
            Return to Authorization
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