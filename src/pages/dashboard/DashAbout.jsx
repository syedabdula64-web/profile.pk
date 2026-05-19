import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { Camera, Trash2, Eye, Plus, Save, Shield, MessageSquare, Phone, CheckCircle2, ListOrdered, GripVertical, ChevronUp, ChevronDown, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ImageCropperModal from '../../components/ImageCropperModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import './DashPages.css';

export default function DashAbout() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Action specific loading states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  const [bio, setBio] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [avatarPrivacy, setAvatarPrivacy] = useState(user?.isProfilePicPublic || false);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewingImage, setViewingImage] = useState(false);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', title: '', message: '', confirmText: '', index: null });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user?.isProfilePicPublic !== undefined) {
      setAvatarPrivacy(user.isProfilePicPublic);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/profile');
      setProfile(data.profile);
      setBio(data.profile.bio || '');
      setPhoneNumbers(data.profile.phoneNumbers || []);
    } catch (error) {
      toast.error('Failed to load identity metadata.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('Asset size exceeds 5MB limit.');
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      e.target.value = '';
    }
  };

  const handleAvatarUpload = async (croppedBlob) => {
    setSelectedImage(null);
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('avatar', croppedBlob, 'identity-asset.jpg');

    const toastId = toast.loading('Synchronizing identity asset...');
    try {
      const { data } = await api.post('/user/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ profilePic: data.profilePic });
      toast.success('Identity asset synchronized.', { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Synchronization failure.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsProcessing(true);
    const toastId = toast.loading('Terminating asset...');
    try {
      await api.delete('/user/avatar');
      updateUser({ profilePic: '' });
      toast.success('Identity asset terminated.', { id: toastId });
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
      toast.error('Termination failure.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePrivacy = async (e) => {
    const isPublic = e.target.checked;
    setAvatarPrivacy(isPublic);
    
    try {
      await api.put('/user/avatar-privacy', { isPublic });
      updateUser({ isProfilePicPublic: isPublic });
      toast.success(isPublic ? 'Asset visibility: Public' : 'Asset visibility: Encrypted');
    } catch (error) {
      toast.error('Privacy synchronization failure.');
      setAvatarPrivacy(!isPublic);
    }
  };

  const saveBio = async () => {
    setIsProcessing(true);
    try {
      await api.put('/profile/bio', { bio });
      toast.success('Professional narrative updated.');
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
      toast.error('Narrative update failure.');
    } finally {
      setIsProcessing(false);
    }
  };

  const savePhones = async (updatedPhones = phoneNumbers) => {
    setIsProcessing(true);
    try {
      const validPhones = updatedPhones.filter(p => p.number.trim() !== '');
      await api.put('/profile/phones', { phoneNumbers: validPhones });
      setPhoneNumbers(validPhones);
      toast.success('Communication channels synchronized.');
      setConfirmModal({ ...confirmModal, isOpen: false });
      setIsReorderMode(false);
    } catch (error) {
      toast.error('Channel synchronization failure.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addPhone = () => {
    setPhoneNumbers([...phoneNumbers, { label: 'Primary', number: '' }]);
  };

  const updatePhone = (index, field, value) => {
    const updated = [...phoneNumbers];
    updated[index][field] = value;
    setPhoneNumbers(updated);
  };

  const removePhone = (index) => {
    setConfirmModal({
      isOpen: true,
      type: 'deletePhone',
      title: 'Remove Communication Channel?',
      message: `This will permanently remove "${phoneNumbers[index].label || 'Channel'}" from your contact information.`,
      confirmText: 'Remove',
      index: index
    });
  };

  const confirmRemovePhone = () => {
    const updated = phoneNumbers.filter((_, i) => i !== confirmModal.index);
    setPhoneNumbers(updated);
    setConfirmModal({ ...confirmModal, isOpen: false });
    toast.success('Communication channel removed.');
  };

  const moveItem = (index, direction) => {
    const updated = [...phoneNumbers];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= updated.length) return;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setPhoneNumbers(updated);
  };

  if (loading) return <div className="dash-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh'}}><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dash-page" style={{ pointerEvents: 'auto' }}>
      <div className="dash-page-header">
        <h1 className="dash-page-title">Identity Profile</h1>
        <p className="dash-page-subtitle">Refine the digital representation of your professional persona.</p>
      </div>

      {/* Avatar Section */}
      <div className="dash-section reveal">
        <div className="dash-section-title">
          <Camera size={16} style={{ color: 'var(--accent)' }} />
          Identity Imagery
        </div>
        <div className="avatar-upload-area" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)', pointerEvents: 'auto' }}>
          <div className="avatar-preview" title="Current profile picture">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Identity" />
            ) : (
              <span style={{ color: '#000' }}>{user?.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="avatar-upload-info">
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Visual Asset</h3>
            <p style={{ marginBottom: '20px' }}>High-resolution imagery enhances professional credibility. Recommended: 800x800px.</p>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleAvatarSelect}
            />
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  fileInputRef.current?.click();
                }} 
                disabled={isProcessing}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
                title="Upload a new profile picture (max 5MB)"
              >
                {isProcessing ? 'Processing...' : 'Update Identity Photo'}
              </button>
              {user?.profilePic && (
                <>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setViewingImage(true)}
                    title="View profile picture in full screen"
                  >
                    <Eye size={16} /> Preview
                  </button>
                  <button 
                    className="btn btn-secondary danger" 
                    style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }} 
                    onClick={() => setConfirmModal({ isOpen: true, type: 'deleteAvatar', title: 'Terminate Identity Asset?', message: 'This will permanently remove your profile imagery from our secure registries.', confirmText: 'Terminate' })}
                    disabled={isProcessing}
                    title='Remove profile picture permanently'
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
            
            {/* Privacy Toggle */}
            {user?.profilePic && (
              <div className="toggle-row" style={{ marginTop: '0', padding: '16px', border: 'none', borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div className="toggle-label">Profile Image Privacy</div>
                  <div className="toggle-desc">Control who can view your identity asset</div>
                </div>
                <label className="toggle-switch" title={avatarPrivacy ? "Currently public - Click to make private" : "Currently private - Click to make public"}>
                  <input 
                    type="checkbox" 
                    checked={avatarPrivacy}
                    onChange={handleTogglePrivacy}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {selectedImage && (
        <ImageCropperModal
          imageSrc={selectedImage}
          onCancel={() => setSelectedImage(null)}
          onSave={handleAvatarUpload}
        />
      )}

      {/* Bio Section */}
      <div className="dash-section reveal" style={{ animationDelay: '0.1s' }}>
        <div className="dash-section-title">
          <MessageSquare size={16} style={{ color: 'var(--accent)' }} />
          Professional Narrative
        </div>
        <textarea 
          className="form-input" 
          placeholder="Describe your professional journey..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
          rows={5}
          style={{ resize: 'none', padding: '20px', fontSize: '16px', lineHeight: '1.6', pointerEvents: 'auto' }}
          title="Write your professional bio (max 300 characters)"
        />
        <div style={{ marginTop: '24px' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => setConfirmModal({ isOpen: true, type: 'saveBio', title: 'Authorize Narrative?', message: 'This will update your public bio across the entire Profile.pk ecosystem.', confirmText: 'Authorize' })} 
            disabled={isProcessing || bio === (profile?.bio || '')}
            title={bio === (profile?.bio || '') ? "No changes to save" : "Save your professional bio"}
          >
            <Save size={16} /> {isProcessing ? 'Processing...' : 'Update Narrative'}
          </button>
        </div>
      </div>

      {/* Phone Numbers Section */}
      <div className="dash-section reveal" style={{ animationDelay: '0.2s' }}>
        <div className="dash-section-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Phone size={16} style={{ color: 'var(--accent)' }} />
            Communication Channels
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {phoneNumbers.length > 1 && (
              <button 
                className={`btn ${isReorderMode ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => isReorderMode ? setConfirmModal({ isOpen: true, type: 'savePhones', title: 'Save Sequence?', message: 'This will update the display order of your contact channels.', confirmText: 'Save Sequence' }) : setIsReorderMode(true)}
                title={isReorderMode ? "Save the new channel order" : "Reorder communication channels"}
              >
                {isReorderMode ? <Save size={14} /> : <ListOrdered size={14} />} {isReorderMode ? 'Save Sequence' : 'Sequence Mode'}
              </button>
            )}
            {!isReorderMode && (
              <button 
                className="btn btn-secondary" 
                onClick={addPhone} 
                style={{ padding: '8px 16px', fontSize: '12px' }}
                title="Add a new communication channel"
              >
                <Plus size={14} /> Add Channel
              </button>
            )}
          </div>
        </div>
        
        <div className="item-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {phoneNumbers.map((phone, idx) => (
            <div key={idx} className={`item-card reveal ${isReorderMode ? 'reorder-card' : ''}`} style={{ padding: '20px', background: 'var(--surface-muted)', pointerEvents: 'auto' }}>
              {isReorderMode ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '16px' }}>
                  <GripVertical size={18} style={{ color: 'var(--text-muted)' }} title="Drag handle - Not yet implemented, use arrows for now" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button 
                      className="icon-btn sm" 
                      onClick={() => moveItem(idx, 'up')} 
                      disabled={idx === 0}
                      title="Move channel up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button 
                      className="icon-btn sm" 
                      onClick={() => moveItem(idx, 'down')} 
                      disabled={idx === phoneNumbers.length - 1}
                      title="Move channel down"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              ) : null}
              
              <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <input 
                    type="text" 
                    className="form-input sm" 
                    placeholder="Label (e.g. WhatsApp)"
                    value={phone.label}
                    onChange={(e) => updatePhone(idx, 'label', e.target.value)}
                    disabled={isReorderMode}
                    title="Channel label (e.g., WhatsApp, Office, Personal)"
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <input 
                    type="text" 
                    className="form-input sm" 
                    placeholder="+92 XXX XXXXXXX"
                    value={phone.number}
                    onChange={(e) => updatePhone(idx, 'number', e.target.value)}
                    disabled={isReorderMode}
                    title="Phone number with country code"
                  />
                </div>
              </div>
              
              {!isReorderMode && (
                <button 
                  className="btn btn-secondary danger" 
                  style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}  
                  onClick={() => removePhone(idx)} 
                  title={`Remove ${phone.label || 'channel'} permanently`}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
          {phoneNumbers.length === 0 && <div className="empty-state">No communication channels initialized.</div>}
        </div>
        
        {!isReorderMode && phoneNumbers.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => setConfirmModal({ isOpen: true, type: 'savePhones', title: 'Synchronize Channels?', message: 'This will authorize your contact information for public use.', confirmText: 'Authorize' })}
              disabled={isProcessing}
              title="Save all communication channels"
            >
              <Save size={16} /> {isProcessing ? 'Processing...' : 'Authorize Channels'}
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        isLoading={isProcessing}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          if (confirmModal.type === 'deleteAvatar') handleDeleteAvatar();
          else if (confirmModal.type === 'deletePhone') confirmRemovePhone();
          else if (confirmModal.type === 'saveBio') saveBio();
          else if (confirmModal.type === 'savePhones') savePhones();
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type.startsWith('delete') ? 'danger' : 'success'}
      />

      {/* Full Screen Image Preview Overlay with Portal */}
      {viewingImage && user?.profilePic && createPortal(
        <div className="modal-overlay" onClick={() => setViewingImage(false)} style={{ 
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
        }}>
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
              onClick={() => setViewingImage(false)}
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
              Identity Asset Preview
            </h3>
            <div style={{ 
              width: 'min(70vh, 70vw)', 
              height: 'min(70vh, 70vw)', 
              borderRadius: '40px', 
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
                src={user.profilePic} 
                alt="Identity Preview" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
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