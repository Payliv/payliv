import React, { useState, useEffect } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
    } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Loader2 } from 'lucide-react';
    import { PhoneInput } from '@/components/ui/phone-input';
    import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    } from "@/components/ui/select"
    import { westAfricanCountries } from '@/lib/westAfricanCountries';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    const PayoutRequestDialog = ({ isOpen, onOpenChange, balance, payoutType, onSuccessfulRequest }) => {
      const { toast } = useToast();
      const { user } = useAuth();
      const [amount, setAmount] = useState('');
      const [loading, setLoading] = useState(false);
      const [paymentDetails, setPaymentDetails] = useState({
        phoneNumber: '',
        countryCode: 'CI',
        withdrawMode: 'orange-money-ci'
      });

      const availableMethods = westAfricanCountries
        .find(c => c.code === paymentDetails.countryCode)?.methods || [];

      useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setPaymentDetails({
                phoneNumber: '',
                countryCode: 'CI',
                withdrawMode: 'orange-money-ci'
            });
        }
      }, [isOpen]);

      useEffect(() => {
        if (!availableMethods.some(m => m.value === paymentDetails.withdrawMode)) {
          setPaymentDetails(prev => ({ ...prev, withdrawMode: availableMethods[0]?.value || '' }));
        }
      }, [paymentDetails.countryCode, availableMethods, paymentDetails.withdrawMode]);


      const handleSubmit = async () => {
        const payoutAmount = parseFloat(amount);
        if (isNaN(payoutAmount) || payoutAmount <= 0) {
          toast({ title: "Montant invalide", description: "Veuillez entrer un montant valide.", variant: "destructive" });
          return;
        }
        if (payoutAmount > balance) {
          toast({ title: "Solde insuffisant", description: "Le montant demandé dépasse votre solde disponible.", variant: "destructive" });
          return;
        }
        if (!paymentDetails.phoneNumber || !paymentDetails.withdrawMode) {
          toast({ title: "Détails manquants", description: "Veuillez fournir un numéro de téléphone et une méthode de retrait.", variant: "destructive" });
          return;
        }
        
        setLoading(true);

        const rpcName = payoutType === 'partner' ? 'request_partner_payout' : 'request_affiliate_payout';
        const p_details = {
          countryCode: paymentDetails.countryCode,
          withdrawMode: paymentDetails.withdrawMode,
          phoneNumber: paymentDetails.phoneNumber
        };

        try {
          const { data: payoutId, error: rpcError } = await supabase.rpc(rpcName, {
            p_amount: payoutAmount,
            p_method: 'money_fusion',
            p_details: p_details
          });

          if (rpcError) throw new Error(rpcError.message);

          // Notify Admin
          const subject = `Nouvelle demande de retrait - ${payoutAmount.toLocaleString()} XOF`;
          const html = `
            <h1>Nouvelle demande de retrait</h1>
            <p>Une nouvelle demande de retrait a été soumise.</p>
            <ul>
              <li><strong>Utilisateur:</strong> ${user.email}</li>
              <li><strong>Type:</strong> ${payoutType}</li>
              <li><strong>Montant:</strong> ${payoutAmount.toLocaleString()} XOF</li>
              <li><strong>Méthode:</strong> ${p_details.withdrawMode}</li>
              <li><strong>Numéro:</strong> ${p_details.phoneNumber}</li>
            </ul>
            <p>Veuillez consulter le tableau de bord d'administration pour la traiter.</p>
          `;
          await supabase.functions.invoke('send-transactional-email', {
            body: { to: 'contact@gstartup.pro', subject, html },
          });

          toast({ title: "Demande reçue", description: "Traitement automatique en cours...", variant: "success" });

          const tableName = payoutType === 'partner' ? 'partner_payouts' : 'affiliate_payouts';
          const { error: functionError } = await supabase.functions.invoke('automated-payout-handler', {
            body: { payout_id: payoutId, table_name: tableName }
          });

          if (functionError) {
            throw new Error(`Le traitement automatique a échoué. Un administrateur examinera votre demande. ${functionError.message}`);
          }

          toast({ title: "Traitement initié", description: "Votre paiement a été envoyé au fournisseur. Vous recevrez une notification de leur part.", variant: "success" });
          
          onOpenChange(false);
          if (onSuccessfulRequest) onSuccessfulRequest();

        } catch (error) {
          toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Demander un retrait</DialogTitle>
              <DialogDescription>
                Votre solde disponible est de {balance ? balance.toLocaleString() : 0} FCFA. Les demandes sont traitées automatiquement.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (FCFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 5000"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Pays</Label>
                <Select 
                  value={paymentDetails.countryCode} 
                  onValueChange={(value) => setPaymentDetails(prev => ({...prev, countryCode: value}))}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {westAfricanCountries.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Méthode de retrait</Label>
                <Select 
                  value={paymentDetails.withdrawMode} 
                  onValueChange={(value) => setPaymentDetails(prev => ({...prev, withdrawMode: value}))}
                  disabled={loading || availableMethods.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMethods.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <PhoneInput
                  id="phone"
                  country={paymentDetails.countryCode}
                  onCountryChange={(newCountry) => setPaymentDetails(prev => ({...prev, countryCode: newCountry}))}
                  value={paymentDetails.phoneNumber}
                  onChange={(value) => setPaymentDetails(prev => ({...prev, phoneNumber: value}))}
                  placeholder="Entrez le numéro de téléphone"
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Soumettre la demande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default PayoutRequestDialog;