import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Trash2, AlertTriangle, Key, Save } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function DashSettings() {
  const { user, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState({ isPublic: true });
  const [loading, setLoading] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  useEffect(() => {
    api.get('/profile').then(({ data }) => setProfile({ isPublic: data.profile.isPublic }));
  }, []);

  const toggleVisibility = async (e) => {
    const isPublic = e.target.checked;
    setLoading(true);
    try {
      await api.put('/profile/visibility', { isPublic });
      setProfile({ isPublic });
      toast.success(isPublic ? 'Ecosystem is now Public' : 'Ecosystem is now Private');
    } catch (error) {
      toast.error('Failed to update visibility status');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword) {
      return toast.error('Fill all mandatory authorization fields.');
    }
    if (passForm.newPassword.length < 8) {
      return toast.error('New authorization key must be at least 8 characters.');
    }

    setLoading(true);
    try {
      await api.put('/user/password', passForm);
      toast.success('Authorization key updated successfully.');
      setPassForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authorization update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateAccount = async () => {
    setLoading(true);
    try {
      // In a real environment, this would call the DELETE endpoint
      // await api.delete('/user/account');
      toast.error('Account termination is restricted in laboratory environment.');
      setConfirmDeleteModal(false);
    } catch (error) {
      toast.error('Failed to terminate account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-page" style={{ pointerEvents: 'auto' }}>
      <div className="dash-page-header">
        <h1 className="dash-page-title">Configuration</h1>
        <p className="dash-page-subtitle">Manage your account security and ecosystem privacy preferences.</p>
      </div>

      {/* Privacy Controls */}
      <div className="dash-section reveal">
        <div className="dash-section-title">
          <Shield size={18} style={{ color: 'var(--accent)' }} />
          Privacy Controls
        </div>
        <div className="item-card toggle-row" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)', padding: '24px' }}>
          <div className="toggle-info">
            <div className="toggle-label" style={{ fontSize: '16px', fontWeight: '800' }}>Public Ecosystem Visibility</div>
            <div className="toggle-desc" style={{ marginTop: '4px' }}>Toggle whether your profile is discoverable via your unique URL.</div>
          </div>
          <label className="toggle-switch" title={profile.isPublic ? "Click to make profile private" : "Click to make profile public"}>
            <input 
              type="checkbox" 
              checked={profile.isPublic} 
              onChange={toggleVisibility}
              disabled={loading}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Security Credentials */}
      <div className="dash-section reveal" style={{ animationDelay: '0.1s' }}>
        <div className="dash-section-title">
          <Lock size={18} style={{ color: 'var(--accent)' }} />
          Security Credentials
        </div>
        <form onSubmit={handlePasswordChange} className="settings-pass-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '440px', background: 'var(--surface-muted)', padding: '32px', border: '1px solid var(--border-subtle)', borderRadius: '24px' }}>
          <div className="form-group">
            <label className="form-label">Current Authorization Key</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm({...passForm, currentPassword: e.target.value})}
              title="Enter your current password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Authorization Key</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Min. 8 characters"
              value={passForm.newPassword}
              onChange={(e) => setPassForm({...passForm, newPassword: e.target.value})}
              title="Enter a new password (minimum 8 characters)"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading} 
            style={{ alignSelf: 'flex-start', cursor: loading ? 'not-allowed' : 'pointer' }}
            title={loading ? "Processing..." : "Update your account password"}
          >
            <Key size={16} /> {loading ? 'Synchronizing...' : 'Update Authorization Key'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="dash-section reveal danger-zone" style={{ animationDelay: '0.2s', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '32px' }}>
        <div className="dash-section-title" style={{ color: '#ef4444' }}>
          <AlertTriangle size={18} />
          Critical Actions
        </div>
        <div className="overview-tip" style={{ border: '1px solid rgba(239, 68, 68, 0.15)', background: 'rgba(239, 68, 68, 0.02)', marginTop: '0', marginBottom: '24px' }}>
          <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
          <span>
            <strong style={{ color: '#ef4444' }}>Permanent Deletion</strong><br />
            Deleting your account is an irreversible action. All profile data, financial credentials, and social connections will be purged immediately.
          </span>
        </div>
        <button 
          className="btn btn-danger" 
          onClick={() => setConfirmDeleteModal(true)} 
          disabled={loading}
          style={{ 
            cursor: loading ? 'not-allowed' : 'pointer',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          title="Permanently delete your account and all associated data"
        >
          <Trash2 size={16} /> {loading ? 'Terminating...' : 'Terminate Digital Identity'}
        </button>
      </div>

      <ConfirmationModal
        isOpen={confirmDeleteModal}
        onClose={() => setConfirmDeleteModal(false)}
        onConfirm={handleTerminateAccount}
        title="Permanently Terminate Identity?"
        message="This action will delete your account and all associated data across the Profile.pk ecosystem. This process cannot be reversed. Are you absolutely certain?"
        confirmText="Terminate Account"
        type="danger"
      />
    </div>
  );
}