import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Check,
  CheckCircle2,
  UserPlus,
  Trash2,
  Clock,
  CreditCard,
  Calendar,
  User,
  Hash,
  ChevronRight,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/notifications`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        // ✅ FIX: Derive unread count directly from the fetched data
        // instead of making a separate API call that can go out of sync
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative hover:bg-slate-100 dark:hover:bg-zinc-900"
        onClick={() => setIsOpen(true)}
      >
        <Bell size={20} className="text-slate-700 dark:text-zinc-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold ring-2 ring-white dark:ring-black">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      <NotificationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onRefresh={fetchNotifications}
      />
    </>
  );
}

function NotificationModal({ isOpen, onClose, notifications, unreadCount, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);

  // ✅ FIX: Derive read/unread counts directly from the notifications array
  // so filter button labels are always accurate and in sync
  const readCount   = notifications.filter(n =>  n.is_read).length;
  const derivedUnread = notifications.filter(n => !n.is_read).length;

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read')   return  notif.is_read;
    return true;
  });

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, { method: 'PUT' });
      onRefresh();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, { method: 'PUT' });
      onRefresh();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}`, { method: 'DELETE' });
      onRefresh();
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await fetch(`${API_BASE}/api/notifications`, { method: 'DELETE' });
      onRefresh();
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  /* ── Helpers ── */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'claim':        return <CheckCircle2 className="text-emerald-500 dark:text-emerald-400" size={20} />;
      case 'registration': return <UserPlus className="text-blue-500 dark:text-blue-400" size={20} />;
      case 'id_ready':     return <CreditCard className="text-purple-500 dark:text-purple-400" size={20} />;
      default:             return <Bell className="text-slate-500 dark:text-zinc-400" size={20} />;
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'claim':        return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'registration': return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
      case 'id_ready':     return 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20';
      default:             return 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10';
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'claim':        return 'ID Claimed';
      case 'registration': return 'New Registration';
      case 'id_ready':     return 'ID Ready';
      default:             return 'Notification';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const diffInSeconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diffInSeconds < 60)     return 'Just now';
    if (diffInSeconds < 3600)   return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)  return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const formatFullDate = (timestamp) =>
    new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

  const filterBtn = (val, label) => (
    <Button
      variant={filter === val ? 'default' : 'outline'}
      size="sm"
      onClick={() => setFilter(val)}
      className={`text-xs rounded-lg ${
        filter === val
          ? 'bg-[#70B9A1] hover:bg-[#5A9A85] text-white border-[#70B9A1]'
          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
      }`}
    >
      {label}
    </Button>
  );

  return (
    <>
      {/* ── Main Notifications Modal ── */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl p-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl dark:shadow-black/60">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#70B9A1] to-[#5A9A85] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Bell className="text-white" size={18} />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  Notifications
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">
                  {derivedUnread > 0 ? `${derivedUnread} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Filter Bar */}
          <div className="px-6 py-3 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {/* ✅ FIX: Use derivedUnread and readCount from the notifications array */}
              {filterBtn('all',    `All (${notifications.length})`)}
              {filterBtn('unread', `Unread (${derivedUnread})`)}
              {filterBtn('read',   `Read (${readCount})`)}
            </div>
            <div className="flex gap-2">
              {derivedUnread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"
                >
                  <Check size={14} className="mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 size={14} className="mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <ScrollArea className="h-[400px] bg-slate-50/30 dark:bg-black">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-white/10">
                  <Bell className="text-slate-300 dark:text-zinc-600" size={28} />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">No notifications</p>
                <p className="text-xs text-slate-400 dark:text-zinc-600 mt-1">
                  {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/70">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-all border-l-4 ${
                      !notification.is_read
                        ? 'bg-[#70B9A1]/5 dark:bg-[#70B9A1]/5 border-[#70B9A1] hover:bg-[#70B9A1]/10 dark:hover:bg-[#70B9A1]/10'
                        : 'bg-white dark:bg-zinc-950 border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.025]'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${getNotificationBgColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                {getNotificationTypeLabel(notification.type)}
                              </p>
                              {!notification.is_read && (
                                <Badge className="text-[10px] bg-[#70B9A1] text-white px-1.5 py-0 h-4">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-zinc-400 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Clock size={11} className="text-slate-400 dark:text-zinc-600" />
                              <span className="text-xs text-slate-400 dark:text-zinc-500">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                              className="h-7 w-7 p-0 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                              title="Delete"
                            >
                              <Trash2 size={14} className="text-red-500 dark:text-red-400" />
                            </Button>
                            <ChevronRight size={14} className="text-slate-300 dark:text-zinc-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* ── Notification Details Modal ── */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl dark:shadow-black/60">
          <DialogHeader className="border-b border-slate-100 dark:border-zinc-800 pb-4">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              Notification Details
            </DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4 py-2">
              {/* Type + Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${getNotificationBgColor(selectedNotification.type)}`}>
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">
                      {getNotificationTypeLabel(selectedNotification.type)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                      #{selectedNotification.id}
                    </p>
                  </div>
                </div>
                <Badge className={selectedNotification.is_read
                  ? 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-white/10'
                  : 'bg-[#70B9A1] text-white'
                }>
                  {selectedNotification.is_read ? 'Read' : 'Unread'}
                </Badge>
              </div>

              {/* Message */}
              <div className="bg-slate-50 dark:bg-white/[0.03] p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Employee Info */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <User size={13} />
                  Employee Information
                </h3>
                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-zinc-500">Name</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedNotification.employee_name}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-zinc-500 flex items-center gap-1.5">
                      <Hash size={13} /> Employee ID
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono">
                      {selectedNotification.employee_id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={13} />
                  Date & Time
                </h3>
                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500 dark:text-zinc-500 shrink-0">Created</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white text-right">
                      {formatFullDate(selectedNotification.created_at)}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-zinc-500">Time Ago</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatTimeAgo(selectedNotification.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                  onClick={() => { deleteNotification(selectedNotification.id); setSelectedNotification(null); }}
                >
                  <Trash2 size={15} className="mr-2 text-red-500" />
                  Delete
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-[#70B9A1] hover:bg-[#5A9A85] text-white"
                  onClick={() => setSelectedNotification(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default NotificationBell;