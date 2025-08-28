import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export default function SuperAdminSignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/feb1d3e1435a3634d6141f996db8251a.png";

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
    
    if (!validateEmail(email)) {
      toast({
        title: "Format d'email invalide",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive",
      });
      return;
    }

    if (email !== 'contact@gstartup.pro') {
      toast({
        title: "Inscription non autorisée",
        description: "Cet email n'est pas autorisé à créer un compte Super Admin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });

    if (!error) {
      toast({
        title: "Inscription Super Admin réussie !",
        description: "Veuillez vérifier votre email pour confirmer votre compte.",
      });
      navigate('/admin/login');
    } else {
       toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
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
          <div className="flex justify-center items-center mb-2">
            <ShieldCheck className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold gradient-text">
              Inscription Super Admin
            </h1>
          </div>
          <p className="text-muted-foreground">Création du compte administrateur principal</p>
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
              placeholder="Administrateur"
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-foreground">Email Super Admin</Label>
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
            {loading ? 'Création en cours...' : "Créer le compte Super Admin"}
          </Button>
        </form>

        <p className="text-center text-muted-foreground mt-6">
          Déjà un compte Super Admin ?{' '}
          <Link to="/admin/login" className="font-semibold text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}