import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Palette, Bell, CreditCard, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currencies } from '@/lib/currencies';
import DomainSettings from '@/components/store/DomainSettings';

export default function StoreSettings() {
  const { store, updateStore, isSaving } = useOutletContext();
  const [settings, setSettings] = useState(store.settings || {});
  const [theme, setTheme] = useState(store.theme || {});
  const [storeDetails, setStoreDetails] = useState({
    name: store.name || '',
    description: store.description || '',
  });

  useEffect(() => {
    setSettings(store.settings || {});
    setTheme(store.theme || {});
    setStoreDetails({
      name: store.name || '',
      description: store.description || '',
    });
  }, [store]);

  const handleStoreDetailChange = (e) => {
    const { name, value } = e.target;
    setStoreDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      let current = newSettings;
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = current[path[i]] || {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSaveChanges = async () => {
    await updateStore({
      name: storeDetails.name,
      description: storeDetails.description,
      settings: settings,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paramètres de la boutique</h1>
          <p className="text-muted-foreground">Gérez les informations et les configurations de votre boutique.</p>
        </div>
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Sauvegarder
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general"><Globe className="w-4 h-4 mr-2"/>Général</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="w-4 h-4 mr-2"/>Paiements</TabsTrigger>
          <TabsTrigger value="domain"><Globe className="w-4 h-4 mr-2"/>Domaine</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
              <CardDescription>Modifiez le nom et la description de votre boutique.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="storeName">Nom de la boutique</Label>
                <Input id="storeName" name="name" value={storeDetails.name} onChange={handleStoreDetailChange} />
              </div>
              <div>
                <Label htmlFor="storeDescription">Description</Label>
                <Textarea id="storeDescription" name="description" value={storeDetails.description} onChange={handleStoreDetailChange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Méthodes de Paiement</CardTitle>
              <CardDescription>Configurez les options de paiement pour vos clients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {store.store_type === 'physical' && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="cashOnDelivery" className="font-medium">Paiement à la livraison</Label>
                    <p className="text-sm text-muted-foreground">Permettez aux clients de payer en espèces lors de la livraison.</p>
                  </div>
                  <Switch
                    id="cashOnDelivery"
                    checked={settings.payments?.cashOnDelivery || false}
                    onCheckedChange={(checked) => handleSettingsChange(['payments', 'cashOnDelivery'], checked)}
                  />
                </div>
              )}
              {store.store_type === 'digital' && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="apiweb_enabled" className="font-medium">Paiement en ligne (API Web)</Label>
                    <p className="text-sm text-muted-foreground">Acceptez les paiements par Mobile Money et carte.</p>
                  </div>
                  <Switch
                    id="apiweb_enabled"
                    checked={settings.payments?.apiweb_enabled || false}
                    onCheckedChange={(checked) => handleSettingsChange(['payments', 'apiweb_enabled'], checked)}
                  />
                </div>
              )}
               <div className="space-y-2">
                <Label htmlFor="currency">Devise de la boutique</Label>
                <Select
                  value={settings.currency || 'XOF'}
                  onValueChange={(value) => handleSettingsChange(['currency'], value)}
                >
                  <SelectTrigger id="currency" className="w-[180px]">
                    <SelectValue placeholder="Sélectionner une devise" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain" className="mt-6">
          <DomainSettings store={store} updateStore={updateStore} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}