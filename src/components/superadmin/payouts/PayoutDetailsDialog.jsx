import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
    import { Badge } from '@/components/ui/badge';

    const PayoutDetailsDialog = ({ isOpen, onOpenChange, payout }) => {
      if (!payout) return null;

      const PayoutStatusBadge = ({ status }) => {
        const variants = {
          pending: 'default',
          sent_to_provider: 'secondary',
          approved: 'success',
          rejected: 'destructive',
        };
        const text = {
          pending: 'En attente',
          sent_to_provider: 'En cours',
          approved: 'Approuvé',
          rejected: 'Rejeté',
        };
        return <Badge variant={variants[status] || 'outline'}>{text[status] || status}</Badge>;
      };

      const DetailItem = ({ label, value }) => (
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-sm font-medium text-foreground">{value || 'N/A'}</span>
        </div>
      );

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de la demande de retrait</DialogTitle>
              <DialogDescription>
                ID: {payout.payout_id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <DetailItem label="Utilisateur" value={payout.user_name} />
              <DetailItem label="Email" value={payout.user_email} />
              <DetailItem label="Type de paiement" value={payout.payout_type} />
              <DetailItem label="Montant" value={`${payout.amount.toLocaleString()} FCFA`} />
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <PayoutStatusBadge status={payout.status} />
              </div>
              <DetailItem label="Date de la demande" value={new Date(payout.requested_at).toLocaleString('fr-FR')} />
              <DetailItem label="Date de traitement" value={payout.processed_at ? new Date(payout.processed_at).toLocaleString('fr-FR') : 'N/A'} />

              <div className="pt-4">
                  <h3 className="text-md font-semibold mb-2">Informations de paiement</h3>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <DetailItem label="Pays" value={payout.payment_details?.countryCode} />
                    <DetailItem label="Méthode" value={payout.payment_details?.withdrawMode} />
                    <DetailItem label="Numéro de téléphone" value={payout.payment_details?.phoneNumber} />
                  </div>
              </div>

              {payout.rejection_reason && (
                <div className="pt-4">
                  <h3 className="text-md font-semibold mb-2 text-destructive">Raison du rejet</h3>
                  <p className="text-sm p-3 bg-destructive/10 rounded-lg">{payout.rejection_reason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    };

    export default PayoutDetailsDialog;