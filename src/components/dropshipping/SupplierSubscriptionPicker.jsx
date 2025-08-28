import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import InfoCollectionModal from '@/components/InfoCollectionModal';
import { v4 as uuidv4 } from 'uuid';

const SupplierSubscriptionPicker = ({ plans }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [planToProcess, setPlanToProcess] = useState(null);

    const proceedWithPayment = useCallback(async (plan, profile) => {
        setIsProcessing(true);
        setSelectedPlan(plan);
        try {
          const orderId = uuidv4();
          const { data, error } = await supabase.functions.invoke('subscription-payment-handler', {
            body: {
              amount: plan.price,
              currency: plan.currency || 'XOF',
              articles: [{ name: `Abonnement Fournisseur ${plan.name}`, price: plan.price, quantity: 1 }],
              customer: { name: profile.name, email: user.email, phone_number: profile.whatsapp_number },
              metadata: { userId: user.id, orderId: orderId, planId: plan.id, context: 'supplier_signup' },
              return_url: `${window.location.origin}/payment-status`,
            }
          });
          if (error) throw error;
          const paymentUrl = data.payment_url || data.url;
          if (paymentUrl) {
            window.location.href = paymentUrl;
          } else {
            throw new Error(data.message || "L'URL de paiement n'a pas été reçue.");
          }
        } catch (error) {
          toast({ title: "Erreur de paiement", description: error.message, variant: "destructive" });
          setIsProcessing(false);
          setSelectedPlan(null);
        }
      }, [user]);

    const handlePayment = useCallback(async (plan) => {
        if (!user) {
          navigate(`/signup?plan=${plan.id}&redirect=/solutions/dropshipping%23become-partner`);
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
          const { data: updatedProfile, error } = await supabase.from('profiles').select('name, whatsapp_number').eq('id', user.id).maybeSingle();
          if (error) {
             toast({ title: "Erreur", description: "Impossible de récupérer le profil mis à jour.", variant: "destructive" });
             return;
          }
          await proceedWithPayment(planToProcess, updatedProfile);
          setPlanToProcess(null);
        }
    }, [planToProcess, user, proceedWithPayment]);

    if (!plans || plans.length === 0) {
        return <div className="text-center text-muted-foreground">Les formules pour devenir fournisseur ne sont pas disponibles pour le moment.</div>;
    }

    return (
        <>
            <InfoCollectionModal 
                isOpen={isInfoModalOpen} 
                onClose={() => setIsInfoModalOpen(false)}
                onSuccess={handleInfoCollected}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {plans.map(plan => (
                     <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      >
                        <Card className={`relative flex flex-col h-full ${plan.is_popular ? 'border-primary border-2 shadow-2xl shadow-primary/20' : 'border-border'}`}>
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
                                {plan.price.toLocaleString()}
                              </span>
                              <span className="text-base font-medium text-muted-foreground"> {plan.currency}/mois</span>
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
                              onClick={() => handlePayment(plan)}
                              disabled={isProcessing && selectedPlan?.id === plan.id}
                            >
                              {isProcessing && selectedPlan?.id === plan.id ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Traitement...</>
                              ) : (
                                <>Devenir Fournisseur <ArrowRight className="ml-2 h-5 w-5" /></>
                              )}
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                ))}
            </div>
        </>
    );
};

export default SupplierSubscriptionPicker;