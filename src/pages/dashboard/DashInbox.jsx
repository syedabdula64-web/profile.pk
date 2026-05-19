import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Inbox, Mail, Calendar, User as UserIcon, CheckCircle, Shield, MessageSquare } from 'lucide-react';
import './DashPages.css';

export default function DashInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/profile/messages');
      setMessages(data.messages || []);
    } catch (error) {
      toast.error('Failed to synchronize inbound transmissions.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, index) => {
    try {
      await api.put(`/profile/messages/${id}/read`);
      const updated = [...messages];
      updated[index].isRead = true;
      setMessages(updated);
      toast.success('Transmission marked as processed.');
    } catch (error) {
      toast.error('Failed to update transmission status.');
    }
  };

  if (loading) return <div className="dash-page" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh'}}><div className="spinner spinner-lg" /></div>;

  return (
    <div className="dash-page">
      <div className="dash-page-header">
        <h1 className="dash-page-title">Communication Vault</h1>
        <p className="dash-page-subtitle">Manage inbound inquiries and professional correspondence from your public ecosystem.</p>
      </div>

      <div className="dash-section reveal">
        <div className="dash-section-title">
          <Inbox size={16} style={{ color: 'var(--accent)' }} />
          Inbound Transmissions
        </div>

        {messages.length === 0 ? (
          <div className="empty-state" style={{ padding: '64px 32px' }}>
            <div className="empty-state-icon" style={{ fontSize: '40px' }}>📥</div>
            <div className="empty-state-text">Your communication vault is currently empty.</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '12px', fontWeight: '600' }}>
              Ensure the "Initialize Dialogue" interface is active in Aesthetics.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {messages.map((msg, idx) => (
              <div 
                key={msg._id} 
                className="reveal"
                style={{ 
                  background: msg.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(184, 150, 74, 0.03)', 
                  border: `1px solid ${msg.isRead ? 'var(--border-subtle)' : 'var(--border-accent)'}`,
                  padding: '24px', 
                  borderRadius: '20px',
                  animationDelay: `${idx * 0.05}s`,
                  position: 'relative'
                }}
              >
                {!msg.isRead && (
                  <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--accent)', color: '#000', fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    New Entry
                  </div>
                )}
                
                <div className="inbox-msg-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)' }}>{msg.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Mail size={12} style={{ color: 'var(--accent)' }} />
                        <a href={`mailto:${msg.email}`} style={{ fontSize: '13px', color: 'var(--accent-light)', textDecoration: 'none', fontWeight: '700' }}>{msg.email}</a>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    <Calendar size={14} />
                    {new Date(msg.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div style={{ 
                  fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', 
                  background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '14px', 
                  border: '1px solid rgba(255,255,255,0.02)', position: 'relative' 
                }}>
                  <div style={{ position: 'absolute', top: '-10px', left: '20px', background: '#0c0c0c', padding: '0 8px', fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Message Content
                  </div>
                  {msg.message}
                </div>

                {!msg.isRead && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ marginTop: '20px', padding: '8px 20px', fontSize: '12px' }}
                    onClick={() => markAsRead(msg._id, idx)}
                  >
                    <CheckCircle size={16} /> Mark as Processed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overview-tip reveal" style={{ animationDelay: '0.3s' }}>
        <span style={{ borderLeft: '4px solid var(--accent)' }}></span>
        <span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Shield size={14} style={{ color: 'var(--accent)' }} />
            <strong>Secure Correspondence</strong>
          </div>
          All inbound transmissions are encrypted. Use the provided email identifiers to continue professional dialogue with your network.
        </span>
      </div>
    </div>
  );
}
