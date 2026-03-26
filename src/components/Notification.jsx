import React, { useState, useEffect, useCallback } from 'react';
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
import api from '../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DELETE DIALOG — professional redesign
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmDeleteDialog({ isOpen, onClose, onConfirm, isClearAll, isLoading }) {
  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className="max-w-[380px] p-0 rounded-2xl overflow-hidden border-0 shadow-2xl bg-white dark:bg-[#141414]"
        style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)' }}
      >
        {/* Top danger accent line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-red-500 to-orange-400" />

        <div className="px-7 pt-6 pb-6">
          {/* Icon + title row */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.18)' }}
            >
              <Trash2 size={19} className="text-red-500" />
            </div>
            <div className="pt-0.5">
              <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white tracking-tight leading-snug mb-1">
                {isClearAll ? 'Clear all notifications?' : 'Delete this notification?'}
              </h2>
              <p className="text-[13px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                {isClearAll
                  ? 'All notifications will be permanently removed from your inbox.'
                  : 'This notification will be permanently removed from your inbox.'}
              </p>
            </div>
          </div>

          {/* Permanent action warning */}
          <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 mb-5"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.14)',
            }}
          >
            {/* Pulsing dot */}
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <p className="text-[12px] font-medium text-red-500 dark:text-red-400 tracking-wide font-mono">
              This action is permanent and cannot be undone
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-10 rounded-xl text-[13.5px] font-medium transition-all duration-150 disabled:opacity-40"
              style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
                color: '#71717a',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.07)';
                e.currentTarget.style.color = '#3f3f46';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                e.currentTarget.style.color = '#71717a';
              }}
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 h-10 rounded-xl text-[13.5px] font-medium text-white transition-all duration-150 disabled:opacity-50 relative overflow-hidden"
              style={{ background: '#ef4444' }}
              onMouseEnter={e => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.35)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Subtle inner highlight */}
              <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <span className="relative">
                {isLoading
                  ? (isClearAll ? 'Clearing…' : 'Deleting…')
                  : (isClearAll ? 'Clear all' : 'Delete permanently')}
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION BELL
// ─────────────────────────────────────────────────────────────────────────────
export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/api/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
        onRefresh={fetchNotifications}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION MODAL
// ─────────────────────────────────────────────────────────────────────────────
function NotificationModal({ isOpen, onClose, notifications, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen]       = useState(false);
  const [confirmTarget, setConfirmTarget]   = useState(null); // { id } | 'all'
  const [confirmLoading, setConfirmLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const readCount   = notifications.filter((n) =>  n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read')   return  n.is_read;
    return true;
  });

  // ── Confirm helpers ────────────────────────────────────────────────────────

  const askDeleteOne = (id) => { setConfirmTarget({ id }); setConfirmOpen(true); };
  const askClearAll  = ()  => { setConfirmTarget('all');   setConfirmOpen(true); };

  const handleConfirm = async () => {
    setConfirmLoading(true);
    try {
      if (confirmTarget === 'all') {
        await api.delete('/api/notifications');
        setSelectedNotification(null);
      } else {
        setLoadingId(confirmTarget.id);
        await api.delete(`/api/notifications/${confirmTarget.id}`);
        if (selectedNotification?.id === confirmTarget.id) setSelectedNotification(null);
        setLoadingId(null);
      }
      onRefresh();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleCancelConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  // ── Other API helpers ──────────────────────────────────────────────────────

  const markAsRead = async (id) => {
    try { await api.put(`/api/notifications/${id}/read`); onRefresh(); }
    catch (err) { console.error('Mark as read failed:', err); }
  };

  const markAllAsRead = async () => {
    try { await api.put('/api/notifications/read-all'); onRefresh(); }
    catch (err) { console.error('Mark all as read failed:', err); }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    if (!notification.is_read) await markAsRead(notification.id);
  };

  // ── Display helpers ────────────────────────────────────────────────────────

  const getIcon = (type) => {
    switch (type) {
      case 'claim':        return <CheckCircle2 className="text-emerald-500 dark:text-emerald-400" size={20} />;
      case 'registration': return <UserPlus     className="text-blue-500 dark:text-blue-400"       size={20} />;
      case 'id_ready':     return <CreditCard   className="text-purple-500 dark:text-purple-400"   size={20} />;
      default:             return <Bell         className="text-slate-500 dark:text-zinc-400"       size={20} />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'claim':        return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'registration': return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
      case 'id_ready':     return 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20';
      default:             return 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'claim':        return 'ID Claimed';
      case 'registration': return 'New Registration';
      case 'id_ready':     return 'ID Ready';
      default:             return 'Notification';
    }
  };

  const timeAgo = (ts) => {
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60)      return 'Just now';
    if (s < 3_600)   return `${Math.floor(s / 60)}m ago`;
    if (s < 86_400)  return `${Math.floor(s / 3_600)}h ago`;
    if (s < 604_800) return `${Math.floor(s / 86_400)}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  const fullDate = (ts) =>
    new Date(ts).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

  const FilterBtn = ({ val, label }) => (
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
      {/* ── LIST MODAL ── */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl p-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl dark:shadow-black/60">

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
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-3 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <FilterBtn val="all"    label={`All (${notifications.length})`} />
              <FilterBtn val="unread" label={`Unread (${unreadCount})`} />
              <FilterBtn val="read"   label={`Read (${readCount})`} />
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg">
                  <Check size={14} className="mr-1" /> Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={askClearAll}
                  className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                  <Trash2 size={14} className="mr-1" /> Clear all
                </Button>
              )}
            </div>
          </div>

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
                {filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 cursor-pointer transition-all border-l-4 ${
                      !n.is_read
                        ? 'bg-[#70B9A1]/5 border-[#70B9A1] hover:bg-[#70B9A1]/10'
                        : 'bg-white dark:bg-zinc-950 border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.025]'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${getIconBg(n.type)}`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">{getTypeLabel(n.type)}</p>
                              {!n.is_read && (
                                <Badge className="text-[10px] bg-[#70B9A1] text-white px-1.5 py-0 h-4">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-zinc-400 line-clamp-2">{n.message}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Clock size={11} className="text-slate-400 dark:text-zinc-600" />
                              <span className="text-xs text-slate-400 dark:text-zinc-500">{timeAgo(n.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost" size="sm"
                              disabled={loadingId === n.id}
                              onClick={(e) => { e.stopPropagation(); askDeleteOne(n.id); }}
                              className="h-7 w-7 p-0 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-40"
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

      {/* ── DETAIL MODAL ── */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl dark:shadow-black/60">
          <DialogHeader className="border-b border-slate-100 dark:border-zinc-800 pb-4">
            <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              Notification Details
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border ${getIconBg(selectedNotification.type)}`}>
                    {getIcon(selectedNotification.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{getTypeLabel(selectedNotification.type)}</p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono">#{selectedNotification.id}</p>
                  </div>
                </div>
                <Badge className={selectedNotification.is_read
                  ? 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-white/10'
                  : 'bg-[#70B9A1] text-white'}>
                  {selectedNotification.is_read ? 'Read' : 'Unread'}
                </Badge>
              </div>

              <div className="bg-slate-50 dark:bg-white/[0.03] p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">{selectedNotification.message}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <User size={13} /> Employee Information
                </h3>
                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-zinc-500">Name</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedNotification.employee_name}</span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-zinc-500 flex items-center gap-1.5"><Hash size={13} /> Employee ID</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono">{selectedNotification.employee_id}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={13} /> Date & Time
                </h3>
                <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500 dark:text-zinc-500 shrink-0">Created</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white text-right">{fullDate(selectedNotification.created_at)}</span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-zinc-500">Time ago</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{timeAgo(selectedNotification.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  disabled={loadingId === selectedNotification.id}
                  className="flex-1 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40"
                  onClick={() => askDeleteOne(selectedNotification.id)}
                >
                  <Trash2 size={15} className="mr-2 text-red-500" /> Delete
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

      {/* ── CONFIRM DELETE DIALOG ── */}
      <ConfirmDeleteDialog
        isOpen={confirmOpen}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirm}
        isClearAll={confirmTarget === 'all'}
        isLoading={confirmLoading}
      />
    </>
  );
}

export default NotificationBell;