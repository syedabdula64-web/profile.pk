import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Sparkles, Rocket, Mail, Landmark, Link as LinkIcon, QrCode, TrendingUp, Copy, ExternalLink } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const quickLinks = [
  { to: '/dashboard/about', icon: <User size={20} />, label: 'Profile Identity', desc: 'Bio, photo & details' },
  { to: '/dashboard/appearance', icon: <Sparkles size={20} />, label: 'Appearance', desc: 'Modernize your UI' },
  { to: '/dashboard/portfolio', icon: <Rocket size={20} />, label: 'Portfolio', desc: 'Showcase projects' },
  { to: '/dashboard/inbox', icon: <Mail size={20} />, label: 'Global Inbox', desc: 'Manage messages' },
  { to: '/dashboard/banks', icon: <Landmark size={20} />, label: 'Bank Vault', desc: 'Secure payments' },
  { to: '/dashboard/social', icon: <LinkIcon size={20} />, label: 'Social Ecosystem', desc: 'Link channels' },
  { to: '/dashboard/qr', icon: <QrCode size={20} />, label: 'QR Assets', desc: 'Your digital ID' },
];

export default function DashOverview() {
  const { user } = useAuth();
  const profileUrl = `${window.location.origin}/p/${user?.username}`;
  const [views, setViews] = useState(0);

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      setViews(data.profile.views || 0);
    }).catch(() => { });
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile link copied to clipboard');
  };

  return (
    <div className="dash-page">
      <div className="dash-page-header overview-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="dash-page-title">
            Welcome back, <span className="gold-gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="dash-page-subtitle">Elevate your digital presence from your command center.</p>
        </div>

        {/* Analytics Mini-Card */}
        <div 
          className="glass-panel overview-analytics-card" 
          style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-accent)' }}
          title="Profile analytics - Total profile views"
        >
          <div className="overview-card-icon" style={{ background: 'var(--accent)', color: '#000' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '800' }}>Engagement</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-light)', lineHeight: 1 }}>{views} <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Views</span></div>
          </div>
        </div>
      </div>

      {/* Profile URL Banner */}
      <div className="overview-url-banner">
        <div className="overview-url-info">
          <span className="overview-url-label">Bespoke Profile URL</span>
          <span className="overview-url-value">{profileUrl}</span>
        </div>
        <div className="overview-url-actions">
          <button 
            className="btn btn-secondary" 
            onClick={copyLink}
            title="Copy your profile URL to clipboard"
          >
            <Copy size={16} /> Copy
          </button>
          <a 
            href={profileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary"
            title="View your public profile in a new tab"
          >
            <ExternalLink size={16} /> View Profile
          </a>
        </div>
      </div>

      {/* Quick Access */}
      <div style={{ marginTop: '48px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
          Navigation Hub
        </h2>
      </div>

      <div className="overview-grid">
        {quickLinks.map((item) => (
          <Link 
            to={item.to} 
            key={item.to} 
            className="overview-card"
            title={`Go to ${item.label} - ${item.desc}`}
          >
            <div className="overview-card-icon">{item.icon}</div>
            <div>
              <div className="overview-card-label">{item.label}</div>
              <div className="overview-card-desc">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tip */}
      <div 
        className="overview-tip"
        title="Pro tip: Optimize your profile for better engagement"
      >
        <Sparkles size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span>
          <strong>Pro Tip</strong>
          Complete your identity profile and generate your QR Assets to stand out in every professional encounter.
        </span>
      </div>
    </div>
  );
}