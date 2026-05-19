import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfileLogo from '../components/ProfileLogo';
import './LandingPage.css';

export default function LandingPage() {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-root">
      {/* Navigation */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <ProfileLogo size="sm" />
          </Link>
          <div className="nav-r">
            <a href="#features" className="nl">Features</a>
            <a href="#how" className="nl">Process</a>
            <Link to="/login" className="nb nb-o">Sign In</Link>
            <Link to="/register" className="nb nb-p">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>

        <div className="eyebrow animate-fade-up">
          <div className="ey-dot"></div>
          Elevate Your Professional Presence
        </div>

        <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Your <span className="gold-gradient">Digital Identity</span><br />Masterfully Crafted
        </h1>

        <p className="sub animate-fade-up" style={{ animationDelay: '0.2s' }}>
          A bespoke digital profile for your portfolio, payments, and social ecosystem. Built for the elite professional who values precision and prestige.
        </p>

        <div className="ctas animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Link to="/register" className="btn-premium primary">
            Create Free Profile
          </Link>
          <Link to="/p/demo" className="btn-premium secondary">
            Explore Demo
          </Link>
        </div>

        <div className="stats-bar animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="stat-item">
            <div className="stat-val">50k+</div>
            <div className="stat-lab">Active Users</div>
          </div>
          <div className="stat-sep"></div>
          <div className="stat-item">
            <div className="stat-val">100%</div>
            <div className="stat-lab">Customizable</div>
          </div>
          <div className="stat-sep"></div>
          <div className="stat-item">
            <div className="stat-val">Secure</div>
            <div className="stat-lab">Encryption</div>
          </div>
        </div>

        {/* Fixed John Doe Card */}
        <div className="card-wrap animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="card-perspective">
            <div className="pcard">
              <svg className="pqr" width="40" height="40" viewBox="0 0 28 28" fill="none">
                <rect x="1" y="1" width="10" height="10" rx="2" stroke="#b8964a" strokeWidth="1.2"/>
                <rect x="3" y="3" width="6" height="6" rx="1" fill="#b8964a" opacity=".4"/>
                <rect x="17" y="1" width="10" height="10" rx="2" stroke="#b8964a" strokeWidth="1.2"/>
                <rect x="19" y="3" width="6" height="6" rx="1" fill="#b8964a" opacity=".4"/>
                <rect x="1" y="17" width="10" height="10" rx="2" stroke="#b8964a" strokeWidth="1.2"/>
                <rect x="3" y="19" width="6" height="6" rx="1" fill="#b8964a" opacity=".4"/>
              </svg>
              <div className="pcard-top">
                <div className="av">JD</div>
                <div>
                  <div className="pn">John Doe</div>
                  <div className="ph">profile.pk/johndoe</div>
                </div>
              </div>
              <div className="pb">Creative Director & Multi-Disciplinary Designer creating digital experiences for the next generation.</div>
              <div className="ptags">
                <div className="ptag">Portfolio</div>
                <div className="ptag">LinkedIn</div>
                <div className="ptag">Bank Vault</div>
              </div>
              <div className="pdiv"></div>
              <div className="pbank-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--lp-t3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Status</div>
                <div style={{ fontSize: '11px', color: 'var(--lp-g)', fontWeight: '700' }}>Verified ✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="sec reveal" id="features">
        <div className="sec-label">Features</div>
        <h2 className="sec-title">Engineered for Excellence</h2>
        <p className="ssub">A suite of powerful tools designed to unify your online presence and payment infrastructure.</p>
        <div className="fg">
          <div className="fi reveal">
            <div className="fic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8964a" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="ft">Unified Identity</div>
            <div className="fd">Your bio, social ecosystem, and contact information, presented in a single high-end interface.</div>
          </div>
          <div className="fi reveal">
            <div className="fic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8964a" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <div className="ft">Social Integration</div>
            <div className="fd">Seamlessly link all your professional and creative channels with automated icon resolution.</div>
          </div>
          <div className="fi reveal">
            <div className="fic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8964a" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </div>
            <div className="ft">Bank Vault</div>
            <div className="fd">Securely manage and share payment details for faster transactions. Built for Pakistani banking.</div>
          </div>
          <div className="fi reveal">
            <div className="fic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8964a" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="ft">QR & NFC Assets</div>
            <div className="fd">Download your premium QR card or link to NFC tags for contactless networking in the real world.</div>
          </div>
          <div className="fi reveal">
            <div className="fic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8964a" strokeWidth="1.5">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="ft">Portfolio Support</div>
            <div className="fd">Showcase your best projects with rich media embeds from YouTube, Spotify, and more.</div>
          </div>
          <div className="fi reveal">
            <div className="fic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8964a" strokeWidth="1.5">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div className="ft">Real-time Analytics</div>
            <div className="fd">Monitor your reach and growth with detailed profile view tracking and visitor insights.</div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="how reveal" id="how">
        <div className="sec" style={{ padding: '0' }}>
          <div className="sec-label">Process</div>
          <h2 className="sec-title">From Link to Legacy</h2>
          <div className="steps">
            <div className="step reveal">
              <div className="stp-n">01</div>
              <div className="stp-t">Reserve Your Name</div>
              <div className="stp-d">Claim your unique URL on the Profile.pk network before it's taken by others.</div>
            </div>
            <div className="step reveal">
              <div className="stp-n">02</div>
              <div className="stp-t">Configure Profile</div>
              <div className="stp-d">Effortlessly add your professional history, portfolio, and payment infrastructure.</div>
            </div>
            <div className="step reveal">
              <div className="stp-n">03</div>
              <div className="stp-t">Connect Smarter</div>
              <div className="stp-d">Deploy your link across social platforms and use QR cards for instant networking.</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-sec reveal">
        <div className="hero-glow-1" style={{ top: '50%', transform: 'translate(-50%, -50%)', width: '1000px' }}></div>
        <div className="cta-in">
          <h3 className="cta-title">Begin Your Digital Evolution</h3>
          <p className="cs">Join the ranks of professionals who are redefining how the world discovers their work.</p>
          <Link to="/register" className="btn-premium primary" style={{ display: 'inline-block' }}>
            Claim Your Username
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="lp-footer-enhanced reveal">
        <div className="footer-content">
          <div className="footer-brand">
            <ProfileLogo size="sm" />
            <p className="footer-tagline">The Standard in Digital Identity</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#how">How it Works</a>
              <a href="/pricing">Pricing</a>
              <a href="/demo">Demo</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="/blog">Blog</a>
              <a href="/help">Help Center</a>
              <a href="/api">API Docs</a>
              <a href="/status">Status</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="/about">About</a>
              <a href="/careers">Careers</a>
              <a href="/press">Press</a>
              <a href="/contact">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="/security">Security</a>
              <a href="/cookies">Cookies</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="social-icons">
            <a href="#" className="social-icon" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
          <div className="copyright">
            <span>© 2025 Profile.pk — The Standard in Digital Identity.</span>
            <span className="made-with">Made with <span className="heart">♡</span> in Pakistan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}