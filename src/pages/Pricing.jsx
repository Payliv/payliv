import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import PageLoader from '@/components/PageLoader';
import InfoCollectionModal from '@/components/InfoCollectionModal';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [planToProcess, setPlanToProcess] = useState(null);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('ref_code', refCode);
      toast({
        title: "Code de parrainage appliqué !",
        description: "Vous êtes arrivé via un lien de parrainage.",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('subscription_plans').select('*').order('price', { ascending: true });
      if (error) {
        console.error('Error fetching plans:', error);
        toast({ title: 'Erreur', description: 'Impossible de charger les plans tarifaires.', variant: 'destructive' });
      } else {
        setPlans(data);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const proceedWithPayment = useCallback(async (plan, profile) => {
    setIsProcessing(true);
    setSelectedPlan(plan);
    try {
      const refCode = localStorage.getItem('ref_code');

      const { data, error } = await supabase.functions.invoke('fusionpay-subscription-init', {
        body: {
          planId: plan.id,
          referredByCode: refCode,
        }
      });

      if (error) {
        const errorData = await error.context.json();
        throw new Error(errorData.error || error.message);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "L'URL de paiement n'a pas été reçue.");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast({ title: "Erreur de paiement", description: error.message, variant: "destructive" });
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  }, [user, billingCycle]);

  const handlePayment = useCallback(async (plan) => {
    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }
    
    const { data: freshProfile, error } = await supabase.from('profiles').select('name, whatsapp_number').eq('id', user.id).maybeSingle();
    if (error) {
        toast({ title: "Erreur", description: "Impossible de vérifier votre profil.", variant: "destructive" });
        return;
    }

    if (!freshProfile?.name || !freshProfile?.whatsapp_number) {
      setPlanToProcess(plan);
      setIsInfoModalOpen(true);
    } else {
      await proceedWithPayment(plan, freshProfile);
    }
  }, [user, navigate, proceedWithPayment]);

  const handleInfoCollected = useCallback(async () => {
    setIsInfoModalOpen(false);
    if (planToProcess) {
      const { data: updatedProfile, error } = await supabase.from('profiles').select('name, whatsapp_number').eq('id', user.id).single();
      if (error) {
        toast({ title: "Erreur", description: "Impossible de récupérer le profil mis à jour.", variant: "destructive" });
        return;
      }
      await proceedWithPayment(planToProcess, updatedProfile);
      setPlanToProcess(null);
    }
  }, [planToProcess, user, proceedWithPayment]);

  const filteredPlans = useMemo(() => {
    return plans.filter(plan => plan.frequency === billingCycle);
  }, [plans, billingCycle]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <Helmet>
        <title>Tarifs - PayLiv</title>
        <meta name="description" content="Découvrez nos plans tarifaires flexibles et abordables pour lancer votre boutique en ligne sur PayLiv. Choisissez le plan qui vous convient." />
      </Helmet>
      <InfoCollectionModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)}
        onSuccess={handleInfoCollected}
      />
      <div className="bg-background text-foreground">
        <main>
          <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="sm:align-center sm:flex sm:flex-col">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-5xl font-extrabold tracking-tight text-center">Des tarifs simples et transparents</h1>
                <p className="mt-5 max-w-2xl mx-auto text-xl text-muted-foreground text-center">
                  Choisissez le plan qui correspond à vos ambitions. Commencez gratuitement ou passez à la vitesse supérieure.
                </p>
                <div className="mt-8 flex justify-center items-center space-x-4">
                  <span className={billingCycle === 'monthly' ? 'font-semibold text-primary' : 'text-muted-foreground'}>Mensuel</span>
                  <Switch
                    checked={billingCycle === 'yearly'}
                    onCheckedChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    aria-label="Changer la période de facturation"
                  />
                  <span className={billingCycle === 'yearly' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
                    Annuel <span className="text-emerald-500 font-bold">(Économisez 2 mois !)</span>
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8 items-stretch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {filteredPlans.map((plan) => (
                  <motion.div
                    key={`${plan.id}-${billingCycle}`}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="flex"
                  >
                    <Card className={`relative flex flex-col h-full w-full ${plan.is_popular ? 'border-primary border-2 shadow-2xl shadow-primary/20' : 'border-border'}`}>
                      {plan.is_popular && (
                        <div className="absolute top-0 right-4 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                          Populaire
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                        <CardDescription>{plan.description || 'Idéal pour commencer.'}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="my-6">
                          <span className="text-5xl font-extrabold">
                            {plan.price === 0 ? 'Gratuit' : plan.price.toLocaleString()}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-base font-medium text-muted-foreground"> {plan.currency}/
                              {billingCycle === 'monthly' ? 'mois' : 'an'}
                            </span>
                          )}
                        </div>
                        <ul className="space-y-4">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="flex-shrink-0 h-6 w-6 text-green-500 mr-3" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full text-lg"
                          onClick={() => plan.price === 0 ? navigate('/signup') : handlePayment(plan)}
                          disabled={isProcessing && selectedPlan?.id === plan.id}
                        >
                          {isProcessing && selectedPlan?.id === plan.id ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Traitement...
                            </>
                          ) : (
                            <>
                              {plan.price === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>
      </div>
    </>
  );
}