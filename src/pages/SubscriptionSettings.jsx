import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader, AlertTriangle, Crown, Star, Calendar, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionSettings() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const [subscription, setSubscription] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (profile?.role === 'superadmin') {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (subError) {
          throw subError;
        }

        if (subData) {
          setSubscription(subData);
          const { data: planData, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', subData.plan_id)
            .single();
          
          if (planError) {
            throw planError;
          }
          setPlan(planData);
        }
      } catch (e) {
        console.error("Error fetching subscription:", e);
        setError(e);
        toast({
          title: 'Erreur',
          description: "Impossible de charger les informations de l'abonnement.",
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, profile, toast]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderTrialInfo = () => {
    if (!profile?.trial_ends_at) return null;
    const trialEndDate = new Date(profile.trial_ends_at);
    if (trialEndDate < new Date()) return null; // Trial has expired

    return (
      <Card className="bg-blue-500/10 border-blue-500/30 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-300">
            <Calendar className="mr-2" />
            Période d'essai en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-200">
            Votre période d'essai se termine le {formatDate(profile.trial_ends_at)}.
          </p>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-foreground">Chargement de votre abonnement...</p>
      </div>
    );
  }

  if (profile?.role === 'superadmin') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xl font-semibold text-foreground mb-4">Gestion Premium</h3>
        <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl gradient-text">
              <ShieldCheck className="mr-3 text-primary" />
              Statut Super Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground">Votre compte bénéficie d'un accès premium à vie.</p>
            <p className="text-muted-foreground mt-2">Toutes les fonctionnalités sont et resteront débloquées.</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="text-xl font-semibold text-foreground mb-4">Mon Accès Premium</h3>
      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2" />
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error.message || "Une erreur est survenue."}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && subscription && plan && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl gradient-text flex items-center">
                  <Crown className="mr-2 text-primary" />
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Votre accès premium est {subscription.status === 'active' ? 'actif' : 'inactif'}.
                </CardDescription>
              </div>
              <Badge variant={subscription.status === 'active' ? 'success' : 'destructive'}>
                {subscription.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Date de début</p>
                <p className="text-foreground font-medium">{formatDate(subscription.current_period_start)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Valide jusqu'au</p>
                <p className="text-foreground font-medium">{formatDate(subscription.current_period_end)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Prix</p>
                <p className="text-foreground font-medium">{plan.price} {plan.currency} / {plan.frequency === 'monthly' ? 'mois' : 'an'}</p>
              </div>
               <div className="space-y-1">
                <p className="text-muted-foreground">ID de Transaction</p>
                <p className="text-foreground font-mono text-xs">{subscription.provider_transaction_id}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Fonctionnalités incluses :</p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-foreground">
                    <Star className="w-4 h-4 mr-2 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Changer de formule ou prolonger
            </Button>
          </CardFooter>
        </Card>
      )}

      {!loading && !error && !subscription && (
        <>
          {renderTrialInfo()}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <AlertTriangle className="mr-2" />
                Aucun accès premium actif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Vous n'avez pas encore d'accès premium. Choisissez une formule pour débloquer toutes les fonctionnalités !</p>
            </CardContent>
            <CardFooter>
               <Button onClick={() => navigate('/pricing')} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Voir les formules
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </motion.div>
  );
}