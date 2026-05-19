import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import SearchableSelect from '../../components/SearchableSelect';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Share2, Plus, Trash2, ExternalLink, Hash, Zap, ChevronUp, ChevronDown, Edit3, Save, X, GripVertical, ListOrdered } from 'lucide-react';
import './DashPages.css';

export default function DashSocial() {
  const [socials, setSocials] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action specific loading states
  const [syncing, setSyncing] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newSocial, setNewSocial] = useState({ platform: '', url: '', username: '' });
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, index: null, type: 'delete' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, platformsRes] = await Promise.all([
        api.get('/profile'),
        api.get('/profile/social/platforms')
      ]);
      setSocials(profileRes.data.profile.socialLinks || []);
      setAvailablePlatforms(platformsRes.data.platforms || []);
    } catch (error) {
      toast.error('Failed to synchronize social ecosystem.');
    } finally {
      setLoading(false);
    }
  };

  const saveSocials = async (updatedSocials, silent = false) => {
    setSyncing(true);
    try {
      await api.put('/profile/social', { socialLinks: updatedSocials });
      setSocials(updatedSocials);
      if (!silent) {
        toast.success('Social ecosystem synchronized.');
        resetForm();
        setConfirmModal({ isOpen: false, index: null, type: 'delete' });
        setIsReorderMode(false);
      }
    } catch (error) {
      toast.error('Failed to update social channels.');
    } finally {
      setSyncing(false);
    }
  };

  // Function to reset form completely
  const resetForm = () => {
    setShowAddForm(false);
    setEditingIndex(null);
    setNewSocial({ platform: '', url: '', username: '' });
  };

  const handleTriggerAdd = () => {
    resetForm();
    setConfirmModal({
      isOpen: true,
      index: null,
      type: 'add',
      title: 'Initialize Connection?',
      message: 'This will add a new redirection node to your public identity.',
      confirmText: 'Continue'
    });
  };

  const handleAdd = () => {
    if (!newSocial.platform || !newSocial.url) {
      return toast.error('Platform and URL are mandatory identifiers.');
    }
    
    let updated;
    if (editingIndex !== null) {
      updated = [...socials];
      updated[editingIndex] = newSocial;
    } else {
      updated = [...socials, newSocial];
    }
    saveSocials(updated);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewSocial(socials[index]);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = () => {
    const updated = socials.filter((_, i) => i !== confirmModal.index);
    saveSocials(updated);
  };

  const moveItem = (index, direction) => {
    const updated = [...socials];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= updated.length) return;
    
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSocials(updated);
  };

  const finalizeReorder = () => {
    saveSocials(socials);
  };
  
  // Close form handler
  const handleCloseForm = () => {
    resetForm();
  };

  if (loading) return <div className="dash-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh'}}><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dash-page" style={{ pointerEvents: 'auto' }}>
      <div className="dash-page-header">
        <h1 className="dash-page-title">Social Ecosystem</h1>
        <p className="dash-page-subtitle">Unify all your professional and creative channels under one bespoke digital identity.</p>
      </div>

      <div className="dash-section reveal">
        <div className="dash-section-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Share2 size={16} style={{ color: 'var(--accent)' }} />
            <span>Active Connections</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {socials.length > 1 && (
              <button 
                className={`btn ${isReorderMode ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => isReorderMode ? finalizeReorder() : setIsReorderMode(true)}
                style={{ padding: '8px 16px', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer', zIndex: 10 }}
                title={isReorderMode ? "Save the new channel order" : "Reorder your social channels"}
              >
                {isReorderMode ? <Save size={14} /> : <ListOrdered size={14} />} {isReorderMode ? 'Save Sequence' : 'Sequence Mode'}
              </button>
            )}
            {!showAddForm && !isReorderMode && (
              <button 
                className="btn btn-primary" 
                onClick={handleTriggerAdd} 
                style={{ padding: '8px 16px', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer', zIndex: 10 }}
                title="Add a new social media channel"
              >
                <Plus size={14} /> Add Channel
              </button>
            )}
          </div>
        </div>

        {socials.length === 0 && !showAddForm ? (
          <div className="empty-state" style={{ padding: '64px 32px' }}>
            <div className="empty-state-icon" style={{ fontSize: '40px' }}>🌐</div>
            <div className="empty-state-text">No social connections have been initialized yet.</div>
            <button 
              className="btn btn-primary" 
              onClick={handleTriggerAdd} 
              style={{ marginTop: '24px', cursor: 'pointer', zIndex: 10 }}
              title="Create your first social connection"
            >
              Initialize Connection
            </button>
          </div>
        ) : (
          <div className="item-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: showAddForm ? '32px' : '0' }}>
            {socials.map((social, idx) => (
              <div 
                key={idx} 
                className={`item-card reveal ${isReorderMode ? 'reorder-card' : ''}`} 
                style={{ 
                  animationDelay: `${idx * 0.05}s`, 
                  padding: '20px 24px', 
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {isReorderMode ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '16px' }}>
                    <GripVertical size={18} style={{ color: 'var(--text-muted)' }} title="Drag to reorder (use arrows for precise positioning)" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button 
                        className="icon-btn sm" 
                        onClick={() => moveItem(idx, 'up')} 
                        disabled={idx === 0}
                        title="Move channel up"
                        style={{ cursor: 'pointer' }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button 
                        className="icon-btn sm" 
                        onClick={() => moveItem(idx, 'down')} 
                        disabled={idx === socials.length - 1}
                        title="Move channel down"
                        style={{ cursor: 'pointer' }}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '14px', 
                    background: 'var(--accent-muted)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: 'var(--accent)', 
                    border: '1px solid var(--border-accent)', 
                    flexShrink: 0 
                  }}>
                    <Hash size={22} />
                  </div>
                )}
                
                <div className="item-info" style={{ flex: 1, marginLeft: isReorderMode ? '0' : '16px' }}>
                  <div className="item-title" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{social.platform}</div>
                  {!isReorderMode && <div className="item-subtitle" style={{ color: 'var(--accent-light)', fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>{social.username || 'Direct Identifier'}</div>}
                </div>
                
                {!isReorderMode && (
                  <div className="item-actions" style={{ display: 'flex', gap: '12px' }}>
                    <a 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary" 
                      title={`Visit ${social.platform} profile`}
                      style={{ 
                        padding: '8px 20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <ExternalLink size={16} /> Visit
                    </a>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleEdit(idx)} 
                      title="Edit this social channel"
                      style={{ 
                        padding: '8px 20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                    >
                      <Edit3 size={16} /> Edit
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setConfirmModal({ isOpen: true, index: idx, type: 'delete', title: 'Sever Connection?', message: 'This will terminate the social channel integration.', confirmText: 'Sever Connection' })} 
                      title="Delete this social channel permanently"
                      style={{ 
                        padding: '8px 20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        cursor: 'pointer',
                        zIndex: 10
                      }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showAddForm && (
          <div className="add-form reveal" style={{ 
            background: 'var(--surface-muted)', 
            border: '1px solid var(--border-accent)', 
            padding: '32px', 
            zIndex: 100,
            position: 'relative',
            pointerEvents: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent-light)', marginBottom: '4px' }}>
                  {editingIndex !== null ? 'Modify Channel Integration' : 'Initialize Channel Integration'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Expand your reach across premium global networks.</p>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={handleCloseForm}
                title="Cancel and close form"
                style={{ 
                  cursor: 'pointer',
                  padding: '10px 10px', 
                  borderRadius: '60px',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Network Platform</label>
              <SearchableSelect
                options={availablePlatforms.map(p => ({ value: p, label: p }))}
                value={newSocial.platform}
                onChange={(val) => setNewSocial({ ...newSocial, platform: val })}
                placeholder="Search global registries..."
              />
            </div>

            <div className="add-form-row" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Direct URL Identifier</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://platform.com/identity"
                  value={newSocial.url}
                  onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                  title="Full URL to your profile page"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Display Handle (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="@handle"
                  value={newSocial.username}
                  onChange={(e) => setNewSocial({ ...newSocial, username: e.target.value })}
                  title="Username or handle to display"
                />
              </div>
            </div>

            <div className="add-form-actions" style={{ marginTop: '32px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleCloseForm}
                title="Cancel without saving"
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setConfirmModal({ isOpen: true, index: null, type: 'save', title: 'Authorize Integration?', message: 'Confirming will synchronize this channel with your public ecosystem.', confirmText: 'Authorize' })} 
                disabled={syncing}
                title={syncing ? "Processing..." : (editingIndex !== null ? "Save your changes" : "Add new social channel")}
                style={{ cursor: syncing ? 'not-allowed' : 'pointer' }}
              >
                <Save size={16} /> {syncing ? 'Synchronizing...' : editingIndex !== null ? 'Update Integration' : 'Authorize Integration'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overview-tip reveal" style={{ animationDelay: '0.3s' }}>
        <Zap size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span>
          <strong>Sequence Control</strong><br />
          Enable <strong>Sequence Mode</strong> to prioritize your most important channels. All changes must be synchronized for the public ecosystem to reflect your new priority structure.
        </span>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        isLoading={syncing}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.type === 'delete' ? handleRemove : (confirmModal.type === 'add' ? () => { setShowAddForm(true); setConfirmModal({ ...confirmModal, isOpen: false }); } : handleAdd)}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type === 'delete' ? 'danger' : 'success'}
      />
    </div>
  );
}