import React, { useState } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Loader2 } from 'lucide-react';

    const UpdatePayoutStatusDialog = ({ isOpen, onOpenChange, payout, action, onSuccess }) => {
      const [rejectionReason, setRejectionReason] = useState('');
      const [loading, setLoading] = useState(false);
      const { toast } = useToast();

      const handleConfirm = async () => {
        if (!payout) return;
        setLoading(true);

        const newStatus = action === 'approve' ? 'approved' : 'rejected';

        if (newStatus === 'rejected' && !rejectionReason) {
          toast({ title: 'Erreur', description: 'Veuillez fournir une raison pour le rejet.', variant: 'destructive' });
          setLoading(false);
          return;
        }

        try {
          const { error } = await supabase.rpc('admin_update_payout_status', {
            p_payout_id: payout.payout_id,
            p_table_name: payout.table_name,
            p_new_status: newStatus,
            p_rejection_reason: rejectionReason,
          });

          if (error) throw error;
          
          // Send email to user
          const subject = newStatus === 'approved' ? 'Votre paiement a été approuvé !' : 'Mise à jour de votre demande de paiement';
          const html = `
            <h1>Mise à jour du statut de votre paiement</h1>
            <p>Bonjour ${payout.user_name || 'Utilisateur'},</p>
            <p>Le statut de votre demande de retrait de <strong>${payout.amount.toLocaleString()} XOF</strong> a été mis à jour par un administrateur : <strong>${newStatus === 'approved' ? 'Approuvé' : 'Rejeté'}</strong>.</p>
            ${newStatus === 'rejected' ? `<p><strong>Raison :</strong> ${rejectionReason}</p>` : ''}
            <p>Vous pouvez consulter les détails dans votre tableau de bord.</p>
            <p>Merci,<br>L'équipe PayLiv</p>
          `;

          await supabase.functions.invoke('send-transactional-email', {
            body: { to: payout.user_email, subject, html },
          });

          toast({ title: 'Succès', description: `Le statut du paiement a été mis à jour et l'utilisateur a été notifié.` });
          onSuccess();
          onOpenChange(false);
        } catch (err) {
          toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      };

      if (!payout) return null;

      const isApproving = action === 'approve';

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isApproving ? 'Approuver' : 'Rejeter'} le paiement ?</DialogTitle>
              <DialogDescription>
                Vous êtes sur le point de {isApproving ? 'approuver' : 'rejeter'} manuellement le paiement de {payout.amount.toLocaleString()} FCFA pour {payout.user_name}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {isApproving ? (
                <p>En confirmant, le solde de l'utilisateur sera débité et le statut du paiement passera à "Approuvé". L'utilisateur recevra une notification par email.</p>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Raison du rejet</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ex: Informations de paiement incorrectes."
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
              <Button onClick={handleConfirm} disabled={loading} variant={isApproving ? 'default' : 'destructive'}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer et Notifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default UpdatePayoutStatusDialog;