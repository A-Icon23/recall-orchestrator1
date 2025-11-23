import React, { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationBell = ({ businessId }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(businessId);
    const [isOpen, setIsOpen] = useState(false);

    const handleNotificationClick = (notif) => {
        markAsRead(notif.id);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'recall_started': return '🚨';
            case 'refund_approved': return '✅';
            case 'email_sent': return '📧';
            default: return '🔔';
        }
    };

    const formatTimeAgo = (timestamp) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-gray-400 hover:text-white cursor-pointer transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50">
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <h3 className="font-bold text-white">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                    <Check size={14} />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${notif.read ? 'bg-gray-800/50' : 'bg-blue-500/5 hover:bg-blue-500/10'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{getNotificationIcon(notif.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`font-medium text-sm ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                            <p className="text-xs text-gray-600 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
