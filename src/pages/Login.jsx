import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { useNavigate, Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { toast } from '@/components/ui/use-toast';
    import { LogIn, ArrowLeft } from 'lucide-react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    export default function Login() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [loading, setLoading] = useState(false);
      const { signIn } = useAuth();
      const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/feb1d3e1435a3634d6141f996db8251a.png";

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
        // Redirection is handled by the AuthProvider and App component
        setLoading(false);
      };

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-card rounded-2xl p-8 border border-border"
          >
            <div className="text-center mb-8">
              <Link to="/">
                <img src={logoUrl} alt="PayLiv Logo" className="h-16 mx-auto mb-4 cursor-pointer" />
              </Link>
              <h1 className="text-4xl font-bold gradient-text">Connexion</h1>
              <p className="text-muted-foreground mt-2">Connectez-vous à votre compte PayLiv</p>
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
                  placeholder="votre-email@exemple.com"
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
                <Link to="/forgot-password" className="text-sm text-primary hover:underline mt-2 block text-right">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6"
                disabled={loading}
              >
                {loading ? 'Connexion...' : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-muted-foreground mt-6">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Inscrivez-vous
              </Link>
            </p>

            <Button asChild variant="ghost" className="w-full mt-4">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
          </motion.div>
        </div>
      );
    }