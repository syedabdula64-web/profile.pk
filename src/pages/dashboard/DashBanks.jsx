import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import SearchableSelect from '../../components/SearchableSelect';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Landmark, Plus, Trash2, ShieldCheck, CreditCard, ChevronRight, Vault, ChevronUp, ChevronDown, Edit3, Save, X, GripVertical, ListOrdered } from 'lucide-react';
import './DashPages.css';

export default function DashBanks() {
  const [banks, setBanks] = useState([]);
  const [availableBanks, setAvailableBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action specific loading states
  const [syncing, setSyncing] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newBank, setNewBank] = useState({ bankName: '', accountTitle: '', accountNumber: '', iban: '' });
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, index: null, type: 'delete' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, banksRes] = await Promise.all([
        api.get('/profile'),
        api.get('/profile/banks/list')
      ]);
      setBanks(profileRes.data.profile.banks || []);
      setAvailableBanks(banksRes.data.banks || []);
    } catch (error) {
      toast.error('Failed to load financial metadata.');
    } finally {
      setLoading(false);
    }
  };

  const saveBanks = async (updatedBanks, silent = false) => {
    setSyncing(true);
    try {
      await api.put('/profile/banks', { banks: updatedBanks });
      setBanks(updatedBanks);
      if (!silent) {
        toast.success('Financial repository synchronized.');
        resetForm();
        setConfirmModal({ isOpen: false, index: null, type: 'delete' });
        setIsReorderMode(false);
      }
    } catch (error) {
      toast.error('Failed to update financial vault.');
    } finally {
      setSyncing(false);
    }
  };

  // Function to reset form completely
  const resetForm = () => {
    setShowAddForm(false);
    setEditingIndex(null);
    setNewBank({ bankName: '', accountTitle: '', accountNumber: '', iban: '' });
  };

  const handleTriggerAdd = () => {
    resetForm();
    setConfirmModal({
      isOpen: true,
      index: null,
      type: 'add',
      title: 'Initialize Financial Connection?',
      message: 'This will authorize a new institutional credential within your secure vault.',
      confirmText: 'Continue'
    });
  };

  const handleAdd = () => {
    if (!newBank.bankName || !newBank.accountTitle || !newBank.accountNumber) {
      return toast.error('Complete all mandatory fields to initialize account.');
    }
    
    let updated;
    if (editingIndex !== null) {
      updated = [...banks];
      updated[editingIndex] = newBank;
    } else {
      updated = [...banks, newBank];
    }
    saveBanks(updated);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewBank(banks[index]);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = () => {
    const updated = banks.filter((_, i) => i !== confirmModal.index);
    saveBanks(updated);
  };

  const moveItem = (index, direction) => {
    const updated = [...banks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= updated.length) return;
    
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setBanks(updated);
  };

  const finalizeReorder = () => {
    saveBanks(banks);
  };
  
  // Close form handler
  const handleCloseForm = () => {
    resetForm();
  };

  if (loading) return <div className="dash-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh'}}><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dash-page" style={{ pointerEvents: 'auto' }}>
      <div className="dash-page-header">
        <h1 className="dash-page-title">Financial Vault</h1>
        <p className="dash-page-subtitle">Securely manage your institutional credentials for professional transactions.</p>
      </div>

      <div className="dash-section reveal">
        <div className="dash-section-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Vault size={16} style={{ color: 'var(--accent)' }} />
            <span>Authorized Accounts</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {banks.length > 1 && (
              <button 
                className={`btn ${isReorderMode ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => isReorderMode ? finalizeReorder() : setIsReorderMode(true)}
                style={{ padding: '8px 16px', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer', zIndex: 10 }}
                title={isReorderMode ? "Save the new account order" : "Reorder your financial accounts"}
              >
                {isReorderMode ? <Save size={14} /> : <ListOrdered size={14} />} {isReorderMode ? 'Save Sequence' : 'Sequence Mode'}
              </button>
            )}
            {!showAddForm && !isReorderMode && (
              <button 
                className="btn btn-primary" 
                onClick={handleTriggerAdd} 
                style={{ padding: '8px 16px', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer', zIndex: 10 }}
                title="Add a new bank account"
              >
                <Plus size={14} /> New Account
              </button>
            )}
          </div>
        </div>

        {banks.length === 0 && !showAddForm ? (
          <div className="empty-state" style={{ padding: '64px 32px' }}>
            <div className="empty-state-icon" style={{ fontSize: '40px' }}>🏦</div>
            <div className="empty-state-text">Your financial vault is currently uninitialized.</div>
            <button 
              className="btn btn-primary" 
              onClick={handleTriggerAdd} 
              style={{ marginTop: '24px', cursor: 'pointer', zIndex: 10 }}
              title="Create your first bank account entry"
            >
              Initialize First Connection
            </button>
          </div>
        ) : (
          <div className="item-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: showAddForm ? '32px' : '0' }}>
            {banks.map((bank, idx) => (
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
                        title="Move account up"
                        style={{ cursor: 'pointer' }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button 
                        className="icon-btn sm" 
                        onClick={() => moveItem(idx, 'down')} 
                        disabled={idx === banks.length - 1}
                        title="Move account down"
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
                    <CreditCard size={22} />
                  </div>
                )}
                
                <div className="item-info" style={{ flex: 1, marginLeft: isReorderMode ? '0' : '16px' }}>
                  <div className="item-title" style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>{bank.bankName}</div>
                  {!isReorderMode && (
                    <div className="item-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                      {bank.accountTitle} <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', margin: '0 6px', color: 'var(--accent)' }} /> <span style={{ color: 'var(--accent-light)', fontWeight: '700' }}>{bank.accountNumber}</span>
                    </div>
                  )}
                </div>
                
                {!isReorderMode && (
                  <div className="item-actions" style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleEdit(idx)} 
                      title="Edit this bank account"
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
                      onClick={() => setConfirmModal({ isOpen: true, index: idx, type: 'delete', title: 'Terminate Connection?', message: 'This will sever the institutional link. Re-authorization will be required to restore routing.', confirmText: 'Terminate Connection' })} 
                      title="Delete this bank account permanently"
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
                  {editingIndex !== null ? 'Modify Financial Connection' : 'Initialize Financial Connection'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Provide precise institutional data to ensure seamless transaction routing.</p>
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
              <label className="form-label">Financial Institution</label>
              <SearchableSelect
                options={availableBanks.map(b => ({ value: b, label: b }))}
                value={newBank.bankName}
                onChange={(val) => setNewBank({ ...newBank, bankName: val })}
                placeholder="Search institutional registry..."
              />
            </div>

            <div className="add-form-row" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Account Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Full Legal Identity"
                  value={newBank.accountTitle}
                  onChange={(e) => setNewBank({ ...newBank, accountTitle: e.target.value })}
                  title="Enter the full name on the account"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Identifier</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Numeric credentials"
                  value={newBank.accountNumber}
                  onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                  title="Enter your account number"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">IBAN Standard (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="PKXX XXXX XXXX XXXX XXXX XXXX"
                value={newBank.iban}
                onChange={(e) => setNewBank({ ...newBank, iban: e.target.value })}
                style={{ letterSpacing: '1px' }}
                title="International Bank Account Number (optional)"
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
                onClick={() => setConfirmModal({ isOpen: true, index: null, type: 'save', title: 'Authorize Connection?', message: 'Confirming will synchronize these institutional credentials with your vault.', confirmText: 'Authorize' })} 
                disabled={syncing}
                title={syncing ? "Processing..." : (editingIndex !== null ? "Save your changes" : "Add new bank account")}
                style={{ cursor: syncing ? 'not-allowed' : 'pointer' }}
              >
                <Save size={16} /> {syncing ? 'Synchronizing...' : editingIndex !== null ? 'Update Connection' : 'Authorize Connection'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overview-tip reveal" style={{ animationDelay: '0.3s' }}>
        <ShieldCheck size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span>
          <strong>Encryption Standard</strong><br />
          Enable <strong>Sequence Mode</strong> to prioritize your primary accounts. All institutional data is handled with state-of-the-art encryption protocols.
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