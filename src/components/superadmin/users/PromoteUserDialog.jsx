import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Loader2 } from 'lucide-react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { toast } from '@/components/ui/use-toast';

    export const PromoteUserDialog = ({ isOpen, setIsOpen, user, onConfirm, isLoading }) => {
      const [plans, setPlans] = useState([]);
      const [selectedPlanId, setSelectedPlanId] = useState('');

      useEffect(() => {
        if (isOpen) {
          const fetchPlans = async () => {
            const { data, error } = await supabase.from('subscription_plans').select('*');
            if (error) {
              toast({ title: "Erreur", description: "Impossible de charger les plans." });
            } else {
              setPlans(data);
            }
          };
          fetchPlans();
        }
      }, [isOpen]);

      const handleConfirm = () => {
        const selectedPlan = plans.find(p => p.id.toString() === selectedPlanId);
        onConfirm({
          p_user_id: user.id,
          p_plan_id: selectedPlanId,
          emailBody: {
            email: user.email,
            name: user.name || user.email,
            planName: selectedPlan?.name || 'Premium'
          }
        });
      };

      if (!user) return null;

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-card border-border" aria-labelledby="promote-user-title">
            <DialogHeader>
              <DialogTitle id="promote-user-title">Promouvoir un utilisateur</DialogTitle>
              <DialogDescription>
                Sélectionnez un plan pour promouvoir {user.name || user.email}. Son abonnement sera activé pour la durée du plan.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select onValueChange={setSelectedPlanId} value={selectedPlanId}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez un plan..." /></SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (<SelectItem key={plan.id} value={plan.id.toString()}>{plan.name} - {plan.price} {plan.currency}/{plan.frequency}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button onClick={handleConfirm} disabled={isLoading || !selectedPlanId}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Promotion en cours...' : 'Promouvoir'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };