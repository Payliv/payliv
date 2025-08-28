import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationsContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10); // Fetch last 10 notifications

    if (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger les notifications.',
        variant: 'destructive',
      });
    } else {
      setNotifications(data || []);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const subscription = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setNotifications((prev) => [payload.new, ...prev].slice(0, 10));
              setUnreadCount((prev) => prev + 1);
              toast({
                title: payload.new.title,
                description: payload.new.message,
              });
            } else if (payload.eventType === 'UPDATE') {
              setNotifications((prev) =>
                prev.map((n) => (n.id === payload.new.id ? payload.new : n))
              );
              setUnreadCount((prev) =>
                payload.new.is_read ? Math.max(0, prev - 1) : prev + 1
              );
            } else if (payload.eventType === 'DELETE') {
              setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
              if (!payload.old.is_read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user, fetchNotifications, toast]);

  const markAsRead = useCallback(async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer la notification comme lue.',
        variant: 'destructive',
      });
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, [toast]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer toutes les notifications comme lues.',
        variant: 'destructive',
      });
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  }, [user, toast]);

  const formattedNotifications = notifications.map(n => ({
    ...n,
    timeAgo: formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr }),
  }));

  const value = {
    notifications: formattedNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};