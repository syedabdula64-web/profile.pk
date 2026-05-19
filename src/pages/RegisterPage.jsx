import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AtSign, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPages.css';
import ProfileLogo from '../components/ProfileLogo';
import ConfirmationModal from '../components/ConfirmationModal';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({
      ...p,
      [name]: name === 'username' ? value.toLowerCase().replace(/[^a-z0-9_]/g, '') : value
    }));
  };

  const validateForm = () => {
    if (!form.name || !form.username || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return false;
    }
    if (form.username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return false;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      toast.error('Password must contain uppercase, lowercase, and a number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Create Your Account?',
      message: `Please confirm your registration details for ${form.email}. You will be able to customize your profile after registration.`,
      confirmText: 'Create Account',
      onConfirm: async () => {
        setLoading(true);
        try {
          await register(form.name, form.username, form.email, form.password);
          toast.success('Account created! Welcome to Profile.pk 🎉');
          navigate('/dashboard');
          setConfirmModal({ isOpen: false });
        } catch (err) {
          toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
          setConfirmModal({ isOpen: false });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getPasswordStrength = () => {
    const p = form.password;
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
        <Link to="/" style={{ textDecoration: 'none' }}>
          <ProfileLogo size='sm' />
        </Link>
        
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Build your premium digital identity — free</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <User className="input-icon" size={18} />
              <input
                id="reg-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="Your Full Name"
                value={form.name}
                onChange={handleChange}
                required
                title="Enter your full legal name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="username-input-wrap">
              <span className="username-prefix">profile.pk/p/</span>
              <input
                id="reg-username"
                type="text"
                name="username"
                className="form-input username-input"
                placeholder="your_username"
                value={form.username}
                onChange={handleChange}
                minLength={3}
                maxLength={30}
                required
                title="Only letters, numbers, and underscores"
              />
            </div>
            <span className="form-hint">Only letters, numbers, underscores (3-30 chars)</span>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="ahad@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                title="Enter your email address"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-password-wrap">
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Min 8 chars, uppercase, number"
                value={form.password}
                onChange={handleChange}
                required
                title="Create a strong password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPass(p => !p)}
                aria-label="Toggle password"
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

          <button
            id="reg-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            title="Create your new account"
          >
            {loading ? <>Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link" title="Sign in to existing account">Sign In</Link>
          </p>
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