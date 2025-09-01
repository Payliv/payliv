import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, Store, Sparkles, CreditCard, Lock, Plus } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from '@/lib/utils';
import { useProfile } from '@/contexts/ProfileContext';

const CreateStoreWizard = ({ onStoreCreated, disabled = false }) => {
  const { user } = useAuth();
  const { isSubscriptionActive } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('digital');
  const [isLoading, setIsLoading] = useState(false);
  const [createdStore, setCreatedStore] = useState(null);

  const steps = [
    { id: 1, title: 'Type de boutique' },
    { id: 2, title: 'Nom de la boutique' },
    { id: 3, title: 'Confirmation' }
  ];

  const handleCreateStore = async () => {
    setIsLoading(true);

    const { data: slugData, error: slugError } = await supabase.rpc('generate_unique_store_slug', { base_name: storeName });
    if (slugError) {
      toast({ title: 'Erreur', description: "Impossible de générer une URL unique pour votre boutique.", variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    const { data: newStore, error } = await supabase
      .from('stores')
      .insert({
        user_id: user.id,
        name: storeName,
        slug: slugData,
        store_type: storeType,
        status: 'draft',
        theme: {
          primaryColor: '#FBBF24',
          secondaryColor: '#10B981',
          backgroundColor: '#FFFFFF',
          textColor: '#111827',
          font: 'Inter'
        },
        settings: {
          currency: 'XOF',
          payments: {
            cashOnDelivery: storeType === 'physical',
            apiweb_enabled: true,
            cinetpay_enabled: true,
            paydunya_enabled: true,
          }
        },
      })
      .select()
      .single();

    setIsLoading(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Succès !', description: 'Votre boutique a été créée.' });
      if (onStoreCreated) {
        onStoreCreated(newStore);
      }
      
      if (storeType === 'physical' && !isSubscriptionActive) {
        setCreatedStore(newStore);
        setStep(4); // Go to subscription step
      } else {
        setIsOpen(false);
        navigate(`/store/${newStore.id}/design`);
      }
    }
  };

  const nextStep = () => {
    if (step === 2 && !storeName.trim()) {
      toast({ title: 'Champ requis', description: 'Veuillez donner un nom à votre boutique.', variant: 'destructive' });
      return;
    }
    setStep(s => Math.min(s + 1, steps.length));
  };
  
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const resetWizard = () => {
    setStep(1);
    setStoreName('');
    setStoreType('digital');
    setCreatedStore(null);
  };
  
  const handleOpenChange = (open) => {
    if (!open) {
      resetWizard();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
           {disabled ? <Lock className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
           Créer une Boutique
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
      <DialogContent className="sm:max-w-[480px]" aria-labelledby="create-store-title">
        <DialogHeader>
          <DialogTitle id="create-store-title" className="text-2xl font-bold text-center">Création de votre boutique</DialogTitle>
          <DialogDescription className="text-center">Suivez les étapes pour lancer votre nouvelle boutique en ligne.</DialogDescription>
        </DialogHeader>

        {step < 4 && (
          <div className="flex justify-center my-4">
            {steps.map((s, index) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    step > s.id ? "bg-green-500 text-white" : step === s.id ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground"
                  )}>
                    {s.id}
                  </div>
                  <p className={cn("text-xs mt-1", step >= s.id ? "text-foreground" : "text-muted-foreground")}>{s.title}</p>
                </div>
                {index < steps.length - 1 && <div className={cn("flex-1 h-0.5 mt-4", step > s.id ? "bg-green-500" : "bg-muted")} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="min-h-[220px] py-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {step === 1 && (
                      <div className="space-y-4">
                          <h3 className="font-semibold text-lg text-center">Quel type de produits vendez-vous ?</h3>
                          <RadioGroup defaultValue={storeType} onValueChange={setStoreType} className="grid grid-cols-1 gap-4">
                              <Label htmlFor="type-digital" className={cn("flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground", storeType === 'digital' && "border-primary")}>
                                  <RadioGroupItem value="digital" id="type-digital" className="sr-only" />
                                  <Sparkles className="mb-3 h-6 w-6 text-primary" />
                                  Produits digitaux
                                  <span className="block text-sm text-muted-foreground mt-1">Formations, e-books, logiciels, etc.</span>
                              </Label>
                              <Label htmlFor="type-physical" className={cn("flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground", storeType === 'physical' && "border-primary")}>
                                  <RadioGroupItem value="physical" id="type-physical" className="sr-only" />
                                  <Store className="mb-3 h-6 w-6 text-indigo-500" />
                                  Produits physiques
                                  <span className="block text-sm text-muted-foreground mt-1">Vêtements, électronique, artisanat, etc.</span>
                              </Label>
                          </RadioGroup>
                      </div>
                  )}

                  {step === 2 && (
                      <div className="space-y-2">
                        <Label htmlFor="storeName" className="text-lg font-semibold">Quel est le nom de votre boutique ?</Label>
                        <p className="text-sm text-muted-foreground">Vous pourrez le changer plus tard.</p>
                        <Input id="storeName" placeholder="Ex: Trésors d'Afrique" value={storeName} onChange={(e) => setStoreName(e.target.value)} autoFocus />
                      </div>
                  )}
                  
                  {step === 3 && (
                      <div className="text-center space-y-4">
                        <h3 className="text-lg font-semibold">Prêt à lancer ?</h3>
                        <Card className="text-left">
                          <CardContent className="p-4 space-y-2">
                              <p><strong>Nom :</strong> {storeName}</p>
                              <p><strong>Type :</strong> {storeType === 'digital' ? 'Produits Digitaux' : 'Produits Physiques'}</p>
                          </CardContent>
                        </Card>
                        <p className="text-xs text-muted-foreground">Vous pourrez personnaliser le design et ajouter des produits juste après.</p>
                      </div>
                  )}

                  {step === 4 && (
                      <div className="text-center space-y-4">
                        <CreditCard className="mx-auto h-12 w-12 text-primary" />
                        <h3 className="text-lg font-semibold">Abonnement Requis</h3>
                        <p className="text-muted-foreground">
                          Les boutiques de produits physiques nécessitent un abonnement actif.
                          Veuillez choisir une formule pour pouvoir publier votre boutique.
                        </p>
                      </div>
                  )}
                </motion.div>
            </AnimatePresence>
        </div>

        <DialogFooter className="flex justify-between w-full">
            {step > 1 && step < 4 && <Button variant="outline" onClick={prevStep}>Précédent</Button>}
            {step < 3 && <Button onClick={nextStep} className="ml-auto">Suivant</Button>}
            {step === 3 && <Button onClick={handleCreateStore} disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin mr-2" /> : null} Lancer ma boutique</Button>}
            {step === 4 && (
              <div className="w-full flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full" onClick={() => { setIsOpen(false); navigate(`/store/${createdStore.id}/design`); }}>
                  Modifier plus tard
                </Button>
                <Button className="w-full" onClick={() => navigate('/pricing')}>
                  Voir les abonnements
                </Button>
              </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStoreWizard;