import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/feb1d3e1435a3634d6141f996db8251a.png";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      toast({
        title: "Bienvenue !",
        description: `Vous avez été invité par un affilié.`,
      });
    }
  }, [location.search, toast]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    if (email === 'contact@gstartup.pro') {
      toast({
        title: "Inscription non autorisée",
        description: "Veuillez utiliser le portail d'inscription Super Admin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');

    const { data, error } = await signUp(email, password, {
      data: {
        name,
        ref_code: refCode,
      }
    });

    if (error) {
       toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Inscription réussie !",
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });

      if (data.user) {
        supabase.functions.invoke('send-welcome-email', {
          body: { record: { email: data.user.email, raw_user_meta_data: { name } } }
        }).catch(console.error);
      }

      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card rounded-2xl p-8 border border-border"
      >
        <div className="text-center mb-8">
          <img src={logoUrl} alt="PayLiv Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold gradient-text">Créer un compte</h1>
          <p className="text-muted-foreground mt-2">Rejoignez PayLiv et lancez votre empire.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-foreground">Nom complet</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background mt-2"
              placeholder="John Doe"
              disabled={loading}
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background mt-2"
              placeholder="john.doe@example.com"
              disabled={loading}
              required
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
              disabled={loading}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg" disabled={loading}>
            {loading ? "Création du compte..." : "S'inscrire"}
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}