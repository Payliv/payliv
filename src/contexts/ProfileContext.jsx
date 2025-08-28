import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const ProfileContext = createContext({ 
  profile: null, 
  loadingProfile: true,
  subscriptionStatus: 'inactive',
  isSubscriptionActive: false,
  networkError: false,
  refreshProfile: async () => {},
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const fetchProfileAndSubscription = useCallback(async () => {
    if (user) {
      setLoadingProfile(true);
      setNetworkError(false);

      try {
        const [profileRes, subscriptionRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('user_subscriptions').select('status, current_period_end, plan_id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
        ]);

        if (profileRes.error) throw profileRes.error;
        if (subscriptionRes.error) throw subscriptionRes.error;
        
        const userProfile = profileRes.data;
        setProfile(userProfile);

        const userSubscription = subscriptionRes.data;
        const subStatus = userSubscription?.status === 'active' ? 'active' : 'inactive';
        
        let finalSubStatus = 'inactive';
        let finalIsActive = false;

        if (userProfile?.role === 'superadmin' || userProfile?.role === 'partner') {
          finalSubStatus = 'active';
          finalIsActive = true;
        } else {
          finalSubStatus = subStatus;
          finalIsActive = subStatus === 'active';
        }
        
        setSubscriptionStatus(finalSubStatus);
        setIsSubscriptionActive(finalIsActive);

      } catch (error) {
        if (error.message.includes('Invalid Refresh Token')) {
          console.error("Invalid refresh token detected. Forcing sign out to clear session.");
          await supabase.auth.signOut();
        } else if (error.message.includes('Failed to fetch')) {
          setNetworkError(true);
        }
        console.error('Error fetching profile/subscription:', error.message);
      } finally {
        setLoadingProfile(false);
      }
    } else if (!authLoading) {
      setProfile(null);
      setSubscriptionStatus('inactive');
      setIsSubscriptionActive(false);
      setLoadingProfile(false);
      setNetworkError(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    const handleNetworkError = () => {
      setNetworkError(true);
    };

    window.addEventListener('network-error', handleNetworkError);

    return () => {
      window.removeEventListener('network-error', handleNetworkError);
    };
  }, []);

  useEffect(() => {
    fetchProfileAndSubscription();

    if (user) {
      const profileChannel = supabase
        .channel(`profiles-changes-for-${user.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
          console.log('Profile change received, refreshing profile...', payload);
          setProfile(payload.new);
        })
        .subscribe();
      
      const subscriptionChannel = supabase
        .channel(`user-subscriptions-changes-for-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_subscriptions', filter: `user_id=eq.${user.id}` }, (payload) => {
            console.log('Subscription change received, refreshing profile...', payload);
            fetchProfileAndSubscription();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(profileChannel);
        supabase.removeChannel(subscriptionChannel);
      };
    }
  }, [user, fetchProfileAndSubscription]);

  return (
    <ProfileContext.Provider value={{ profile, loadingProfile, subscriptionStatus, isSubscriptionActive, networkError, refreshProfile: fetchProfileAndSubscription }}>
      {children}
    </ProfileContext.Provider>
  );
};