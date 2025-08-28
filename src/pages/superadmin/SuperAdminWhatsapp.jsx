import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Rocket, Cloud } from 'lucide-react';

const SuperAdminWhatsapp = () => {
  const [settings, setSettings] = useState({
    whatsapp_provider: '',
    whatsapp_api_url: '',
    whatsapp_api_key: '',
    whatsapp_sender_number: '',
    whatsapp_waba_id: '',
    whatsapp_template_seller: '',
    whatsapp_template_customer: '',
    whatsapp_template_payout_request: '',
    whatsapp_template_payout_approved: '',
    whatsapp_template_payout_rejected: '',
    whatsapp_template_payment_received: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [ycloudBalance, setYcloudBalance] = useState(null);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('superadmin_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de chargement',
        description: 'Impossible de charger les paramètres WhatsApp.',
      });
      console.error(error);
    } else if (data) {
      setSettings(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    const { id, ...updateData } = settings;
    const { error } = await supabase
      .from('superadmin_settings')
      .update(updateData)
      .eq('id', 1);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder les paramètres.',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Paramètres WhatsApp sauvegardés avec succès.',
      });
    }
    setSaving(false);
  };

  const handleCheckBalance = async () => {
    setCheckingBalance(true);
    setYcloudBalance(null);
    try {
      const { data, error } = await supabase.functions.invoke('ycloud-balance');

      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
         throw new Error(data.error);
      }

      setYcloudBalance(data);
      toast({
        title: 'Solde récupéré',
        description: `Le solde de votre compte YCloud a été récupéré avec succès.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de vérification du solde',
        description: error.message,
      });
    } finally {
      setCheckingBalance(false);
    }
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.h1 variants={itemVariants} className="text-3xl font-bold">Paramètres WhatsApp</motion.h1>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration de l'API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp_provider">Fournisseur (ex: ycloud)</Label>
                <Input id="whatsapp_provider" value={settings.whatsapp_provider || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="whatsapp_api_url">URL de l'API</Label>
                <Input id="whatsapp_api_url" value={settings.whatsapp_api_url || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="whatsapp_api_key">Clé API (stockée dans les secrets)</Label>
                <Input id="whatsapp_api_key" placeholder="********" value={settings.whatsapp_api_key ? '********' : ''} readOnly />
                <p className="text-sm text-muted-foreground mt-1">La clé API est gérée via les secrets Supabase pour plus de sécurité.</p>
              </div>
               <div>
                <Label htmlFor="whatsapp_waba_id">ID du compte WhatsApp Business (WABA ID)</Label>
                <Input id="whatsapp_waba_id" value={settings.whatsapp_waba_id || ''} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="whatsapp_sender_number">Numéro d'expédition</Label>
                <Input id="whatsapp_sender_number" value={settings.whatsapp_sender_number || ''} onChange={handleInputChange} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Modèles de messages (Templates)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="whatsapp_template_seller">Nouvelle commande (Vendeur)</Label>
                        <Input id="whatsapp_template_seller" value={settings.whatsapp_template_seller || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="whatsapp_template_customer">Confirmation (Client)</Label>
                        <Input id="whatsapp_template_customer" value={settings.whatsapp_template_customer || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="whatsapp_template_payout_request">Demande de retrait (Admin)</Label>
                        <Input id="whatsapp_template_payout_request" value={settings.whatsapp_template_payout_request || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="whatsapp_template_payout_approved">Retrait approuvé (Utilisateur)</Label>
                        <Input id="whatsapp_template_payout_approved" value={settings.whatsapp_template_payout_approved || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="whatsapp_template_payout_rejected">Retrait rejeté (Utilisateur)</Label>
                        <Input id="whatsapp_template_payout_rejected" value={settings.whatsapp_template_payout_rejected || ''} onChange={handleInputChange} />
                    </div>
                    <div>
                        <Label htmlFor="whatsapp_template_payment_received">Paiement reçu (Utilisateur)</Label>
                        <Input id="whatsapp_template_payment_received" value={settings.whatsapp_template_payment_received || ''} onChange={handleInputChange} />
                    </div>
                </div>
            </CardContent>
             <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                  Enregistrer les modifications
                </Button>
              </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Cloud className="mr-2"/>Compte YCloud</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Vérifiez le solde de votre compte YCloud pour vous assurer que vous pouvez envoyer des messages.</p>
              <Button onClick={handleCheckBalance} disabled={checkingBalance} className="w-full">
                {checkingBalance ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Vérifier le solde
              </Button>
              {ycloudBalance && (
                <div className="mt-6 text-center bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Solde Actuel</p>
                  <p className="text-3xl font-bold tracking-tight text-primary">
                    {parseFloat(ycloudBalance.balance).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: ycloudBalance.currency,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuperAdminWhatsapp;