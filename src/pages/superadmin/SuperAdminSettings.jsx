import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState({
    base_domain: '',
    affiliate_program_enabled: false,
    affiliate_commission_rate: 0,
    payment_gateway_mode_live: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
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
          description: 'Impossible de charger les paramètres de la plateforme.',
        });
      } else if (data) {
        setSettings({
          base_domain: data.base_domain || '',
          affiliate_program_enabled: data.affiliate_program_enabled || false,
          affiliate_commission_rate: data.affiliate_commission_rate || 0,
          payment_gateway_mode_live: data.payment_gateway_mode_live || false,
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, [toast]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSwitchChange = (name, checked) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('superadmin_settings')
      .update({
        base_domain: settings.base_domain,
        affiliate_program_enabled: settings.affiliate_program_enabled,
        affiliate_commission_rate: settings.affiliate_commission_rate,
        payment_gateway_mode_live: settings.payment_gateway_mode_live,
      })
      .eq('id', 1);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres.',
      });
    } else {
      toast({
        title: 'Succès',
        description: 'Paramètres sauvegardés avec succès.',
      });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <Helmet>
        <title>Paramètres de la Plateforme - Super Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Paramètres de la Plateforme</h1>
          <p className="text-muted-foreground">Gérez les configurations globales de PayLiv.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API de Paiement & Domaine</CardTitle>
                <CardDescription>Configurez le domaine de base pour les boutiques et le mode de la passerelle de paiement.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="base_domain">Domaine de base pour les boutiques</Label>
                  <Input
                    id="base_domain"
                    name="base_domain"
                    value={settings.base_domain}
                    onChange={handleInputChange}
                    placeholder="exemple.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Les boutiques seront accessibles via slug.domaine-de-base.com. N'incluez pas http(s)://.
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment_gateway_mode_live" className="text-base">Activer le Mode Live</Label>
                    <p className="text-sm text-muted-foreground">
                      Passez en mode production pour accepter les paiements réels.
                    </p>
                  </div>
                  <Switch
                    id="payment_gateway_mode_live"
                    checked={settings.payment_gateway_mode_live}
                    onCheckedChange={(checked) => handleSwitchChange('payment_gateway_mode_live', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Programme d'Affiliation</CardTitle>
                <CardDescription>Activez et configurez le programme d'affiliation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="affiliate_program_enabled" className="text-base">Activer le programme d'affiliation</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux utilisateurs de devenir des affiliés et de gagner des commissions.
                    </p>
                  </div>
                  <Switch
                    id="affiliate_program_enabled"
                    checked={settings.affiliate_program_enabled}
                    onCheckedChange={(checked) => handleSwitchChange('affiliate_program_enabled', checked)}
                  />
                </div>
                {settings.affiliate_program_enabled && (
                  <div>
                    <Label htmlFor="affiliate_commission_rate">Taux de commission par défaut (%)</Label>
                    <Input
                      id="affiliate_commission_rate"
                      name="affiliate_commission_rate"
                      type="number"
                      value={settings.affiliate_commission_rate}
                      onChange={handleInputChange}
                      placeholder="Ex: 20"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Le pourcentage du paiement d'abonnement qui sera versé à l'affilié.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Sauvegarder les changements
          </Button>
        </div>
      </div>
    </>
  );
};

export default SuperAdminSettings;