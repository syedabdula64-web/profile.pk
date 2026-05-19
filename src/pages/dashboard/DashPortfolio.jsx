import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Rocket, Plus, Trash2, ExternalLink, Image as ImageIcon, Save, Info, ChevronUp, ChevronDown, Edit3, X, GripVertical, ListOrdered } from 'lucide-react';
import './DashPages.css';

export default function DashPortfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action specific loading states
  const [syncing, setSyncing] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newProject, setNewProject] = useState({ title: '', description: '', link: '', imageUrl: '' });
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, index: null, type: 'delete' });
  
  // Full screen image preview state
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/profile');
      setPortfolio(data.profile.portfolio || []);
    } catch (error) {
      toast.error('Failed to synchronize showcase data.');
    } finally {
      setLoading(false);
    }
  };

  const savePortfolio = async (updatedPortfolio, silent = false) => {
    setSyncing(true);
    try {
      await api.put('/profile/portfolio', { portfolio: updatedPortfolio });
      setPortfolio(updatedPortfolio);
      if (!silent) {
        toast.success('Professional showcase synchronized.');
        resetForm(); // Reset form after successful save
        setConfirmModal({ isOpen: false, index: null, type: 'delete' });
        setIsReorderMode(false);
      }
    } catch (error) {
      toast.error('Failed to update showcase.');
    } finally {
      setSyncing(false);
    }
  };

  // Function to reset form completely
  const resetForm = () => {
    setShowAddForm(false);
    setEditingIndex(null);
    setNewProject({ title: '', description: '', link: '', imageUrl: '' });
  };

  const handleTriggerAdd = () => {
    resetForm(); // Reset form before adding new
    setConfirmModal({
      isOpen: true,
      index: null,
      type: 'add',
      title: 'Initialize Showcase?',
      message: 'This will add a new project entry to your professional portfolio.',
      confirmText: 'Continue'
    });
  };

  const handleAdd = () => {
    if (!newProject.title) {
      return toast.error('Project Title is a mandatory identifier.');
    }
    
    let updated;
    if (editingIndex !== null) {
      updated = [...portfolio];
      updated[editingIndex] = newProject;
    } else {
      updated = [...portfolio, newProject];
    }
    savePortfolio(updated);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewProject(portfolio[index]);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = () => {
    const updated = portfolio.filter((_, i) => i !== confirmModal.index);
    savePortfolio(updated);
  };

  const moveItem = (index, direction) => {
    const updated = [...portfolio];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= updated.length) return;
    
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setPortfolio(updated);
  };

  const finalizeReorder = () => {
    savePortfolio(portfolio);
  };

  // Close form handler
  const handleCloseForm = () => {
    resetForm();
  };
  
  // Handle image preview
  const handleImagePreview = (imageUrl, title) => {
    if (imageUrl) {
      setPreviewImage(imageUrl);
      setPreviewTitle(title);
    }
  };

  if (loading) return <div className="dash-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh'}}><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dash-page" style={{ pointerEvents: 'auto' }}>
      <div className="dash-page-header">
        <h1 className="dash-page-title">Professional Showcase</h1>
        <p className="dash-page-subtitle">Curate your high-impact projects and career milestones for global visibility.</p>
      </div>

      <div className="dash-section reveal">
        <div className="dash-section-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Rocket size={16} style={{ color: 'var(--accent)' }} />
            <span>Active Showcases</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {portfolio.length > 1 && (
              <button 
                className={`btn ${isReorderMode ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => isReorderMode ? finalizeReorder() : setIsReorderMode(true)}
                title={isReorderMode ? "Save the new project order" : "Reorder your showcase projects"}
                style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}
              >
                {isReorderMode ? <Save size={14} /> : <ListOrdered size={14} />} {isReorderMode ? 'Save Sequence' : 'Sequence Mode'}
              </button>
            )}
            {!showAddForm && !isReorderMode && (
              <button 
                className="btn btn-primary" 
                onClick={handleTriggerAdd}
                title="Add a new project to your showcase"
                style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}
              >
                <Plus size={14} /> New Project
              </button>
            )}
          </div>
        </div>

        {portfolio.length === 0 && !showAddForm ? (
          <div className="empty-state" style={{ padding: '64px 32px' }}>
            <div className="empty-state-icon" style={{ fontSize: '40px' }}>🚀</div>
            <div className="empty-state-text">Your professional showcase is currently unpopulated.</div>
            <button 
              className="btn btn-primary" 
              onClick={handleTriggerAdd} 
              style={{ marginTop: '24px', cursor: 'pointer', position: 'relative', zIndex: 10 }}
              title="Create your first showcase entry"
            >
              Initialize First Entry
            </button>
          </div>
        ) : (
          <div className="item-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: showAddForm ? '32px' : '0' }}>
            {portfolio.map((project, idx) => (
              <div 
                key={idx} 
                className={`item-card reveal ${isReorderMode ? 'reorder-card' : ''}`} 
                style={{ 
                  animationDelay: `${idx * 0.05}s`, 
                  padding: '24px', 
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
                        title="Move project up"
                        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button 
                        className="icon-btn sm" 
                        onClick={() => moveItem(idx, 'down')} 
                        disabled={idx === portfolio.length - 1}
                        title="Move project down"
                        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="portfolio-thumbnail"
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '16px', 
                      background: 'var(--bg-secondary)', 
                      border: '1px solid var(--border-subtle)', 
                      overflow: 'hidden', 
                      flexShrink: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: project.imageUrl ? 'pointer' : 'default',
                      transition: 'transform 0.2s ease'
                    }}
                    title={project.imageUrl ? "Click to preview full screen" : "No image provided"}
                    onClick={() => handleImagePreview(project.imageUrl, project.title)}
                    onMouseEnter={(e) => {
                      if (project.imageUrl) e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (project.imageUrl) e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                )}
                
                <div className="item-info" style={{ flex: 1, marginLeft: isReorderMode ? '0' : '16px' }}>
                  <div className="item-title" style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{project.title}</div>
                  {!isReorderMode && (
                    <>
                      <div className="item-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{project.description}</div>
                      {project.link && (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            fontSize: '12px', 
                            color: 'var(--accent-light)', 
                            fontWeight: '700', 
                            marginTop: '12px', 
                            textDecoration: 'none',
                            cursor: 'pointer'
                          }}
                          title="View project live"
                        >
                          Experience Project <ExternalLink size={12} />
                        </a>
                      )}
                    </>
                  )}
                </div>
                
                {!isReorderMode && (
                  <div className="item-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleEdit(idx)} 
                      title="Edit this project entry"
                      style={{ 
                        padding: '8px 20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 10
                      }}
                    >
                      <Edit3 size={16} /> Edit
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setConfirmModal({ isOpen: true, index: idx, type: 'delete', title: 'Terminate Entry?', message: 'This will permanently delete the project from your professional showcase.', confirmText: 'Terminate' })} 
                      title="Delete this project permanently"
                      style={{ 
                        padding: '8px 20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        position: 'relative',
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
                  {editingIndex !== null ? 'Modify Showcase Entry' : 'Initialize Showcase Entry'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Define the parameters of your professional achievement.</p>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={handleCloseForm}
                title="Cancel and close form"
                style={{ 
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  padding: '10px 10px', 
                  borderRadius: '60px',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  position: 'relative',
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Showcase Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Next-Gen Financial Platform Redesign"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                title="Enter your project title"
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Operational Narrative</label>
              <textarea 
                className="form-input" 
                placeholder="Elaborate on the project's impact and your specific contributions..."
                rows={4}
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                style={{ resize: 'none' }}
                title="Describe your project and role"
              />
            </div>

            <div className="add-form-row" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Project URL Identifier</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://..."
                  value={newProject.link}
                  onChange={(e) => setNewProject({...newProject, link: e.target.value})}
                  title="Link to live project or demo"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Visual Asset URL</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://...image.jpg"
                  value={newProject.imageUrl}
                  onChange={(e) => setNewProject({...newProject, imageUrl: e.target.value})}
                  title="URL to project thumbnail image"
                />
              </div>
            </div>

            <div className="add-form-actions" style={{ marginTop: '32px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handleCloseForm}
                title="Cancel without saving"
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setConfirmModal({ isOpen: true, index: null, type: 'save', title: 'Authorize Entry?', message: 'This will synchronize the project entry with your global portfolio.', confirmText: 'Authorize' })} 
                disabled={syncing}
                title={syncing ? "Processing..." : (editingIndex !== null ? "Save your changes" : "Add new project")}
                style={{ cursor: syncing ? 'not-allowed' : 'pointer', pointerEvents: 'auto' }}
              >
                <Save size={16} /> {syncing ? 'Synchronizing...' : editingIndex !== null ? 'Update Entry' : 'Authorize Entry'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overview-tip reveal" style={{ animationDelay: '0.3s' }}>
        <Info size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span>
          <strong>Curator's Note</strong><br />
          Enable <strong>Sequence Mode</strong> to manage project hierarchy. High-quality visuals and concise impact statements significantly increase professional engagement.
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

      {/* Full Screen Image Preview Overlay with Portal */}
      {previewImage && createPortal(
        <div 
          className="modal-overlay" 
          onClick={() => setPreviewImage(null)} 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'var(--overlay-heavy)', 
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div 
            className="modal-content reveal" 
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              textAlign: 'center', 
              background: 'transparent', 
              padding: '20px',
              position: 'relative'
            }} 
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="modal-close" 
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                background: 'var(--overlay)',
                border: '1px solid var(--accent)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
              title="Close preview (ESC)"
            >
              <X size={20} />
            </button>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '900', 
              marginBottom: '32px', 
              color: 'var(--accent)', 
              letterSpacing: '1px', 
              textTransform: 'uppercase' 
            }}>
              {previewTitle || 'Project Preview'}
            </h3>
            <div style={{ 
              width: 'min(70vh, 70vw)', 
              height: 'min(70vh, 70vw)', 
              borderRadius: '20px', 
              margin: '0 auto', 
              border: '3px solid var(--accent)', 
              overflow: 'hidden', 
              boxShadow: '0 0 80px var(--accent-glow)', 
              background: '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={previewImage} 
                alt={previewTitle} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain' 
                }} 
              />
            </div>
            <p style={{ marginTop: '24px', color: 'var(--text-secondary)', fontSize: '12px' }}>
              Click outside or press ESC to close
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}