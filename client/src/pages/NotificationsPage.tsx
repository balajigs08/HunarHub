import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, ShoppingBag, Wrench, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Notification } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || res.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Bell className="text-indigo-600" size={24} /> Notifications
        </h1>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching notifications..." />
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-gray-100 shadow-sm">
          <Bell size={48} className="mx-auto text-gray-300 mb-2" />
          <h3 className="font-bold text-gray-800">All caught up!</h3>
          <p className="text-xs text-gray-500 mt-1">You have no unread notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 rounded-2xl border transition flex items-start gap-4 ${
                !n.isRead ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-gray-100'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white text-indigo-600 shadow-sm">
                <Bell size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-900">{n.title}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                <span className="text-[10px] text-gray-400 mt-2 block">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
