import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '@/components/PageLoader';
import { Helmet } from 'react-helmet-async';
import { Check, Loader2 } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';

export default function Settings() {
  const { user } = useAuth();
  const { profile, loadingProfile } = useProfile();
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(data);
      
    } catch (error) {
      toast({ title: 'Erreur', description: "Impossible de charger les paramètres.", variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdate = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { general, payments, notifications } = settings;
      const { error } = await supabase
        .from('settings')
        .update({
          general,
          payments: { ...payments, tax_rate: Number(payments.tax_rate) || 0 },
          notifications,
          updated_at: new Date(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      toast({
        title: 'Succès !',
        description: 'Vos paramètres ont été mis à jour.',
        action: <Check className="h-5 w-5 text-green-500" />,
      });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder les paramètres.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || loadingProfile) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Paramètres - PayLiv</title>
        <meta name="description" content="Gérez les paramètres de votre compte et de vos boutiques." />
      </Helmet>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text">Paramètres</h1>
          <p className="text-muted-foreground mt-2">Gérez les informations de votre compte et les notifications.</p>
        </div>

        <AnimatePresence>
        {settings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Informations Générales</CardTitle>
                <CardDescription>Informations légales et fiscales de votre entreprise.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Nom de l'entreprise</Label>
                    <Input id="companyName" value={settings.general?.companyName || ''} onChange={(e) => handleUpdate('general', 'companyName', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Input id="address" value={settings.general?.address || ''} onChange={(e) => handleUpdate('general', 'address', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="nif">N° Identification Fiscal (NIF)</Label>
                    <Input id="nif" value={settings.general?.nif || ''} onChange={(e) => handleUpdate('general', 'nif', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="rccm">N° RCCM</Label>
                    <Input id="rccm" value={settings.general?.rccm || ''} onChange={(e) => handleUpdate('general', 'rccm', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="tax_id">N° Compte Contribuable</Label>
                    <Input id="tax_id" value={settings.general?.tax_id || ''} onChange={(e) => handleUpdate('general', 'tax_id', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paiements</CardTitle>
                 <CardDescription>Configurez les options de paiement et de facturation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Switch
                      id="cashOnDelivery"
                      checked={settings.payments?.cashOnDelivery || false}
                      onCheckedChange={(checked) => handleUpdate('payments', 'cashOnDelivery', checked)}
                    />
                    <Label htmlFor="cashOnDelivery">Activer le paiement à la livraison pour les produits physiques</Label>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <Input id="currency" value={settings.payments?.currency || 'XOF'} onChange={(e) => handleUpdate('payments', 'currency', e.target.value)} />
                  </div>
                   <div>
                    <Label htmlFor="tax_rate">Taux de TVA (%)</Label>
                    <Input id="tax_rate" type="number" value={settings.payments?.tax_rate || '18'} onChange={(e) => handleUpdate('payments', 'tax_rate', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être notifié.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Notifications par e-mail</Label>
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications?.emailNotifications || false}
                    onCheckedChange={(checked) => handleUpdate('notifications', 'emailNotifications', checked)}
                  />
                </div>
                 <div className="flex items-center justify-between">
                  <Label htmlFor="orderAlerts">Alertes pour chaque nouvelle commande</Label>
                  <Switch
                    id="orderAlerts"
                    checked={settings.notifications?.orderAlerts || false}
                    onCheckedChange={(checked) => handleUpdate('notifications', 'orderAlerts', checked)}
                  />
                </div>
                 <div className="flex items-center justify-between">
                  <Label htmlFor="marketingEmails">Recevoir les e-mails marketing de PayLiv</Label>
                  <Switch
                    id="marketingEmails"
                    checked={settings.notifications?.marketingEmails || false}
                    onCheckedChange={(checked) => handleUpdate('notifications', 'marketingEmails', checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="orderRecipientEmail">E-mail pour les notifications de commande</Label>
                  <Input 
                    type="email"
                    id="orderRecipientEmail"
                    value={settings.notifications?.orderRecipientEmail || ''}
                    onChange={(e) => handleUpdate('notifications', 'orderRecipientEmail', e.target.value)}
                    placeholder={user.email}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sauvegarder les changements
              </Button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}