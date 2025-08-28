import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { resetPasswordForEmail } = useAuth();
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/feb1d3e1435a3634d6141f996db8251a.png";

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setLoading(true);
    const { error } = await resetPasswordForEmail(email);

    if (error) {
      if (error.message.includes('over_email_send_rate_limit')) {
        toast({
          title: "Trop de demandes",
          description: "Veuillez attendre avant de demander un nouvel e-mail.",
          variant: "destructive",
        });
        setCooldown(60);
      } else {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception pour les instructions de réinitialisation.",
      });
      setSent(true);
      setCooldown(60);
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
          <h1 className="text-4xl font-bold gradient-text">Mot de passe oublié</h1>
          <p className="text-muted-foreground mt-2">
            {sent 
              ? "Un email a été envoyé. Suivez les instructions."
              : "Entrez votre email pour réinitialiser votre mot de passe."
            }
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background mt-2"
                placeholder="votre-email@exemple.com"
                required
                disabled={loading || cooldown > 0}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6"
              disabled={loading || cooldown > 0}
            >
              {loading ? <Loader2 className="animate-spin" /> : cooldown > 0 ? `Attendez ${cooldown}s` : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Envoyer l'email de réinitialisation
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-500">Email envoyé avec succès !</p>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 mt-4"
              disabled={cooldown > 0}
              onClick={handlePasswordReset}
            >
              {cooldown > 0 ? `Renvoyer dans ${cooldown}s` : 'Renvoyer l\'email'}
            </Button>
          </div>
        )}

        <p className="text-center text-muted-foreground mt-6">
          Vous vous souvenez de votre mot de passe ?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}