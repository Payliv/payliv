import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { WalletCards, Edit, Loader2, Copy, KeyRound } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const PaymentProviderForm = ({ provider, onSave, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isActive, setIsActive] = useState(provider.is_active);
  const { toast } = useToast();

  const webhookUrl = `${supabase.supabaseUrl}/functions/v1/${provider.slug}-webhook-handler`;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ is_active: isActive });
    setIsSaving(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copié !', description: 'URL copiée dans le presse-papiers.' });
  };

  return (
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <img src={provider.logo_url} alt={provider.name} className="w-6 h-6 mr-2" />
          Configurer {provider.name}
        </DialogTitle>
        <DialogDescription>
          Activez ou désactivez ce fournisseur de paiement et gérez sa configuration.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="is_active" className="font-semibold">Activer le fournisseur</Label>
            <p className="text-xs text-muted-foreground">
              Permettre aux utilisateurs d'utiliser ce moyen de paiement.
            </p>
          </div>
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
        
        {provider.types.includes('pay-in') && (
            <div>
                 <h3 className="font-semibold mb-2">URL de Notification Instantanée (IPN)</h3>
                 <p className="text-xs text-muted-foreground mb-2">
                    Copiez cette URL et collez-la dans le champ "URL de notification" de votre compte {provider.name}.
                 </p>
                 <div className="flex items-center space-x-2">
                     <Input readOnly value={webhookUrl} className="bg-muted" />
                     <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl)}>
                         <Copy className="h-4 w-4" />
                     </Button>
                 </div>
            </div>
        )}

        <div>
           <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="api-keys">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Configuration des Clés API
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Alert>
                  <AlertDescription>
                    <p className="mb-2">
                      Pour des raisons de sécurité, les clés API et les secrets ne sont pas gérés ici. Vous devez les configurer en tant que "Secrets" dans votre tableau de bord Supabase.
                    </p>
                    <p className="font-semibold mb-1">Voici les secrets à créer pour {provider.name}:</p>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      {provider.credentials_schema?.map(field => (
                        <li key={field.name}>
                          Nom du Secret: <Badge variant="outline">{field.name}</Badge>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3">
                      Rendez-vous dans la section "Project Settings" {'>'} "Secrets" de votre projet Supabase pour les ajouter.
                    </p>
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</> : 'Sauvegarder'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};


export default function SuperAdminPaymentProviders() {
  const { toast } = useToast();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payment_providers')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast({ title: "Erreur", description: "Impossible de charger les fournisseurs de paiement.", variant: "destructive" });
    } else {
      setProviders(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSaveProvider = async (updates) => {
    if (!selectedProvider) return;

    const { error } = await supabase
      .from('payment_providers')
      .update(updates)
      .eq('id', selectedProvider.id);

    if (error) {
      toast({ title: "Erreur", description: "La mise à jour a échoué.", variant: "destructive" });
    } else {
      toast({ title: "Succès", description: `${selectedProvider.name} mis à jour.` });
      setSelectedProvider(null);
      fetchProviders();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2 flex items-center">
          <WalletCards className="w-8 h-8 mr-3" />
          Fournisseurs de Paiement
        </h1>
        <p className="text-muted-foreground">
          Gérez les intégrations des API de paiement pour les encaissements et les décaissements.
        </p>
      </motion.div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Liste des Fournisseurs</CardTitle>
          <CardDescription>Activez, désactivez et configurez les fournisseurs de paiement disponibles sur la plateforme.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium flex items-center">
                      {provider.logo_url && <img src={provider.logo_url} alt={provider.name} className="w-8 h-auto mr-3" />}
                      {provider.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {provider.types.map(type => (
                          <Badge key={type} variant={type === 'pay-in' ? 'default' : 'secondary'} className="capitalize">
                            {type === 'pay-in' ? 'Encaissement' : 'Décaissement'}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.is_active ? 'success' : 'destructive'}>
                        {provider.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedProvider(provider)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedProvider && (
        <Dialog open={!!selectedProvider} onOpenChange={(isOpen) => !isOpen && setSelectedProvider(null)}>
          <PaymentProviderForm 
            provider={selectedProvider}
            onSave={handleSaveProvider}
            onCancel={() => setSelectedProvider(null)}
          />
        </Dialog>
      )}
    </div>
  );
}