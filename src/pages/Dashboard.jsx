import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, User, Rocket, Landmark, Link as LinkIcon, 
  Globe, StickyNote, Sparkles, Inbox, QrCode, Settings, 
  LogOut, Menu, X, ExternalLink, ShieldAlert, CheckCircle, Mail, Copy
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';
import ProfileLogo from '../components/ProfileLogo';
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';
import DashOverview from './dashboard/DashOverview';
import DashAbout from './dashboard/DashAbout';
import DashPortfolio from './dashboard/DashPortfolio';
import DashBanks from './dashboard/DashBanks';
import DashSocial from './dashboard/DashSocial';
import DashLinks from './dashboard/DashLinks';
import DashNotes from './dashboard/DashNotes';
import DashQR from './dashboard/DashQR';
import DashSettings from './dashboard/DashSettings';
import DashAppearance from './dashboard/DashAppearance';
import DashInbox from './dashboard/DashInbox';

const navItems = [
  { path: '', label: 'Overview', icon: <LayoutDashboard size={18} />, end: true },
  { path: 'about', label: 'Identity', icon: <User size={18} /> },
  { path: 'portfolio', label: 'Showcase', icon: <Rocket size={18} /> },
  { path: 'banks', label: 'Financials', icon: <Landmark size={18} /> },
  { path: 'social', label: 'Channels', icon: <LinkIcon size={18} /> },
  { path: 'links', label: 'Ecosystem', icon: <Globe size={18} /> },
  { path: 'notes', label: 'Notes', icon: <StickyNote size={18} /> },
  { path: 'appearance', label: 'Aesthetics', icon: <Sparkles size={18} /> },
  { path: 'inbox', label: 'Inbox', icon: <Inbox size={18} /> },
  { path: 'qr', label: 'Digital ID', icon: <QrCode size={18} /> },
  { path: 'settings', label: 'Configuration', icon: <Settings size={18} /> },
];

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Close sidebar on window resize (for responsive)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Prevent body scroll when modal or sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen || showVerifyModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen, showVerifyModal]);

  const handleSendCode = async () => {
    setVerifyLoading(true);
    try {
      await api.post('/auth/send-verification');
      setCodeSent(true);
      toast.success('Security code dispatched to your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transmission failure.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyCode) return toast.error('Security code required.');
    setVerifyLoading(true);
    try {
      await api.post('/auth/verify-email', { code: verifyCode });
      toast.success('Identity verified. Access authorized.');
      updateUser({ isVerified: true });
      setShowVerifyModal(false);
      setVerifyCode('');
      setCodeSent(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid authorization code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Session terminated.');
    navigate('/');
  };

  const profileUrl = `${window.location.origin}/p/${user?.username}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Ecosystem link copied.');
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <ProfileLogo size="sm" />
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.profilePic
              ? <img src={user.profilePic} alt={user.name} />
              : <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
            }
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name" title={user?.name}>{user?.name}</div>
            <div className="sidebar-user-username" title={`profile.pk/${user?.username}`}>profile.pk/{user?.username}</div>
          </div>
        </div>

        <button 
          className="sidebar-share-btn" 
          onClick={copyProfileLink}
          title="Copy your profile URL to clipboard"
        >
          <Copy size={14} />
          <span>Copy URL</span>
        </button>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={`/dashboard${item.path ? '/' + item.path : ''}`}
              end={item.end}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', padding: '0 20px 20px' }}>
          <button 
            className="sidebar-logout" 
            onClick={handleLogout} 
            style={{ margin: 0, flex: 1 }}
            title="Logout from your account"
          >
            <LogOut size={16} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {!user?.isVerified && (
          <div className="unverified-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldAlert size={16} />
              <span><strong>Identity Pending:</strong> Your professional ecosystem requires verification to maintain status.</span>
            </div>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="btn btn-primary"
              style={{ padding: '6px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}
              title="Verify your email address"
            >
              Verify Now
            </button>
          </div>
        )}

        {/* Verification Modal */}
        {showVerifyModal && createPortal(
          <div className="modal-overlay" onClick={() => { setShowVerifyModal(false); setVerifyCode(''); setCodeSent(false); }}>
            <div className="modal-content reveal" style={{ padding: '48px', maxWidth: '440px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <button 
                className="modal-close" 
                onClick={() => { setShowVerifyModal(false); setVerifyCode(''); setCodeSent(false); }}
                title="Close modal"
              >
                <X size={20} />
              </button>

              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--accent-muted)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Mail size={32} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-primary)' }}>Identity Verification</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                {codeSent ? `A 6-digit authorization code was dispatched to ${user?.email}` : `Initialize verification for ${user?.email}`}
              </p>
              
              <form onSubmit={handleVerify}>
                {!codeSent ? (
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    style={{ width: '100%', cursor: verifyLoading ? 'not-allowed' : 'pointer' }} 
                    onClick={handleSendCode} 
                    disabled={verifyLoading}
                    title="Send verification code to your email"
                  >
                    {verifyLoading ? 'Transmitting…' : 'Initialize Dispatch'}
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Security Code"
                      value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value)}
                      maxLength={6}
                      style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '900', marginBottom: '24px', background: '#050505' }}
                      required
                      autoFocus
                      title="Enter the 6-digit verification code"
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ width: '100%', cursor: verifyLoading ? 'not-allowed' : 'pointer' }} 
                      disabled={verifyLoading}
                      title="Verify your email address"
                    >
                      <CheckCircle size={18} /> {verifyLoading ? 'Authenticating…' : 'Authorize Identity'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ width: '100%', marginTop: '12px', cursor: verifyLoading ? 'not-allowed' : 'pointer' }} 
                      onClick={handleSendCode} 
                      disabled={verifyLoading}
                      title="Resend verification code"
                    >
                      Re-transmit Code
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>,
          document.body
        )}

        <header className="dashboard-topbar">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setSidebarOpen(p => !p)}
            title={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="topbar-title gold-gradient-text">Command Center</div>
          <div className="topbar-actions">
            <ThemeToggle />
            <NotificationDropdown />
            <a 
              href={`/p/${user?.username}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary topbar-profile-btn" 
              style={{ padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}
              title="View your public profile"
            >
              <ExternalLink size={14} /> <span className="hide-mobile">Profile</span>
            </a>
          </div>
        </header>

        <div className="dashboard-content">
          <Routes>
            <Route index element={<DashOverview />} />
            <Route path="about" element={<DashAbout />} />
            <Route path="portfolio" element={<DashPortfolio />} />
            <Route path="banks" element={<DashBanks />} />
            <Route path="social" element={<DashSocial />} />
            <Route path="links" element={<DashLinks />} />
            <Route path="notes" element={<DashNotes />} />
            <Route path="appearance" element={<DashAppearance />} />
            <Route path="inbox" element={<DashInbox />} />
            <Route path="qr" element={<DashQR />} />
            <Route path="settings" element={<DashSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
