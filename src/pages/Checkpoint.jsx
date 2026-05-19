import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Checkpoint() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is blocked or suspended
    api.get('/auth/me').then(({ data }) => {
      if (data.success) {
        setUser(data.user);
        if (data.user.status === 'active') {
          navigate('/dashboard');
        } else if (data.user.status === 'suspended' || data.user.isVerified) {
          setStep(2); // Skip email verification if suspended or already verified
        }
      }
    }).catch(() => {
      navigate('/login');
    });
  }, [navigate]);

  const handleSendVerification = async () => {
    setLoading(true);
    try {
      await api.post('/auth/send-verification');
      toast.success('Verification code sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) return toast.error('Please enter the code');
    setLoading(true);
    try {
      await api.post('/auth/verify-email', { code });
      toast.success('Email verified!');
      // If user was just blocked due to verification, they might be unblocked now
      const { data } = await api.get('/auth/me');
      if (data.user.status === 'active') {
        navigate('/dashboard');
      } else {
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    if (!note) return toast.error('Please provide an appeal note');
    setLoading(true);
    try {
      await api.post('/auth/submit-appeal', { note });
      toast.success('Appeal submitted successfully');
      // Refresh user state
      setUser(prev => ({ ...prev, status: 'pending_review' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit appeal');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ppk_token');
    localStorage.removeItem('ppk_user');
    window.location.href = '/login';
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );

  // Helper function to get status details
  const getStatusDetails = () => {
    switch(user.status) {
      case 'suspended':
        return {
          icon: '🚫',
          title: 'Account Suspended',
          message: `Your account was suspended due to a policy violation: ${user.suspensionReason || 'Content Review'}`
        };
      case 'pending_review':
        return {
          icon: '⏳',
          title: 'Account Under Review',
          message: 'Your account is currently under review by our moderation team. This usually takes 1-2 days.'
        };
      default:
        return {
          icon: '🔒',
          title: 'Account Blocked',
          message: 'Your account was blocked because your email was not verified within 24 hours.'
        };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
      <div style={{ 
        background: 'var(--bg-card)', 
        padding: '40px', 
        borderRadius: '24px', 
        maxWidth: '500px', 
        width: '100%', 
        border: '1px solid var(--border-subtle)', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {statusDetails.icon}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {statusDetails.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            {statusDetails.message}
          </p>
        </div>

        {user.status === 'pending_review' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              padding: '20px', 
              background: 'rgba(0, 0, 0, 0.1)', 
              border: '1px solid var(--border-accent)', 
              borderRadius: '12px', 
              color: 'var(--accent)', 
              fontSize: '14px', 
              marginBottom: '24px' 
            }}>
              Your appeal has been received. We will notify you via email once the review is complete.
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ width: '100%', cursor: 'pointer' }}
              title="Sign out from your account"
            >
              Sign Out
            </button>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleVerify}>
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Step 1: Verify your email address <strong style={{ color: 'var(--accent)' }}>{user.email}</strong>
              </p>
              <button 
                type="button" 
                onClick={handleSendVerification} 
                className="btn btn-secondary" 
                style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
                disabled={loading}
                title="Send verification code to your email"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>6-Digit Verification Code</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter 6-digit code" 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                required 
                maxLength={6}
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }}
                title="Enter the 6-digit verification code sent to your email"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}
              disabled={loading}
              title="Verify your email address"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button 
              type="button" 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '12px', cursor: 'pointer' }}
              title="Sign out from your account"
            >
              Sign Out
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitAppeal}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center' }}>
                {user.status === 'suspended' ? 'Submit an appeal to have your account reinstated.' : 'Step 2: Submit a request to unblock your account.'}
              </p>
              <div className="form-group">
                <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Appeal Note</label>
                <textarea
                  className="form-input"
                  rows="5"
                  placeholder="Explain why your account should be restored..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  required
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  title="Provide detailed explanation for your appeal"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer' }}
              disabled={loading}
              title="Submit your appeal for review"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button 
              type="button" 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '12px', cursor: 'pointer' }}
              title="Sign out from your account"
            >
              Sign Out
            </button>
          </form>
        )}

      </div>
    </div>
  );
}