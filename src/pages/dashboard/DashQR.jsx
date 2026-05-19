import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Power, Calendar, ShieldCheck, RefreshCw, X, Globe } from 'lucide-react';
import './DashPages.css';
import ProfileLogo from '../../components/ProfileLogo';

export default function DashQR() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({ active: true, expiryDate: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const cardRef   = useRef(null);
  const frontRef  = useRef(null);
  const backRef   = useRef(null);
  const profileUrl = `${window.location.origin}/p/${user?.username}`;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/qr/settings');
      setSettings({
        active: data.qr.active,
        expiryDate: data.qr.expiryDate ? data.qr.expiryDate.split('T')[0] : ''
      });
    } catch (error) {
      toast.error('Failed to load QR configurations.');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates) => {
    setSaving(true);
    try {
      await api.put('/qr/settings', updates);
      setSettings(prev => ({ ...prev, ...updates }));
      toast.success('Digital ID configurations updated.');
    } catch (error) {
      toast.error('Failed to update configurations.');
    } finally {
      setSaving(false);
    }
  };

  const captureEl = (el, w, h) => {
    const clone = el.cloneNode(true);
    const wrap  = document.createElement('div');
    wrap.style.cssText = `position:fixed;left:-9999px;top:-9999px;width:${w}px;height:${h}px;overflow:hidden;z-index:-1;`;
    clone.style.cssText += `;width:${w}px!important;height:${h}px!important;min-width:unset;max-width:unset;
      min-height:unset;max-height:unset;transform:none!important;
      backface-visibility:visible!important;-webkit-backface-visibility:visible!important;`;
    wrap.appendChild(clone);
    document.body.appendChild(wrap);
    return html2canvas(clone, {
      scale: 3, width: w, height: h,
      useCORS: true, allowTaint: true,
      backgroundColor: null, logging: false,
    }).finally(() => document.body.removeChild(wrap));
  };

  const downloadPDF = async () => {
    if (!settings.active) return toast.error('Digital ID is currently inactive.');
    if (!frontRef.current || !backRef.current) return toast.error('Card not ready.');

    const toastId = toast.loading('Generating premium identity asset...');
    try {
      // CR80 card at 300 DPI → 1011 × 638 px
      const W = 1011, H = 638;
      const [frontCanvas, backCanvas] = await Promise.all([
        captureEl(frontRef.current, W, H),
        captureEl(backRef.current,  W, H),
      ]);
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 53.98] });
      pdf.addImage(frontCanvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, 85.6, 53.98);
      pdf.addPage();
      pdf.addImage(backCanvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, 85.6, 53.98);
      pdf.save(`BespokeID_${user?.username}.pdf`);
      toast.success('Premium ID Downloaded!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate identity asset.', { id: toastId });
    }
  };

  if (loading) return (
    <div className="dash-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  return (
    <div className="dash-page" style={{ pointerEvents: 'auto' }}>
      <div className="dash-page-header">
        <h1 className="dash-page-title">Digital Identity Node</h1>
        <p className="dash-page-subtitle">Configure your high-end profile card and QR access protocols.</p>
      </div>

      <div className="dash-section reveal" style={{ overflow: 'visible' }}>
        <div className="qr-page-grid">

          {/* ── Settings Panel ── */}
          <div className="qr-settings-panel">
            <div className="dash-section-title">
              <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
              Security Protocols
            </div>

            {/* Active toggle */}
            <div className="item-card toggle-row" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)', padding: '24px' }}>
              <div className="toggle-info">
                <div className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '800' }}>
                  <Power size={16} style={{ color: settings.active ? 'var(--accent)' : 'var(--text-muted)' }} />
                  Node Access Status
                </div>
                <div className="toggle-desc" style={{ marginTop: '4px' }}>Authorize or terminate digital ID access.</div>
              </div>
              <label className="toggle-switch" title={settings.active ? 'Click to deactivate digital ID' : 'Click to activate digital ID'}>
                <input
                  type="checkbox"
                  checked={settings.active}
                  onChange={(e) => updateSettings({ qrActive: e.target.checked, active: e.target.checked })}
                  disabled={saving}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* Expiry date */}
            <div className="item-card toggle-row" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)', padding: '24px', flexWrap: 'wrap', gap: '20px' }}>
              <div className="toggle-info">
                <div className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '800' }}>
                  <Calendar size={16} style={{ color: 'var(--accent)' }} />
                  Temporal Expiry
                </div>
                <div className="toggle-desc" style={{ marginTop: '4px' }}>Set a termination date for this identity node.</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '8px 12px', fontSize: '13px', width: 'auto', cursor: 'pointer' }}
                  value={settings.expiryDate || ''}
                  onChange={(e) => updateSettings({ qrExpiryDate: e.target.value, expiryDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={saving}
                />
                {settings.expiryDate && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '8px', minWidth: 'auto', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', cursor: 'pointer' }}
                    onClick={() => updateSettings({ qrExpiryDate: null, expiryDate: null })}
                    title="Remove expiry date"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Download */}
            <div className="card-actions" style={{ marginTop: '24px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px', cursor: !settings.active ? 'not-allowed' : 'pointer' }}
                onClick={downloadPDF}
                disabled={!settings.active}
                title={!settings.active ? 'Activate digital ID first to download' : 'Download high-resolution identity PDF'}
              >
                <Download size={18} /> Download High-Res Identity PDF
              </button>
            </div>

            <div className="overview-tip" style={{ marginTop: '32px' }}>
              <ShieldCheck size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>
                <strong>Bespoke ID Protocol</strong>
                Interact with the visual preview to verify data integrity. The PDF asset is optimized for professional CR80 printing standards.
              </span>
            </div>
          </div>

          {/* ── Card Preview ── */}
          <div className="debit-card-container" style={{ WebkitTransformStyle: 'preserve-3d', transformStyle: 'preserve-3d' }}>
            <div className="dash-section-title">Visual Verification</div>

            <div
              className="card-flip-wrapper"
              onClick={() => setIsFlipped(!isFlipped)}
              title="Click to flip card"
            >
              <div className={`card-flip-inner ${isFlipped ? 'flipped' : ''}`} ref={cardRef}>

                {/* ── FRONT FACE ── */}
                <div className="card-face card-front" ref={frontRef}>

                  {/* Geometric line pattern */}
                  <svg
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.09, pointerEvents: 'none', borderRadius: '16px' }}
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <line x1="0"   y1="100%" x2="60%"  y2="0"    stroke="#c8960c" strokeWidth="1.5"/>
                    <line x1="15%" y1="100%" x2="75%"  y2="0"    stroke="#c8960c" strokeWidth="1.5"/>
                    <line x1="30%" y1="100%" x2="90%"  y2="0"    stroke="#c8960c" strokeWidth="1.5"/>
                    <line x1="45%" y1="100%" x2="105%" y2="0"    stroke="#c8960c" strokeWidth="1.5"/>
                    <line x1="0"   y1="0"    x2="60%"  y2="100%" stroke="#c8960c" strokeWidth="1.5"/>
                    <line x1="15%" y1="0"    x2="75%"  y2="100%" stroke="#c8960c" strokeWidth="1.5"/>
                    <line x1="30%" y1="0"    x2="90%"  y2="100%" stroke="#c8960c" strokeWidth="1.5"/>
                  </svg>

                  {/* Gold border glow */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '16px',
                    background: 'radial-gradient(circle at 85% 15%, rgba(200,150,12,0.12) 0%, transparent 55%)',
                    pointerEvents: 'none'
                  }} />

                  {/* Top row: brand + chip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    {/* Brand */}
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
                      <ProfileLogo size='sm' />
                    </div>
                    {/* EMV Chip */}
                    <div style={{
                      width: '38px', height: '29px',
                      background: 'linear-gradient(135deg, #8a6d2e, #d4b06a, #8a6d2e)',
                      borderRadius: '5px', position: 'relative', border: '1px solid rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ position: 'absolute', inset: '4px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '2px' }} />
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '33%', width: '1px', background: 'rgba(0,0,0,0.15)' }} />
                      <div style={{ position: 'absolute', top: 0, bottom: 0, right: '33%', width: '1px', background: 'rgba(0,0,0,0.15)' }} />
                      <div style={{ position: 'absolute', left: 0, right: 0, top: '42%', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
                    </div>
                  </div>

                  {/* Cardholder Name (center of card) */}
                  <div style={{ position: 'relative', zIndex: 1, marginTop: '8px' }}>
                    <div style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: '15px', fontWeight: 800,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      background: 'linear-gradient(90deg, #c8960c, #f0c040, #d4a017)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {user?.name || 'MEMBER NAME'}
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '3px' }}>
                      Digital Identity Node
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: '#fff' }}>
                      PREMIUM MEMBER ACCESS
                    </div>
                    {/* Network circles */}
                    <div style={{ position: 'absolute', right: 0, bottom: 0, display: 'flex' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#c8960c', opacity: 0.9 }} />
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#8B1A1A', opacity: 0.6, marginLeft: '-8px' }} />
                    </div>
                  </div>
                </div>

                {/* ── BACK FACE ── */}
                <div className="card-face card-back" ref={backRef}>

                  {/* Geometric line pattern */}
                  <svg
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08, pointerEvents: 'none', borderRadius: '16px' }}
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                  >
                    <line x1="0"   y1="100%" x2="60%"  y2="0"    stroke="#c8960c" strokeWidth="1.5"/>
                    <line x1="20%" y1="100%" x2="80%"  y2="0"    stroke="#c8960c" strokeWidth="1.5"/>
                    <line x1="40%" y1="100%" x2="100%" y2="0"    stroke="#c8960c" strokeWidth="1.5"/>
                    <line x1="0"   y1="0"    x2="60%"  y2="100%" stroke="#c8960c" strokeWidth="1.5"/>
                    <line x1="20%" y1="0"    x2="80%"  y2="100%" stroke="#c8960c" strokeWidth="1.5"/>
                  </svg>

                  {/* Magnetic stripe */}
                  <div className="card-stripe" style={{ height: '34px', background: '#000', marginTop: '18px' }} />

                  {/* Gold accent stripe */}
                  <div style={{
                    height: '5px',
                    background: 'linear-gradient(90deg, #8B6914, #f0c040, #d4a017)',
                    opacity: 0.85
                  }} />

                  {/* Back content — QR centered only */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card-qr-area" style={{
                      background: '#fff', padding: '8px', borderRadius: '12px',
                      width: '90px', height: '90px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 24px rgba(200,150,12,0.3)'
                    }}>
                      {settings.active ? (
                        <QRCodeSVG
                          value={`${profileUrl}?qr=1`}
                          size={74}
                          level="H"
                          bgColor="#ffffff"
                          fgColor="#000000"
                        />
                      ) : (
                        <div style={{ fontSize: '8px', fontWeight: 900, color: '#000', textAlign: 'center' }}>INACTIVE</div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="card-flip-hint" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
              <RefreshCw size={14} className="spin-on-hover" style={{ cursor: 'pointer' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Click card to flip and verify back panel</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}