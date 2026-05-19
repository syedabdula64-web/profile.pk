import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import './NotificationDropdown.css';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  // Track mobile state
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isMobile]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && isMobile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1999,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="notification-dropdown-container" ref={dropdownRef}>
        <button
          className={`notification-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Notifications"
          title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <span className="notification-icon">🔔</span>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {isOpen && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-actions">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} title="Mark all as read">
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} title="Clear all notifications">
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <div className="empty-icon">🎐</div>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                  >
                    <div className="notification-item-content">
                      <div className="notification-item-title">{n.title}</div>
                      <div className="notification-item-body">{n.body}</div>
                      <div className="notification-item-time">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    {!n.isRead && <div className="unread-dot" />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
