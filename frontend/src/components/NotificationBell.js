import React, { useState, useEffect, useRef } from 'react';

export function NotificationBell({
  apiUrl = 'http://localhost:8080',
  getCsrfToken,
  onNavigate,
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        fetch(`${apiUrl}/api/notifications`, { credentials: 'include' }),
        fetch(`${apiUrl}/api/notifications/unread-count`, { credentials: 'include' }),
      ]);
      if (listRes.ok) {
        const data = await listRes.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.unreadCount || 0);
      }
    } catch (err) {
      // quiet fail for polling
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [apiUrl]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function markAsRead(id, link) {
    try {
      const csrfToken = await getCsrfToken();
      await fetch(`${apiUrl}/api/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {}

    if (link && onNavigate) {
      setOpen(false);
      onNavigate(link);
    }
  }

  async function markAllAsRead() {
    try {
      const csrfToken = await getCsrfToken();
      await fetch(`${apiUrl}/api/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': csrfToken },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {}
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        type="button"
        className="bell-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        title="Notifications"
      >
        <span className="bell-icon" aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="bell-badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notif-dropdown-header">
            <strong>Notifications ({unreadCount} unread)</strong>
            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-read-btn"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-dropdown-list">
            {notifications.length === 0 ? (
              <p className="notif-empty">No notifications yet.</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.read ? 'notif-unread' : ''}`}
                  onClick={() => markAsRead(n.id, n.link)}
                >
                  <div className="notif-title-row">
                    <span className="notif-item-title">{n.title}</span>
                    <span className="notif-time">
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="notif-item-msg">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
