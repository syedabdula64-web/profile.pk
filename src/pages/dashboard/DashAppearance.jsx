import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Sparkles, Terminal, Mail, Save, Plus, X, Video } from 'lucide-react';
import './DashPages.css';

export default function DashAppearance() {
  const [initialData, setInitialData] = useState(null);
  const [appearance, setAppearance] = useState({ theme: 'dark', font: 'inter', buttonStyle: 'rounded' });
  const [media, setMedia] = useState({ youtubeUrl: '', spotifyUrl: '' });
  const [skills, setSkills] = useState([]);
  const [leadGenActive, setLeadGenActive] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [savingMedia, setSavingMedia] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  
  const [newSkill, setNewSkill] = useState('');
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const [showFontOptions, setShowFontOptions] = useState(false);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', title: '', message: '', confirmText: '', skillIndex: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/profile');
      const profile = data.profile;
      
      const appState = profile.appearance || { theme: 'dark', font: 'inter', buttonStyle: 'rounded' };
      const mediaState = profile.media || { youtubeUrl: '', spotifyUrl: '' };
      const skillsState = profile.skills || [];
      const leadState = profile.leadGenActive !== undefined ? profile.leadGenActive : true;

      setAppearance(appState);
      setMedia(mediaState);
      setSkills(skillsState);
      setLeadGenActive(leadState);
      
      setInitialData({
        appearance: JSON.stringify(appState),
        media: JSON.stringify(mediaState),
        skills: JSON.stringify(skillsState)
      });
    } catch (error) {
      toast.error('Failed to load aesthetic settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    setSavingAppearance(true);
    try {
      await api.put('/profile/appearance', { appearance });
      setInitialData(prev => ({ ...prev, appearance: JSON.stringify(appearance) }));
      toast.success('Visual identity updated.');
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
      toast.error('Failed to save aesthetic parameters.');
    } finally {
      setSavingAppearance(false);
    }
  };

  const handleSaveMedia = async () => {
    setSavingMedia(true);
    try {
      await api.put('/profile/media', { media });
      setInitialData(prev => ({ ...prev, media: JSON.stringify(media) }));
      toast.success('Rich media embeds synchronized.');
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
      toast.error('Failed to synchronize media.');
    } finally {
      setSavingMedia(false);
    }
  };

  const saveSkills = async (updatedSkills) => {
    setSavingSkills(true);
    try {
      await api.put('/profile/skills', { skills: updatedSkills });
      setSkills(updatedSkills);
      setInitialData(prev => ({ ...prev, skills: JSON.stringify(updatedSkills) }));
      setNewSkill('');
      toast.success('Core competencies synchronized.');
      setConfirmModal({ ...confirmModal, isOpen: false });
    } catch (error) {
      toast.error('Failed to update competencies.');
    } finally {
      setSavingSkills(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) {
      toast.error('Please enter a skill to add.');
      return;
    }
    const updated = [...skills, newSkill.trim()];
    saveSkills(updated);
  };

  const confirmRemoveSkill = () => {
    if (confirmModal.skillIndex !== null) {
      const updated = skills.filter((_, i) => i !== confirmModal.skillIndex);
      saveSkills(updated);
    }
  };

  const handleRemoveSkill = (index, e) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      type: 'deleteSkill',
      title: 'Remove Core Competency?',
      message: `Are you sure you want to remove "${skills[index]}" from your core competencies?`,
      confirmText: 'Remove',
      skillIndex: index
    });
  };

  const toggleLeadGen = async (e) => {
    const val = e.target.checked;
    setLeadGenActive(val);
    try {
      await api.put('/profile/lead-gen', { leadGenActive: val });
      toast.success(val ? 'Inbound Channel: Active' : 'Inbound Channel: Terminated');
    } catch (error) {
      toast.error('Failed to update channel status.');
      setLeadGenActive(!val);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showThemeOptions && !event.target.closest('.theme-selector')) {
        setShowThemeOptions(false);
      }
      if (showFontOptions && !event.target.closest('.font-selector')) {
        setShowFontOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showThemeOptions, showFontOptions]);

  // Theme options
  const themeOptions = [
    { value: 'dark', label: 'Obsidian Night (Default)' },
    { value: 'light', label: 'Crystal White' },
    { value: 'glass', label: 'Ethereal Glass' },
    { value: 'neon', label: 'Matrix Neural' },
    { value: 'cyberpunk', label: 'Neo-Tokyo Protocol' }
  ];

  // Font options
  const fontOptions = [
    { value: 'inter', label: 'Inter (Elite Sans)' },
    { value: 'space-grotesk', label: 'Space Grotesk (Tech)' },
    { value: 'poppins', label: 'Poppins (Soft)' },
    { value: 'mono', label: 'Monospace (Neural)' }
  ];

  const getSelectedThemeLabel = () => {
    const selected = themeOptions.find(opt => opt.value === appearance.theme);
    return selected ? selected.label : 'Select Environment';
  };

  const getSelectedFontLabel = () => {
    const selected = fontOptions.find(opt => opt.value === appearance.font);
    return selected ? selected.label : 'Select Typography';
  };

  if (loading) return <div className="dash-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh'}}><div className="spinner spinner-lg" /></div>;

  const hasAppearanceChanged = initialData && JSON.stringify(appearance) !== initialData.appearance;
  const hasMediaChanged = initialData && JSON.stringify(media) !== initialData.media;

  return (
    <div className="dash-page" style={{ pointerEvents: 'auto' }}>
      <div className="dash-page-header">
        <h1 className="dash-page-title">Digital Aesthetics</h1>
        <p className="dash-page-subtitle">Refine the visual parameters and interactive modules of your professional ecosystem.</p>
      </div>

      {/* Theme Selection */}
      <div className="dash-section reveal" style={{ position: 'relative', zIndex: 10 }}>
        <div className="dash-section-title">
          <Sparkles size={16} style={{ color: 'var(--accent)' }} />
          Bespoke Theme
        </div>
        
        {/* Visual Environment - Custom Dropdown */}
        <div className="form-group" style={{ marginBottom: '24px', position: 'relative' }}>
          <label className="form-label">Visual Environment</label>
          <div className="theme-selector" style={{ position: 'relative', zIndex: 1000 }}>
            <div 
              className="custom-select-trigger"
              onClick={() => {
                setShowThemeOptions(!showThemeOptions);
                setShowFontOptions(false);
              }}
              style={{
                background: '#050505',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--text-primary)'
              }}
            >
              <span>{getSelectedThemeLabel()}</span>
              <span style={{ transform: showThemeOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </div>
            {showThemeOptions && (
              <div className="custom-select-options" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#0a0a0a',
                border: '1px solid var(--border-accent)',
                borderRadius: '12px',
                marginTop: '4px',
                zIndex: 9999,
                maxHeight: '200px',
                overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
              }}>
                {themeOptions.map(option => (
                  <div
                    key={option.value}
                    className="custom-select-option"
                    onClick={() => {
                      setAppearance({ ...appearance, theme: option.value });
                      setShowThemeOptions(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      transition: 'background 0.2s',
                      background: appearance.theme === option.value ? 'rgba(184, 150, 74, 0.1)' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => {
                      if (appearance.theme !== option.value) {
                        e.currentTarget.style.background = 'transparent';
                      } else {
                        e.currentTarget.style.background = 'rgba(184, 150, 74, 0.1)';
                      }
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Typography System - Custom Dropdown */}
        <div className="form-group" style={{ marginBottom: '24px', position: 'relative' }}>
          <label className="form-label">Typography System</label>
          <div className="font-selector" style={{ position: 'relative', zIndex: 999 }}>
            <div 
              className="custom-select-trigger"
              onClick={() => {
                setShowFontOptions(!showFontOptions);
                setShowThemeOptions(false);
              }}
              style={{
                background: '#050505',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: 'var(--text-primary)'
              }}
            >
              <span>{getSelectedFontLabel()}</span>
              <span style={{ transform: showFontOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </div>
            {showFontOptions && (
              <div className="custom-select-options" style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#0a0a0a',
                border: '1px solid var(--border-accent)',
                borderRadius: '12px',
                marginTop: '4px',
                zIndex: 9999,
                maxHeight: '200px',
                overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
              }}>
                {fontOptions.map(option => (
                  <div
                    key={option.value}
                    className="custom-select-option"
                    onClick={() => {
                      setAppearance({ ...appearance, font: option.value });
                      setShowFontOptions(false);
                    }}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      transition: 'background 0.2s',
                      background: appearance.font === option.value ? 'rgba(184, 150, 74, 0.1)' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => {
                      if (appearance.font !== option.value) {
                        e.currentTarget.style.background = 'transparent';
                      } else {
                        e.currentTarget.style.background = 'rgba(184, 150, 74, 0.1)';
                      }
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {hasAppearanceChanged && (
          <div className="reveal">
            <button 
              className="btn btn-primary" 
              onClick={() => setConfirmModal({
                isOpen: true,
                type: 'saveAppearance',
                title: 'Apply Aesthetic Changes?',
                message: 'This will update your profile\'s visual theme and typography settings across the entire ecosystem.',
                confirmText: 'Apply Changes'
              })} 
              disabled={savingAppearance}
              title={savingAppearance ? "Saving..." : "Apply theme and typography settings"}
              style={{ cursor: savingAppearance ? 'not-allowed' : 'pointer', pointerEvents: 'auto' }}
            >
              <Save size={16} /> {savingAppearance ? 'Synchronizing Aesthetics...' : 'Apply Aesthetics'}
            </button>
          </div>
        )}
      </div>

      {/* Media Embeds */}
      <div className="dash-section reveal" style={{ animationDelay: '0.1s', position: 'relative', zIndex: 9 }}>
        <div className="dash-section-title">
          <Video size={16} style={{ color: 'var(--accent)' }} />
          Rich Media Integration
        </div>
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">YouTube Visual Feed (URL)</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://www.youtube.com/watch?v=..."
            value={media.youtubeUrl}
            onChange={e => setMedia({ ...media, youtubeUrl: e.target.value })}
            style={{ background: '#050505' }}
            title="Enter a YouTube video URL to embed on your profile"
          />
        </div>
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Spotify Auditory Stream (URL)</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://open.spotify.com/track/..."
            value={media.spotifyUrl}
            onChange={e => setMedia({ ...media, spotifyUrl: e.target.value })}
            style={{ background: '#050505' }}
            title="Enter a Spotify track/playlist URL to embed on your profile"
          />
        </div>
        
        {hasMediaChanged && (
          <div className="reveal">
            <button 
              className="btn btn-primary" 
              onClick={() => setConfirmModal({
                isOpen: true,
                type: 'saveMedia',
                title: 'Update Media Embeds?',
                message: 'This will synchronize your YouTube and Spotify media integrations with your public profile.',
                confirmText: 'Apply Media'
              })} 
              disabled={savingMedia}
              title={savingMedia ? "Saving..." : "Apply media embeds"}
              style={{ cursor: savingMedia ? 'not-allowed' : 'pointer', pointerEvents: 'auto' }}
            >
              <Save size={16} /> {savingMedia ? 'Synchronizing Media...' : 'Apply Media Stream'}
            </button>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="dash-section reveal" style={{ animationDelay: '0.2s', position: 'relative', zIndex: 8 }}>
        <div className="dash-section-title">
          <Terminal size={16} style={{ color: 'var(--accent)' }} />
          Core Competencies
        </div>
        <div className="skills-input-row" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Distributed Systems, Neural UI, FinTech Architecture"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
            style={{ background: '#050505' }}
            title="Enter a skill and press Enter or click Add"
          />
          <button 
            className="btn btn-secondary" 
            onClick={addSkill} 
            disabled={savingSkills || !newSkill.trim()} 
            style={{ padding: '0 24px', cursor: (savingSkills || !newSkill.trim()) ? 'not-allowed' : 'pointer' }}
            title={!newSkill.trim() ? "Enter a skill first" : "Add new skill"}
          >
            {savingSkills ? <div className="spinner spinner-sm" /> : <Plus size={18} />}
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {skills.map((skill, idx) => (
            <div 
              key={idx} 
              className="reveal" 
              style={{ 
                animationDelay: `${idx * 0.05}s`, 
                background: 'var(--bg-secondary)', 
                padding: '10px 16px', 
                borderRadius: '12px', 
                fontSize: '13px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                border: '1px solid var(--border-subtle)', 
                fontWeight: '700', 
                color: 'var(--accent-light)'
              }}
            >
              <span>{skill}</span>
              <button 
                onClick={(e) => handleRemoveSkill(idx, e)} 
                disabled={savingSkills}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#ef4444', 
                  cursor: savingSkills ? 'not-allowed' : 'pointer', 
                  pointerEvents: 'auto',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  opacity: savingSkills ? 0.5 : 1,
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease',
                  width: '24px',
                  height: '24px'
                }}
                title="Remove this skill"
                onMouseEnter={(e) => {
                  if (!savingSkills) e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {skills.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>No core competencies initialized.</span>}
        </div>
      </div>

      {/* Lead Gen */}
      <div className="dash-section reveal" style={{ animationDelay: '0.3s', position: 'relative', zIndex: 7 }}>
        <div className="dash-section-title">
          <Mail size={16} style={{ color: 'var(--accent)' }} />
          Inbound Communication
        </div>
        <div className="item-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="toggle-info" style={{ flex: 1 }}>
            <div className="toggle-label" style={{ fontSize: '16px', fontWeight: '800' }}>Contact Interface ("Initialize Dialogue")</div>
            <div className="toggle-desc" style={{ marginTop: '4px' }}>Enable a secure inbound channel for visitors to initialize professional correspondence.</div>
          </div>
          <label className="toggle-switch" style={{ cursor: 'pointer' }} title={leadGenActive ? "Click to disable inbound messages" : "Click to enable inbound messages"}>
            <input
              type="checkbox"
              checked={leadGenActive}
              onChange={toggleLeadGen}
              style={{ cursor: 'pointer' }}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        isLoading={savingAppearance || savingMedia || savingSkills}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          if (confirmModal.type === 'saveAppearance') handleSaveAppearance();
          else if (confirmModal.type === 'saveMedia') handleSaveMedia();
          else if (confirmModal.type === 'deleteSkill') confirmRemoveSkill();
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type === 'deleteSkill' ? 'danger' : 'success'}
      />
    </div>
  );
}