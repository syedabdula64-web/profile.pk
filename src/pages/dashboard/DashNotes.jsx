import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { StickyNote, Plus, Trash2, Save, Info, MessageSquare, ChevronUp, ChevronDown, Edit3, X, GripVertical, ListOrdered } from 'lucide-react';
import './DashPages.css';

export default function DashNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action specific loading states
  const [syncing, setSyncing] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, index: null, type: 'delete' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/profile');
      setNotes(data.profile.notes || []);
    } catch (error) {
      toast.error('Failed to synchronize digital memos.');
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async (updatedNotes, silent = false) => {
    setSyncing(true);
    try {
      await api.put('/profile/notes', { notes: updatedNotes });
      setNotes(updatedNotes);
      if (!silent) {
        toast.success('Memos synchronized.');
        resetForm();
        setConfirmModal({ isOpen: false, index: null, type: 'delete' });
        setIsReorderMode(false);
      }
    } catch (error) {
      toast.error('Failed to update memos.');
    } finally {
      setSyncing(false);
    }
  };

  // Function to reset form completely
  const resetForm = () => {
    setShowAddForm(false);
    setEditingIndex(null);
    setNewNote({ title: '', content: '' });
  };

  const handleTriggerAdd = () => {
    resetForm();
    setConfirmModal({
      isOpen: true,
      index: null,
      type: 'add',
      title: 'Initialize Memo?',
      message: 'This will add a new digital memo to your professional narrative ecosystem.',
      confirmText: 'Continue'
    });
  };

  const handleAdd = () => {
    if (!newNote.title || !newNote.content) {
      return toast.error('Both Title and Content are mandatory identifiers.');
    }
    
    let updated;
    if (editingIndex !== null) {
      updated = [...notes];
      updated[editingIndex] = newNote;
    } else {
      updated = [...notes, newNote];
    }
    saveNotes(updated);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewNote(notes[index]);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = () => {
    const updated = notes.filter((_, i) => i !== confirmModal.index);
    saveNotes(updated);
  };

  const moveItem = (index, direction) => {
    const updated = [...notes];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= updated.length) return;
    
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setNotes(updated);
  };

  const finalizeReorder = () => {
    saveNotes(notes);
  };
  
  // Close form handler
  const handleCloseForm = () => {
    resetForm();
  };

  if (loading) return <div className="dash-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh'}}><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dash-page" style={{ pointerEvents: 'auto' }}>
      <div className="dash-page-header">
        <h1 className="dash-page-title">Digital Memos</h1>
        <p className="dash-page-subtitle">Publish important announcements, personal insights, or technical documentation.</p>
      </div>

      <div className="dash-section reveal">
        <div className="dash-section-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StickyNote size={16} style={{ color: 'var(--accent)' }} />
            <span>Active Memos</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {notes.length > 1 && (
              <button 
                className={`btn ${isReorderMode ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => isReorderMode ? finalizeReorder() : setIsReorderMode(true)}
                style={{ cursor: 'pointer', zIndex: 10 }}
                title={isReorderMode ? "Save the new memo order" : "Reorder your digital memos"}
              >
                {isReorderMode ? <Save size={14} /> : <ListOrdered size={14} />} {isReorderMode ? 'Save Sequence' : 'Sequence Mode'}
              </button>
            )}
            {!showAddForm && !isReorderMode && (
              <button 
                className="btn btn-primary" 
                onClick={handleTriggerAdd}
                style={{ cursor: 'pointer', zIndex: 10 }}
                title="Add a new digital memo"
              >
                <Plus size={14} /> New Memo
              </button>
            )}
          </div>
        </div>

        {notes.length === 0 && !showAddForm ? (
          <div className="empty-state" style={{ padding: '64px 32px' }}>
            <div className="empty-state-icon" style={{ fontSize: '40px' }}>📝</div>
            <div className="empty-state-text">Your memo repository is currently empty.</div>
            <button 
              className="btn btn-primary" 
              onClick={handleTriggerAdd} 
              style={{ marginTop: '24px', cursor: 'pointer', zIndex: 10 }}
              title="Create your first digital memo"
            >
              Initialize First Memo
            </button>
          </div>
        ) : (
          <div className="item-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: showAddForm ? '32px' : '0' }}>
            {notes.map((note, idx) => (
              <div 
                key={idx} 
                className={`item-card reveal ${isReorderMode ? 'reorder-card' : ''}`} 
                style={{ 
                  animationDelay: `${idx * 0.05}s`, 
                  padding: '24px', 
                  alignItems: 'flex-start',
                  pointerEvents: 'auto',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {isReorderMode ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '16px', alignSelf: 'center' }}>
                    <GripVertical size={18} style={{ color: 'var(--text-muted)' }} title="Drag to reorder (use arrows for precise positioning)" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button 
                        className="icon-btn sm" 
                        onClick={() => moveItem(idx, 'up')} 
                        disabled={idx === 0}
                        title="Move memo up"
                        style={{ cursor: 'pointer' }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button 
                        className="icon-btn sm" 
                        onClick={() => moveItem(idx, 'down')} 
                        disabled={idx === notes.length - 1}
                        title="Move memo down"
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
                    <MessageSquare size={22} />
                  </div>
                )}
                
                <div className="item-info" style={{ flex: 1, marginLeft: isReorderMode ? '0' : '16px' }}>
                  <div className="item-title" style={{ fontSize: '17px', fontWeight: '800', color: 'var(--accent-light)', marginBottom: '6px' }}>{note.title}</div>
                  {!isReorderMode && <div className="item-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{note.content}</div>}
                </div>
                
                {!isReorderMode && (
                  <div className="item-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleEdit(idx)} 
                      title="Edit this memo"
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
                      onClick={() => setConfirmModal({ isOpen: true, index: idx, type: 'delete', title: 'Terminate Memo?', message: 'This will permanently delete this memo from your ecosystem.', confirmText: 'Terminate' })} 
                      title="Delete this memo permanently"
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
                  {editingIndex !== null ? 'Modify Digital Memo' : 'Initialize Digital Memo'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Draft a new communication node for your public ecosystem.</p>
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
              <label className="form-label">Memo Identifier (Title)</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Critical Update: Q2 Roadmap"
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                title="Enter a descriptive title for your memo"
              />
            </div>
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Memo Narrative (Content)</label>
              <textarea 
                className="form-input" 
                placeholder="Articulate your thoughts or announcements..."
                rows={5}
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                style={{ resize: 'none' }}
                title="Write the content of your memo"
              />
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
                onClick={() => setConfirmModal({ isOpen: true, index: null, type: 'save', title: 'Authorize Memo?', message: 'Confirming will synchronize this memo with your digital ecosystem.', confirmText: 'Authorize' })} 
                disabled={syncing}
                title={syncing ? "Processing..." : (editingIndex !== null ? "Save your changes" : "Add new memo")}
                style={{ cursor: syncing ? 'not-allowed' : 'pointer' }}
              >
                <Save size={16} /> {syncing ? 'Synchronizing...' : editingIndex !== null ? 'Update Memo' : 'Authorize Memo'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overview-tip reveal" style={{ animationDelay: '0.3s' }}>
        <Info size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span>
          <strong>Announcement Strategy</strong><br />
          Enable <strong>Sequence Mode</strong> to manage the narrative hierarchy of your profile. Memos are ideal for long-form descriptions or temporary alerts.
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