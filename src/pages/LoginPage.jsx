import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPages.css';
import ProfileLogo from '../components/ProfileLogo';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.status === 'blocked' || err.response?.data?.status === 'suspended') {
        const { token, user } = err.response.data;
        localStorage.setItem('ppk_token', token);
        localStorage.setItem('ppk_user', JSON.stringify(user));
        toast.error(err.response.data.message);
        window.location.href = '/checkpoint';
      } else {
        toast.error(err.response?.data?.message || 'Login failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="ahad@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                title="Enter your registered email address"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-password-wrap">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                title="Enter your password"
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
          </div>

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '13px', textDecoration: 'none' }} title="Forgot your password?">
              Forgot Password?
            </Link>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            title="Sign in to your account"
          >
            {loading ? <>Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link" title="Create a new account">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}