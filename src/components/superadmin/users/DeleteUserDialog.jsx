import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";
    import { Loader2 } from 'lucide-react';

    export const DeleteUserDialog = ({ isOpen, setIsOpen, user, onConfirm, isLoading }) => {
      if (!user) return null;

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="bg-card border-border" aria-labelledby="delete-user-title">
            <DialogHeader>
              <DialogTitle id="delete-user-title">Supprimer l'utilisateur</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement {user.name || user.email} ? Cette action est irréversible et supprimera toutes ses données, y compris ses boutiques.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              <Button variant="destructive" onClick={() => onConfirm({ p_user_id: user.id })} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Suppression...' : 'Confirmer la suppression'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };