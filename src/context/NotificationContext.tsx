import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Notification {
    id: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (type: Notification["type"], title: string, message: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

const STORAGE_KEY = "app_notifications";
const MAX_NOTIFICATIONS = 50; // Keep only the latest 50

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load notifications from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert timestamp strings back to Date objects
                const withDates = parsed.map((n: any) => ({
                    ...n,
                    timestamp: new Date(n.timestamp),
                }));
                setNotifications(withDates);
            }
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
    }, []);

    // Save notifications to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error("Failed to save notifications:", error);
        }
    }, [notifications]);

    const addNotification = (type: Notification["type"], title: string, message: string) => {
        const newNotification: Notification = {
            id: `${Date.now()}-${Math.random()}`,
            type,
            title,
            message,
            timestamp: new Date(),
            read: false,
        };

        setNotifications((prev) => {
            const updated = [newNotification, ...prev];
            // Keep only the latest MAX_NOTIFICATIONS
            return updated.slice(0, MAX_NOTIFICATIONS);
        });
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearAll,
                deleteNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
