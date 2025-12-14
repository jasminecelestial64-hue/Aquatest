import { Bell, X, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

export const NotificationCenter = () => {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        deleteNotification,
    } = useNotifications();

    const getNotificationIcon = (type: string) => {
        const baseClasses = "h-2 w-2 rounded-full";
        const colors = {
            info: "bg-blue-500",
            success: "bg-green-500",
            warning: "bg-amber-500",
            error: "bg-red-500",
        };
        return <div className={`${baseClasses} ${colors[type as keyof typeof colors] || colors.info}`} />;
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {notifications.length > 0 && (
                        <div className="flex gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="h-8 px-2"
                                >
                                    <CheckCheck className="h-4 w-4 mr-1" />
                                    Mark all read
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="h-8 px-2 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-primary/5" : ""
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-medium text-sm leading-tight">
                                                    {notification.title}
                                                </p>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    {!notification.read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => markAsRead(notification.id)}
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => deleteNotification(notification.id)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2 text-center">
                            <p className="text-xs text-muted-foreground">
                                Showing {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
};
