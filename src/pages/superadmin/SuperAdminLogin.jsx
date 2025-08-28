import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
       toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
        variant: "destructive",
      });
    }
    // Redirection will be handled by the router logic based on user's role
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
          <div className="flex justify-center items-center mb-4">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Accès Super Admin
          </h1>
          <p className="text-muted-foreground">Portail de connexion sécurisé</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background mt-2"
              placeholder="contact@gstartup.pro"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background mt-2"
              placeholder="********"
              required
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6"
            disabled={loading}
          >
            {loading ? 'Vérification...' : 'Se connecter'}
          </Button>
        </form>
        <p className="text-center text-muted-foreground mt-6">
          Pas encore de compte Super Admin ?{' '}
          <Link to="/admin/signup" className="font-semibold text-primary hover:underline">
            S'inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  );
}