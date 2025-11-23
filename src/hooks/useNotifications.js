import { useState, useEffect } from 'react';

// Mock notifications for hackathon demo
export const useNotifications = (businessId) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!businessId) return;

        // Load notifications from localStorage
        const key = `notifications_${businessId}`;
        const saved = localStorage.getItem(key);

        if (saved) {
            const parsed = JSON.parse(saved);
            setNotifications(parsed);
            setUnreadCount(parsed.filter(n => !n.read).length);
        } else {
            // Create some demo notifications
            const demoNotifications = [
                {
                    id: '1',
                    title: 'Welcome to RecallOS',
                    message: 'Your business account has been created successfully',
                    type: 'system',
                    read: false,
                    createdAt: new Date().toISOString()
                }
            ];
            setNotifications(demoNotifications);
            setUnreadCount(1);
            localStorage.setItem(key, JSON.stringify(demoNotifications));
        }
    }, [businessId]);

    const markAsRead = (notificationId) => {
        const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);

        const key = `notifications_${businessId}`;
        localStorage.setItem(key, JSON.stringify(updated));
    };

    const addNotification = (title, message, type = 'info') => {
        const newNotif = {
            id: Date.now().toString(),
            title,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        };

        const updated = [newNotif, ...notifications];
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);

        const key = `notifications_${businessId}`;
        localStorage.setItem(key, JSON.stringify(updated));
    };

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        setUnreadCount(0);

        const key = `notifications_${businessId}`;
        localStorage.setItem(key, JSON.stringify(updated));
    };

    return {
        notifications: notifications.slice(0, 5), // Last 5 notifications
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification
    };
};
