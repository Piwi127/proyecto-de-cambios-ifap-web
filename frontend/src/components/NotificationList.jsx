import React from 'react';
import NotificationItem from './NotificationItem';

const NotificationList = ({ notifications, markAsRead }) => {
  return (
    <div className="notification-list">
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            markAsRead={markAsRead}
          />
        ))
      )}
    </div>
  );
};

export default NotificationList;