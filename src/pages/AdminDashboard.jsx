import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Routes, Route, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';
import NotificationDropdown from '../components/NotificationDropdown';
import ConfirmationModal from '../components/ConfirmationModal';
import './AdminDashboard.css';

// ─── Sub-pages ──────────────────────────────────────────────
function AdminOverview() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => { if (data.success) setStats(data.stats); });
  }, []);
  return (
    <div className="adash-page">
      <div className="adash-page-header">
        <h1 className="adash-page-title">Platform Overview</h1>
        <p className="adash-page-subtitle">Real-time stats across all users</p>
      </div>
      <div className="adash-stats-grid">
        {[
          { label: 'Total Users', value: stats?.total ?? '…', icon: '👥', color: '#c9a84c' },
          { label: 'Active', value: stats?.active ?? '…', icon: '✅', color: '#22c55e' },
          { label: 'Blocked', value: stats?.blocked ?? '…', icon: '🔒', color: '#ef4444' },
          { label: 'Suspended', value: stats?.suspended ?? '…', icon: '🚫', color: '#f97316' },
          { label: 'Pending Review', value: stats?.pending ?? '…', icon: '⏳', color: '#a855f7' },
        ].map(s => (
          <div key={s.label} className="adash-stat-card" title={`${s.label}: ${s.value}`}>
            <div className="adash-stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="adash-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="adash-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null, action: '', status: '', reason: '' });
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/users?${params}`);
      if (data.success) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleStatus = async (userId, status, reason = '') => {
    try {
      const { data } = await api.put(`/admin/user/${userId}/status`, { status, reason });
      if (data.success) {
        toast.success(`Status updated to ${status}`);
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, status } : u));
        setConfirmModal({ isOpen: false, userId: null, action: '', status: '', reason: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (userId) => {
    try {
      const { data } = await api.delete(`/admin/user/${userId}`);
      if (data.success) {
        toast.success('User deleted permanently');
        setUsers(prev => prev.filter(u => u._id !== userId));
        setConfirmModal({ isOpen: false, userId: null, action: '', status: '', reason: '' });
      }
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const openConfirmModal = (userId, action, status, reason = '') => {
    setConfirmModal({ isOpen: true, userId, action, status, reason });
  };

  const statusColors = { active: '#22c55e', blocked: '#ef4444', suspended: '#f97316', pending_review: '#a855f7' };
  const statusLabels = { active: 'Active', blocked: 'Blocked', suspended: 'Suspended', pending_review: 'Pending Review' };

  return (
    <div className="adash-page">
      <div className="adash-page-header">
        <h1 className="adash-page-title">User Directory</h1>
        <p className="adash-page-subtitle">{users.length} users found</p>
      </div>

      <div className="adash-filter-bar">
        <input 
          className="adash-search" 
          placeholder="Search by name, username, email…" 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          title="Search users by name, username or email"
        />
        <select 
          className="adash-select" 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          title="Filter users by status"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="suspended">Suspended</option>
          <option value="pending_review">Pending Review</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}><div className="spinner" /></div>
      ) : (
        <div className="adash-user-table">
          <div className="adash-table-header">
            <span>User</span><span>Username</span><span>Status</span><span>Joined</span><span>Actions</span>
          </div>
          {users.map(u => (
            <div key={u._id} className="adash-table-row">
              <div className="adash-user-cell">
                <div className="adash-user-avatar">{u.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="adash-user-name">{u.name}</div>
                  <div className="adash-user-email">{u.email}</div>
                </div>
              </div>
              <div>@{u.username}</div>
              <div>
                <span className="adash-badge" style={{ background: statusColors[u.status] + '22', color: statusColors[u.status], border: `1px solid ${statusColors[u.status]}44` }}>
                  {statusLabels[u.status] || u.status || 'Active'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</div>
              <div className="adash-row-actions">
                <button 
                  className="adash-btn-sm adash-btn-view" 
                  onClick={() => navigate(`/admin/user/${u._id}`)}
                  title="View user details"
                >
                  View
                </button>
                {u.status !== 'active' && (
                  <button 
                    className="adash-btn-sm adash-btn-success" 
                    onClick={() => openConfirmModal(u._id, 'unblock', 'active')}
                    title="Restore this user's account"
                  >
                    Unblock
                  </button>
                )}
                {u.status === 'active' && (
                  <button 
                    className="adash-btn-sm adash-btn-warn" 
                    onClick={() => openConfirmModal(u._id, 'suspend', 'suspended', 'Admin manual suspension')}
                    title="Suspend this user's account"
                  >
                    Suspend
                  </button>
                )}
                <button 
                  className="adash-btn-sm adash-btn-danger" 
                  onClick={() => openConfirmModal(u._id, 'delete', 'delete')}
                  title="Permanently delete this user"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!users.length && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No users found.</div>}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null, action: '', status: '', reason: '' })}
        onConfirm={() => {
          if (confirmModal.action === 'delete') handleDelete(confirmModal.userId);
          else handleStatus(confirmModal.userId, confirmModal.status, confirmModal.reason);
        }}
        title={confirmModal.action === 'delete' ? 'Delete User Permanently?' : confirmModal.action === 'suspend' ? 'Suspend User Account?' : 'Restore User Account?'}
        message={confirmModal.action === 'delete' 
          ? 'This action will permanently delete the user and all their data. This cannot be undone.' 
          : confirmModal.action === 'suspend'
            ? 'This will suspend the user account. They will not be able to access their profile until restored.'
            : 'This will restore the user account to active status.'}
        confirmText={confirmModal.action === 'delete' ? 'Delete' : confirmModal.action === 'suspend' ? 'Suspend' : 'Restore'}
        type={confirmModal.action === 'delete' ? 'danger' : confirmModal.action === 'suspend' ? 'danger' : 'success'}
      />
    </div>
  );
}

function AdminUserDetail() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, status: '', reason: '' });
  const navigate = useNavigate();
  const id = window.location.pathname.split('/').pop();

  useEffect(() => {
    api.get(`/admin/user/${id}`).then(({ data }) => { if (data.success) setData(data); setLoading(false); });
  }, [id]);

  const handleStatus = async (status, reason = '') => {
    try {
      const res = await api.put(`/admin/user/${id}/status`, { status, reason });
      if (res.data.success) {
        toast.success(`Status updated to ${status}`);
        setData(prev => ({ ...prev, user: { ...prev.user, status } }));
        setConfirmModal({ isOpen: false, status: '', reason: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const openConfirmModal = (status, reason = '') => {
    setConfirmModal({ isOpen: true, status, reason });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>User not found.</div>;

  const { user, profile } = data;
  const statusColors = { active: '#22c55e', blocked: '#ef4444', suspended: '#f97316', pending_review: '#a855f7' };
  const statusLabels = { active: 'Active', blocked: 'Blocked', suspended: 'Suspended', pending_review: 'Pending Review' };

  return (
    <div className="adash-page">
      <button className="adash-back-btn" onClick={() => navigate('/admin/users')} title="Back to users list">← Back to Users</button>
      <div className="adash-user-detail-header">
        <div className="adash-user-detail-avatar">{user.name?.[0]?.toUpperCase()}</div>
        <div>
          <h1 className="adash-page-title" style={{ marginBottom: '4px' }}>{user.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>@{user.username} · {user.email}</p>
          <span className="adash-badge" style={{ background: (statusColors[user.status] || '#22c55e') + '22', color: statusColors[user.status] || '#22c55e', border: `1px solid ${(statusColors[user.status] || '#22c55e')}44` }}>
            {statusLabels[user.status] || user.status || 'Active'}
          </span>
        </div>
      </div>

      <div className="adash-detail-grid">
        <div className="adash-detail-section">
          <h3>Account Info</h3>
          <div className="adash-detail-row"><span>Verified</span><span>{user.isVerified ? '✅ Yes' : '❌ No'}</span></div>
          <div className="adash-detail-row"><span>Joined</span><span>{new Date(user.createdAt).toLocaleString()}</span></div>
          <div className="adash-detail-row"><span>Last Login</span><span>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</span></div>
          <div className="adash-detail-row"><span>Suspension Reason</span><span>{user.suspensionReason || '—'}</span></div>
          <div className="adash-detail-row"><span>Appeal Note</span><span>{user.appealNote || '—'}</span></div>
        </div>

        <div className="adash-detail-section">
          <h3>Profile Data</h3>
          <div className="adash-detail-row"><span>Bio</span><span>{profile?.bio || '—'}</span></div>
          <div className="adash-detail-row"><span>Location</span><span>{profile?.location || '—'}</span></div>
          <div className="adash-detail-row"><span>Social Links</span><span>{profile?.socialLinks?.length || 0}</span></div>
          <div className="adash-detail-row"><span>Bank Accounts</span><span>{profile?.bankAccounts?.length || 0}</span></div>
        </div>
      </div>

      <div className="adash-detail-actions">
        <h3>Admin Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {user.status !== 'active' && (
            <button className="adash-action-btn adash-btn-success" onClick={() => openConfirmModal('active')} title="Restore this user's account">
              ✅ Restore Account
            </button>
          )}
          {user.status !== 'suspended' && (
            <button className="adash-action-btn adash-btn-warn" onClick={() => openConfirmModal('suspended', 'Manual Admin Suspension')} title="Suspend this user's account">
              🚫 Suspend Account
            </button>
          )}
          {user.status !== 'blocked' && (
            <button className="adash-action-btn adash-btn-danger" onClick={() => openConfirmModal('blocked', 'Manual Block')} title="Block this user's account">
              🔒 Block Account
            </button>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, status: '', reason: '' })}
        onConfirm={() => handleStatus(confirmModal.status, confirmModal.reason)}
        title={confirmModal.status === 'active' ? 'Restore User Account?' : confirmModal.status === 'suspended' ? 'Suspend User Account?' : 'Block User Account?'}
        message={confirmModal.status === 'active' 
          ? 'This will restore the user account to active status.' 
          : confirmModal.status === 'suspended'
            ? 'This will suspend the user account. They will not be able to access their profile.'
            : 'This will block the user account permanently.'}
        confirmText={confirmModal.status === 'active' ? 'Restore' : confirmModal.status === 'suspended' ? 'Suspend' : 'Block'}
        type={confirmModal.status === 'active' ? 'success' : 'danger'}
      />
    </div>
  );
}

function AdminAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, userId: null, action: '' });

  const fetchAppeals = async () => {
    setLoading(true);
    const { data } = await api.get('/admin/appeals');
    if (data.success) setAppeals(data.users);
    setLoading(false);
  };

  useEffect(() => { fetchAppeals(); }, []);

  const handleDecision = async (userId, action) => {
    const status = action === 'approve' ? 'active' : 'suspended';
    try {
      const { data } = await api.put(`/admin/user/${userId}/status`, { status });
      if (data.success) {
        toast.success(action === 'approve' ? 'Account restored!' : 'Appeal denied, account suspended.');
        fetchAppeals();
        setConfirmModal({ isOpen: false, userId: null, action: '' });
      }
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const openConfirmModal = (userId, action) => {
    setConfirmModal({ isOpen: true, userId, action });
  };

  return (
    <div className="adash-page">
      <div className="adash-page-header">
        <h1 className="adash-page-title">Review Appeals</h1>
        <p className="adash-page-subtitle">{appeals.length} pending reviews</p>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" /></div>
      ) : appeals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>🎉 No pending appeals!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {appeals.map(u => (
            <div key={u._id} className="adash-appeal-card">
              <div className="adash-appeal-user">
                <div className="adash-user-avatar">{u.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="adash-user-name">{u.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(@{u.username})</span></div>
                  <div className="adash-user-email">{u.email}</div>
                </div>
              </div>
              {u.suspensionReason && (
                <div className="adash-appeal-reason"><strong>Suspended for:</strong> {u.suspensionReason}</div>
              )}
              <div className="adash-appeal-note"><strong>User's Appeal:</strong> "{u.appealNote}"</div>
              <div className="adash-appeal-actions">
                <button 
                  className="adash-action-btn adash-btn-success" 
                  onClick={() => openConfirmModal(u._id, 'approve')}
                  title="Approve appeal and restore account"
                >
                  ✅ Approve & Restore
                </button>
                <button 
                  className="adash-action-btn adash-btn-danger" 
                  onClick={() => openConfirmModal(u._id, 'deny')}
                  title="Deny appeal and keep account suspended"
                >
                  ❌ Deny Appeal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null, action: '' })}
        onConfirm={() => handleDecision(confirmModal.userId, confirmModal.action)}
        title={confirmModal.action === 'approve' ? 'Approve User Appeal?' : 'Deny User Appeal?'}
        message={confirmModal.action === 'approve' 
          ? 'This will restore the user account to active status.' 
          : 'This will keep the account suspended. The user will be notified.'}
        confirmText={confirmModal.action === 'approve' ? 'Approve' : 'Deny'}
        type={confirmModal.action === 'approve' ? 'success' : 'danger'}
      />
    </div>
  );
}

// ─── Main Admin Dashboard Layout ────────────────────────────
const adminNavItems = [
  { path: '', label: 'Overview', icon: '📊', end: true },
  { path: 'users', label: 'Users', icon: '👥' },
  { path: 'appeals', label: 'Appeals', icon: '⚖️' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <div className="adash-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="adash-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`adash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="adash-sidebar-logo">
          <span className="adash-logo-text">Profile<span>.pk</span></span>
          <div className="adash-admin-badge">ADMIN</div>
        </div>
        <div className="adash-sidebar-user">
          <div className="adash-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--accent)' }}>Super Admin</div>
          </div>
        </div>
        <nav className="adash-nav">
          {adminNavItems.map(item => (
            <NavLink
              key={item.path}
              to={`/admin${item.path ? '/' + item.path : ''}`}
              end={item.end}
              className={({ isActive }) => `adash-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              title={item.label}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="adash-sidebar-footer">
          <button className="adash-logout-btn" onClick={handleLogout} title="Logout from admin panel">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="adash-main">
        <header className="adash-topbar">
          <button 
            className="adash-mobile-menu-btn" 
            onClick={() => setSidebarOpen(p => !p)}
            title={sidebarOpen ? "Close menu" : "Open menu"}
          >
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
            <NotificationDropdown />
          </div>
        </header>
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="user/:id" element={<AdminUserDetail />} />
          <Route path="appeals" element={<AdminAppeals />} />
        </Routes>
      </main>
    </div>
  );
}