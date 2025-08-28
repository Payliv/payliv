import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPasswordForEmail: async () => {},
  updateUserPassword: async () => {},
});

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const signOutAndNotify = useCallback(() => {
    supabase.auth.signOut();
    toast({
        title: "Session Expirée",
        description: "Votre session a expiré. Veuillez vous reconnecter.",
        variant: "destructive",
    });
  }, [toast]);

  const handleAuthError = useCallback((error, defaultMessage) => {
    // Ignore "session not found" errors during logout, as they are not critical user-facing issues.
    if (error?.code === 403 && error?.error_code === 'session_not_found') {
      console.warn("Handled a non-critical 'session_not_found' error during sign out.");
      return;
    }
    
    if (error?.message?.includes('Invalid Refresh Token')) {
      signOutAndNotify();
      return;
    }

    const isNetworkError = error instanceof TypeError && error.message.includes('Failed to fetch');
    toast({
      title: isNetworkError ? "Erreur de Réseau" : "Erreur d'Authentification",
      description: isNetworkError 
        ? "Impossible de se connecter aux serveurs. Veuillez vérifier votre connexion internet."
        : error.message || defaultMessage,
      variant: "destructive",
    });
  }, [toast, signOutAndNotify]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        handleAuthError(error, "Impossible de récupérer la session.");
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'TOKEN_REFRESHED' && session === null) {
            signOutAndNotify();
        } else {
            setSession(session);
            setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [handleAuthError, signOutAndNotify]);

  const signIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      handleAuthError(error, "La connexion a échoué.");
      return { data: null, error };
    }
  }, [handleAuthError]);

  const signUp = useCallback(async (email, password, options) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      handleAuthError(error, "L'inscription a échoué.");
      return { data: null, error };
    }
  }, [handleAuthError]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      handleAuthError(error, "La déconnexion a échoué.");
    }
  }, [handleAuthError]);

  const resetPasswordForEmail = useCallback(async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      handleAuthError(error, "L'envoi de l'e-mail de réinitialisation a échoué.");
      return { data: null, error };
    }
  }, [handleAuthError]);

  const updateUserPassword = useCallback(async (password) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      handleAuthError(error, "La mise à jour du mot de passe a échoué.");
      return { data: null, error };
    }
  }, [handleAuthError]);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPasswordForEmail,
    updateUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
