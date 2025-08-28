import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { updateUserPassword } = useAuth();
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/feb1d3e1435a3634d6141f996db8251a.png";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "Prêt à réinitialiser",
          description: "Vous pouvez maintenant définir votre nouveau mot de passe.",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setError('');
    setLoading(true);

    const { error: updateError } = await updateUserPassword(password);

    if (updateError) {
      toast({
        title: 'Erreur',
        description: updateError.message,
        variant: 'destructive',
      });
      setError(updateError.message);
    } else {
      toast({
        title: 'Succès',
        description: 'Votre mot de passe a été réinitialisé avec succès.',
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card rounded-2xl p-8 border border-border"
      >
        <div className="text-center mb-8">
          <img src={logoUrl} alt="PayLiv Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold gradient-text">Nouveau mot de passe</h1>
          <p className="text-muted-foreground mt-2">Entrez votre nouveau mot de passe.</p>
        </div>

        {success ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Mot de passe réinitialisé !</h2>
            <p className="text-muted-foreground mb-6">
              Vous allez être redirigé vers la page de connexion.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-foreground">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background mt-2 pr-10"
                  placeholder="********"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-password" className="text-foreground">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background mt-2"
                placeholder="********"
                required
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <KeyRound className="w-5 h-5 mr-2" />
                  Réinitialiser le mot de passe
                </>
              )}
            </Button>
          </form>
        )}

        {!success && (
          <p className="text-center text-muted-foreground mt-6">
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Retour à la connexion
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}