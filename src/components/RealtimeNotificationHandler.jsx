import React, { useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RealtimeNotificationHandler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`public:notifications:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotification = payload.new;
          setTimeout(() => {
            toast({
              title: (
                <div className="flex items-center font-bold">
                  <BellRing className="w-5 h-5 mr-3 text-primary animate-wiggle" />
                  {newNotification.title}
                </div>
              ),
              description: newNotification.message,
              duration: 8000,
              action: newNotification.link ? (
                <ToastAction altText="Voir" onClick={() => navigate(newNotification.link)}>
                  Voir
                </ToastAction>
              ) : undefined,
            });
          }, 3000); // 3-second delay as requested
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime notifications connected!');
        } else {
          console.log('Realtime notifications status:', status);
        }
      });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, toast, navigate]);

  return null;
};

export default RealtimeNotificationHandler;