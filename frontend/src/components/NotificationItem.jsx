import React from 'react';

const NotificationItem = ({ notification, markAsRead }) => {
  const handleClick = () => {
    if (!notification.read && markAsRead) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      className={`notification-item p-4 border-l-4 rounded-lg mb-4 cursor-pointer transition-colors ${
        notification.read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-500'
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-gray-900 mb-2">{notification.message}</p>
          <small className="text-gray-500">
            {new Date(notification.timestamp).toLocaleString()}
          </small>
        </div>
        {!notification.read && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full ml-2">
            Nuevo
          </span>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;