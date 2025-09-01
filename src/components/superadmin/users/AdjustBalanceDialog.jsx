import React, { useState } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Textarea } from "@/components/ui/textarea";
    import { Loader2 } from 'lucide-react';
    import { toast } from '@/components/ui/use-toast';

    export const AdjustBalanceDialog = ({ isOpen, setIsOpen, user, onConfirm, isLoading }) => {
      const [adjustmentAmount, setAdjustmentAmount] = useState('');
      const [adjustmentType, setAdjustmentType] = useState('add');
      const [adjustmentReason, setAdjustmentReason] = useState('');

      const handleConfirm = () => {
        if (!adjustmentAmount || !adjustmentReason.trim()) {
            toast({ title: "Erreur", description: "Veuillez remplir tous les champs.", variant: "destructive" });
            return;
        }

        const amount = parseFloat(adjustmentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: "Erreur", description: "Le montant doit être un nombre positif.", variant: "destructive" });
            return;
        }

        const finalAmount = adjustmentType === 'add' ? amount : -amount;
        onConfirm({
            p_user_id: user.id,
            p_amount: finalAmount,
            p_reason: adjustmentReason.trim()
        });
      };

      if (!user) return null;

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-card border-border" aria-labelledby="adjust-balance-title">
              <DialogHeader>
                  <DialogTitle id="adjust-balance-title">Ajuster le solde de {user.name}</DialogTitle>
                  <DialogDescription>
                      Ajoutez ou retirez manuellement des fonds du solde retirable de l'utilisateur. Cette action est enregistrée.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <div className="flex gap-2">
                      <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                          <SelectTrigger className="w-[120px]">
                              <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="add">Ajouter</SelectItem>
                              <SelectItem value="subtract">Retirer</SelectItem>
                          </SelectContent>
                      </Select>
                      <Input 
                          type="number" 
                          placeholder="Montant (FCFA)" 
                          value={adjustmentAmount}
                          onChange={(e) => setAdjustmentAmount(e.target.value)}
                      />
                  </div>
                  <div>
                      <Label htmlFor="reason" className="mb-2 block">Raison de l'ajustement (obligatoire)</Label>
                      <Textarea 
                          id="reason"
                          placeholder="Ex: Bonus pour performance exceptionnelle"
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                      />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
                  <Button onClick={handleConfirm} disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmer l'ajustement
                  </Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };