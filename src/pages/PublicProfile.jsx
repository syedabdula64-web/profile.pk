import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Send, CheckCircle } from 'lucide-react';
import './Bento.css';
import ProfileLogo from '../components/ProfileLogo';

export default function PublicProfile() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/public/${username}`);
        const profileData = res.data.data;
        const isFromQR = new URLSearchParams(window.location.search).get('qr') === '1';

        if (isFromQR && (!profileData.profile.qrActive || profileData.profile.qrExpired)) {
          setError('INACTIVE_CARD');
          return;
        }

        setData(profileData);
      } catch (err) {
        setError(err.response?.data?.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) return (
    <div className="public-profile-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100', height: '100vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (error === 'INACTIVE_CARD') return (
    <div className="not-found-page" style={{ background: '#0a0a0a' }}>
      <div style={{ padding: '40px', background: 'linear-gradient(135deg, #1a1a1a, #000)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Card Locked</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.5' }}>
          This digital identity card has been temporarily locked or deactivated by the owner.
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div className="not-found-page">
      <div className="not-found-icon">🕵️</div>
      <h1 className="not-found-title">Oops!</h1>
      <p className="not-found-msg">{error}</p>
      <Link to="/" className="btn btn-primary mt-4">Go to Homepage</Link>
    </div>
  );

  const { user, profile } = data;

  // Apply Theme Classes
  const themeClass = profile.appearance?.theme || 'dark';
  const fontClass = profile.appearance?.font || 'inter';

  // Generate vCard
  const generateVCard = () => {
    let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${user.name}\n`;
    if (profile.bio) vcard += `NOTE:${profile.bio.replace(/\n/g, '\\n')}\n`;
    profile.phoneNumbers?.forEach(p => { vcard += `TEL;TYPE=CELL:${p.number}\n`; });
    profile.socialLinks?.forEach(s => { vcard += `URL;type=${s.platform}:${s.url}\n`; });
    profile.customLinks?.forEach(l => { vcard += `URL;type=${l.title}:${l.url}\n`; });
    vcard += `URL:${window.location.href}\n`;
    vcard += `END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.username}_contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setSending(true);
    try {
      await axios.post(`/api/public/${username}/contact`, contactForm);
      setSent(true);
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`public-profile-page theme-${themeClass} font-${fontClass} animate-fade-in`}>
      <div className="bento-container">

        {/* Main Identity Box */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
              <ProfileLogo size='sm' />
            </Link>
          </div>
          <div className="bento-box bento-header animate-fade-up">
            <div className="bento-avatar-ring">
              <div className="pub-avatar">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.name} />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
            <h1 className="pub-name">{user.name}</h1>
            <div className="pub-username">@{user.username}</div>
            {profile.bio && <p className="pub-bio">{profile.bio}</p>}

            <button onClick={generateVCard} className="btn btn-primary bento-btn">
              <Download size={16} /> Save Contact
            </button>    
        </div>

        {/* Media Embeds (Video / Music) */}
        {profile.media?.youtubeUrl && (
          <div className="bento-box bento-col-span-2 animate-fade-up" style={{ padding: 0, overflow: 'hidden' }}>
            <iframe
              width="100%"
              height="100%"
              src={profile.media.youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ minHeight: '200px' }}
            ></iframe>
          </div>
        )}

        {/* Social Grid */}
        {profile.socialLinks?.length > 0 && (
          <div className="bento-box bento-socials animate-fade-up">
            <h3 className="bento-title">Connect</h3>
            <div className="pub-social-grid" style={{display: 'flex', gap: '8px' }}>
              {profile.socialLinks.map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="bento-social-link">
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Skills / Tech Stack */}
        {profile.skills?.length > 0 && (
          <div className="bento-box animate-fade-up">
            <h3 className="bento-title">Skills</h3>
            <div className="skills-flex">
              {profile.skills.map((skill, i) => (
                <span key={i} className="skill-badge">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {profile.portfolio?.length > 0 && (
          <div className="bento-box bento-col-span-2 animate-fade-up">
            <h3 className="bento-title">Projects</h3>
            <div className="portfolio-grid">
              {profile.portfolio.map((project, i) => (
                <a key={i} href={project.link || '#'} target="_blank" rel="noopener noreferrer" className="portfolio-card">
                  {project.imageUrl ? (
                    <div className="portfolio-img" style={{ backgroundImage: `url(${project.imageUrl})` }}></div>
                  ) : (
                    <div className="portfolio-img-placeholder">🚀</div>
                  )}
                  <div className="portfolio-content">
                    <div className="portfolio-title">{project.title}</div>
                    <div className="portfolio-desc">{project.description}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Spotify Embed */}
        {profile.media?.spotifyUrl && (
          <div className="bento-box animate-fade-up" style={{ padding: 0, overflow: 'hidden', height: '152px' }}>
            <iframe
              style={{ borderRadius: '12px' }}
              src={profile.media.spotifyUrl.replace('/track/', '/embed/track/').replace('/playlist/', '/embed/playlist/')}
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        )}

        {/* Bank Details */}
        {profile.banks?.length > 0 && (
          <div className="bento-box bento-col-span-2 animate-fade-up">
            <h3 className="bento-title">Bank Details</h3>
            <div className="bank-list">
              {profile.banks.map((bank, i) => (
                <div key={i} className="bento-bank-item">
                  <div className="bank-name">{bank.bankName}</div>
                  <div className="bank-acc">{bank.accountNumber}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lead Gen (Let's Talk) */}
        {profile.leadGenActive && (
          <div className="bento-box bento-col-span-2 animate-fade-up">
            <h3 className="bento-title">Let's Talk ✨</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Interested in working together? Drop a message below.</p>
            {sent ? (
              <div className="success-msg">
                <CheckCircle color="var(--success)" size={32} />
                <p>Thanks! Your message has been sent successfully.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <input type="text" placeholder="Your Name" required className="bento-input" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} />
                  <input type="email" placeholder="Your Email Address" required className="bento-input" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
                </div>
                <textarea placeholder="How can I help you?" required rows="3" className="bento-input" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })}></textarea>
                <button type="submit" className="btn btn-primary bento-btn" disabled={sending} style={{ width: '100%' }}>
                  {sending ? 'Sending...' : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
