import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Settings, CreditCard, Truck, Globe, Link as LinkIcon, MessageSquare, Mail, Facebook, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { PhoneInput } from '@/components/ui/phone-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TikTokIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" {...props}>
    <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
  </svg>
);

export default function SettingsTab({ store, setStore }) {
  const [onlinePaymentProviders, setOnlinePaymentProviders] = useState([]);
  
  useEffect(() => {
    const fetchPaymentProviders = async () => {
        const { data, error } = await supabase
            .from('payment_providers')
            .select('*')
            .eq('is_active', true)
            .contains('types', ['pay-in']);
        
        if (error) {
            console.error("Error fetching payment providers", error);
        } else {
            setOnlinePaymentProviders(data);
        }
    };
    fetchPaymentProviders();
  }, []);

  const updateSettings = (field, value) => {
    setStore(prev => ({
      ...prev,
      settings: { ...(prev.settings || {}), [field]: value }
    }));
  };

  const updatePaymentSettings = (providerSlug, isEnabled) => {
    setStore(prev => {
        const newPayments = { ...(prev.settings?.payments || {}), [`${providerSlug}_enabled`]: isEnabled };
        return { ...prev, settings: { ...(prev.settings || {}), payments: newPayments } };
    });
  };

  const updatePixelSettings = (pixelType, value) => {
    setStore(prev => ({
        ...prev,
        settings: {
            ...prev.settings,
            pixels: {
                ...(prev.settings?.pixels || {}),
                [pixelType]: value
            }
        }
    }));
  };

  const handleConnectDomain = () => {
    toast({
      title: "🚧 Connexion de domaine",
      description: "Pour connecter votre domaine, veuillez créer un enregistrement CNAME pointant vers 'cname.payliv.com'. La propagation peut prendre jusqu'à 24 heures.",
      duration: 9000,
    });
  };
  
  const hostingerReferralLink = "https://hostinger.com?REFERRALCODE=1GSTARTUPDI94";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-semibold text-foreground">Paiements en ligne</h3>
        </div>
        <div className="space-y-4">
            <Alert>
                <KeyRound className="h-4 w-4" />
                <AlertTitle>Important !</AlertTitle>
                <AlertDescription>
                    Ces options ne fonctionnent que si le super administrateur a configuré les clés API correspondantes.
                </AlertDescription>
            </Alert>
            {onlinePaymentProviders.map(provider => (
                <div key={provider.slug} className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor={`payment-${provider.slug}`} className="flex items-center gap-3">
                        <img src={provider.logo_url} alt={provider.name} className="w-10 h-auto"/>
                        <span>Activer {provider.name}</span>
                    </Label>
                    <Switch
                        id={`payment-${provider.slug}`}
                        checked={!!store.settings?.payments?.[`${provider.slug}_enabled`]}
                        onCheckedChange={(checked) => updatePaymentSettings(provider.slug, checked)}
                    />
                </div>
            ))}
        </div>
      </div>
      
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center space-x-3 mb-6">
          <Truck className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-semibold text-foreground">Paiement à la livraison</h3>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="cod_enabled" className="flex items-center gap-3">Activer le paiement à la livraison</Label>
          <Switch
            id="cod_enabled"
            checked={!!store.settings?.payments?.cashOnDelivery}
            onCheckedChange={(checked) => setStore(prev => ({ ...prev, settings: { ...prev.settings, payments: { ...(prev.settings?.payments || {}), cashOnDelivery: checked }}}))}
          />
        </div>
      </div>
      
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center space-x-3 mb-6">
          <MessageSquare className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-foreground">Informations de contact</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="whatsapp_number">Numéro WhatsApp</Label>
            <PhoneInput
              id="whatsapp_number"
              value={store.settings?.whatsapp_number || ''}
              onChange={(phone) => updateSettings('whatsapp_number', phone)}
              className="bg-background mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">Sera affiché sur votre boutique pour que les clients vous contactent.</p>
          </div>
          <div>
            <Label htmlFor="email">Adresse e-mail de contact</Label>
            <Input id="email" type="email" value={store.settings?.email || ''} onChange={(e) => updateSettings('email', e.target.value)} className="bg-background mt-2" />
          </div>
        </div>
      </div>

    </motion.div>
  );
}