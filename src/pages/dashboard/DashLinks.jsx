import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Globe, Plus, Trash2, ExternalLink, Link as LinkIcon, Info, Save, ChevronUp, ChevronDown, Edit3, X, GripVertical, ListOrdered } from 'lucide-react';
import './DashPages.css';

export default function DashLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action specific loading states
  const [syncing, setSyncing] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, index: null, type: 'delete' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/profile');
      setLinks(data.profile.customLinks || []);
    } catch (error) {
      toast.error('Failed to synchronize ecosystem links.');
    } finally {
      setLoading(false);
    }
  };

  const saveLinks = async (updatedLinks, silent = false) => {
    setSyncing(true);
    try {
      await api.put('/profile/links', { customLinks: updatedLinks });
      setLinks(updatedLinks);
      if (!silent) {
        toast.success('Ecosystem links synchronized.');
        resetForm();
        setConfirmModal({ isOpen: false, index: null, type: 'delete' });
        setIsReorderMode(false);
      }
    } catch (error) {
      toast.error('Failed to update ecosystem.');
    } finally {
      setSyncing(false);
    }
  };

  // Function to reset form completely
  const resetForm = () => {
    setShowAddForm(false);
    setEditingIndex(null);
    setNewLink({ title: '', url: '' });
  };

  const handleTriggerAdd = () => {
    resetForm();
    setConfirmModal({
      isOpen: true,
      index: null,
      type: 'add',
      title: 'Initialize Endpoint?',
      message: 'This will add a new redirection node to your professional network ecosystem.',
      confirmText: 'Continue'
    });
  };

  const handleAdd = () => {
    if (!newLink.title || !newLink.url) {
      return toast.error('Both Title and URL are mandatory identifiers.');
    }
    
    let updated;
    if (editingIndex !== null) {
      updated = [...links];
      updated[editingIndex] = newLink;
    } else {
      updated = [...links, newLink];
    }
    saveLinks(updated);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewLink(links[index]);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = () => {
    const updated = links.filter((_, i) => i !== confirmModal.index);
    saveLinks(updated);
  };

  const moveItem = (index, direction) => {
    const updated = [...links];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= updated.length) return;
    
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setLinks(updated);
  };

  const finalizeReorder = () => {
    saveLinks(links);
  };
  
  // Close form handler
  const handleCloseForm = () => {
    resetForm();
  };

  if (loading) return <div className="dash-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh'}}><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dash-page" style={{ pointerEvents: 'auto' }}>
      <div className="dash-page-header">
        <h1 className="dash-page-title">Digital Ecosystem</h1>
        <p className="dash-page-subtitle">Configure external endpoints, specialized portfolios, or high-value resources.</p>
      </div>

      <div className="dash-section reveal">
        <div className="dash-section-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Globe size={16} style={{ color: 'var(--accent)' }} />
            <span>Active Endpoints</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {links.length > 1 && (
              <button 
                className={`btn ${isReorderMode ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => isReorderMode ? finalizeReorder() : setIsReorderMode(true)}
                style={{ cursor: 'pointer', zIndex: 10 }}
                title={isReorderMode ? "Save the new endpoint order" : "Reorder your digital endpoints"}
              >
                {isReorderMode ? <Save size={14} /> : <ListOrdered size={14} />} {isReorderMode ? 'Save Sequence' : 'Sequence Mode'}
              </button>
            )}
            {!showAddForm && !isReorderMode && (
              <button 
                className="btn btn-primary" 
                onClick={handleTriggerAdd}
                style={{ cursor: 'pointer', zIndex: 10 }}
                title="Add a new digital endpoint"
              >
                <Plus size={14} /> New Endpoint
              </button>
            )}
          </div>
        </div>

        {links.length === 0 && !showAddForm ? (
          <div className="empty-state" style={{ padding: '64px 32px' }}>
            <div className="empty-state-icon" style={{ fontSize: '40px' }}>🔗</div>
            <div className="empty-state-text">Your digital ecosystem is currently unconfigured.</div>
            <button 
              className="btn btn-primary" 
              onClick={handleTriggerAdd} 
              style={{ marginTop: '24px', cursor: 'pointer', zIndex: 10 }}
              title="Create your first digital endpoint"
            >
              Initialize First Endpoint
            </button>
          </div>
        ) : (
          <div className="item-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: showAddForm ? '32px' : '0' }}>
            {links.map((link, idx) => (
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
                        title="Move endpoint up"
                        style={{ cursor: 'pointer' }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button 
                        className="icon-btn sm" 
                        onClick={() => moveItem(idx, 'down')} 
                        disabled={idx === links.length - 1}
                        title="Move endpoint down"
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
                    <LinkIcon size={22} />
                  </div>
                )}
                
                <div className="item-info" style={{ flex: 1, marginLeft: isReorderMode ? '0' : '16px' }}>
                  <div className="item-title" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{link.title}</div>
                  {!isReorderMode && <div className="item-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '2px', wordBreak: 'break-all' }}>{link.url}</div>}
                </div>
                
                {!isReorderMode && (
                  <div className="item-actions" style={{ display: 'flex', gap: '12px' }}>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-secondary" 
                      title={`Visit ${link.title}`}
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
                      title="Edit this endpoint"
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
                      onClick={() => setConfirmModal({ isOpen: true, index: idx, type: 'delete', title: 'Terminate Endpoint?', message: 'This will permanently remove the redirection node from your ecosystem.', confirmText: 'Terminate' })} 
                      title="Delete this endpoint permanently"
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
                  {editingIndex !== null ? 'Modify Digital Endpoint' : 'Initialize Digital Endpoint'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Define a new redirection node within your professional network.</p>
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
            
            <div className="add-form-row">
              <div className="form-group">
                <label className="form-label">Endpoint Label</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Master Portfolio"
                  value={newLink.title}
                  onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                  title="Enter a descriptive label for this endpoint"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Target URL</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://..."
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  title="Enter the full URL including https://"
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
                onClick={() => setConfirmModal({ isOpen: true, index: null, type: 'save', title: 'Authorize Endpoint?', message: 'Confirming will synchronize this redirection node with your digital ecosystem.', confirmText: 'Authorize' })} 
                disabled={syncing}
                title={syncing ? "Processing..." : (editingIndex !== null ? "Save your changes" : "Add new endpoint")}
                style={{ cursor: syncing ? 'not-allowed' : 'pointer' }}
              >
                <Save size={16} /> {syncing ? 'Synchronizing...' : editingIndex !== null ? 'Update Endpoint' : 'Authorize Endpoint'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overview-tip reveal" style={{ animationDelay: '0.3s' }}>
        <Info size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span>
          <strong>Navigation Strategy</strong><br />
          Enable <strong>Sequence Mode</strong> to manage the priority of your redirection nodes. Descriptive labels maximize the conversion of profile visitors.
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