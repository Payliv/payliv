import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";
    import { Loader2 } from 'lucide-react';

    export const PromoteToPartnerDialog = ({ isOpen, setIsOpen, user, onConfirm, isLoading }) => {
      if (!user) return null;

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-card border-border" aria-labelledby="promote-partner-title">
            <DialogHeader>
              <DialogTitle id="promote-partner-title">Promouvoir en Fournisseur</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir promouvoir {user.name || user.email} au rang de fournisseur ? Ils pourront créer une boutique et lister des produits pour le dropshipping.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button onClick={() => onConfirm({ p_user_id: user.id })} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Promotion en cours...' : 'Confirmer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };