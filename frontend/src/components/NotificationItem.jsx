import React from 'react';

const NotificationItem = ({ notification }) => {
  return (
    <div className="notification-item">
      <p>{notification.message}</p>
      <small>{new Date(notification.timestamp).toLocaleString()}</small>
      {!notification.read && <span className="new-notification-badge">New</span>}
    </div>
  );
};

export default NotificationItem;