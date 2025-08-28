import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Clock, Globe, Loader2, XCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const StatusIndicator = ({ status }) => {
  const statusConfig = {
    unconfigured: { icon: <Info className="h-4 w-4" />, text: 'Non configuré', color: 'text-muted-foreground' },
    pending: { icon: <Clock className="h-4 w-4" />, text: 'Vérification en cours...', color: 'text-yellow-500' },
    verified: { icon: <CheckCircle className="h-4 w-4" />, text: 'Vérifié et actif', color: 'text-green-500' },
    error: { icon: <XCircle className="h-4 w-4" />, text: 'Erreur de configuration', color: 'text-destructive' },
  };

  const currentStatus = statusConfig[status] || statusConfig.unconfigured;

  return (
    <div className={`flex items-center text-sm ${currentStatus.color}`}>
      {currentStatus.icon}
      <span className="ml-2">{currentStatus.text}</span>
    </div>
  );
};

export default function DomainSettings({ store, setStore, updateStore }) {
  const [customDomain, setCustomDomain] = useState(store.custom_domain || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSavingDomain, setIsSavingDomain] = useState(false);

  const hostingerReferralLink = "https://hostinger.com?REFERRALCODE=1GSTARTUPDI94";

  const handleCustomDomainSave = async () => {
    setIsSavingDomain(true);
    const { error } = await updateStore({ custom_domain: customDomain, domain_status: 'pending' });
    if (!error) {
      setStore(prev => ({ ...prev, custom_domain: customDomain, domain_status: 'pending' }));
    }
    setIsSavingDomain(false);
  };

  const handleVerifyDomain = async () => {
    if (!store.custom_domain) {
      toast({ title: "Aucun domaine à vérifier", description: "Veuillez d'abord entrer et sauvegarder un domaine personnalisé.", variant: "destructive" });
      return;
    }
    setIsVerifying(true);
    
    // This would be a call to a real edge function
    // const { data, error } = await supabase.functions.invoke('verify-domain', {
    //   body: { domain: store.custom_domain, storeId: store.id }
    // });
    
    // Mocking the function call for now
    await new Promise(resolve => setTimeout(resolve, 2000));
    const error = Math.random() > 0.5 ? { message: "L'enregistrement CNAME ne pointe pas vers cname.payliv.shop" } : null;
    const data = error ? { status: 'error' } : { status: 'verified' };
    // End of mock

    setIsVerifying(false);

    if (error) {
      toast({ title: "Échec de la vérification", description: error.message, variant: "destructive" });
      setStore(prev => ({ ...prev, domain_status: 'error', domain_last_checked: new Date().toISOString() }));
      updateStore({ domain_status: 'error', domain_last_checked: new Date().toISOString() });
    } else {
      toast({ title: "Domaine vérifié !", description: "Votre domaine est maintenant connecté à votre boutique.", variant: "success" });
      setStore(prev => ({ ...prev, domain_status: data.status, domain_last_checked: new Date().toISOString() }));
      updateStore({ domain_status: data.status, domain_last_checked: new Date().toISOString() });
    }
  };

  const domainStatus = useMemo(() => store.domain_status || 'unconfigured', [store.domain_status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Globe className="w-5 h-5 mr-2 text-primary" />Domaine Personnalisé</CardTitle>
        <CardDescription>Connectez un domaine personnalisé à votre boutique pour une image plus professionnelle et éviter les blocages par les antivirus.</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Utilisez votre propre nom de domaine.
            </p>
            <StatusIndicator status={domainStatus} />
          </div>
          <div>
            <Label htmlFor="custom_domain">Votre domaine personnalisé</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                id="custom_domain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="maboutique.com"
              />
              <Button onClick={handleCustomDomainSave} disabled={isSavingDomain}>
                {isSavingDomain ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sauvegarder'}
              </Button>
            </div>
             <p className="text-xs text-muted-foreground mt-2">
              Pas de domaine ? <a href={hostingerReferralLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Obtenez-en un sur Hostinger</a>
            </p>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Instructions de configuration</AlertTitle>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-2 mt-2 text-sm">
                <li>Achetez un nom de domaine chez un fournisseur comme <a href={hostingerReferralLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Hostinger</a>.</li>
                <li>Accédez aux paramètres DNS de votre domaine.</li>
                <li>Créez un enregistrement de type <strong>CNAME</strong>.</li>
                <li>
                  Faites pointer votre domaine (par ex. `www`) vers la valeur suivante :
                  <pre className="mt-2 p-2 bg-muted rounded-md text-xs font-mono">cname.payliv.shop</pre>
                </li>
                <li>Sauvegardez les modifications et attendez la propagation (jusqu'à 24h).</li>
              </ol>
            </AlertDescription>
          </Alert>

          <Button onClick={handleVerifyDomain} disabled={isVerifying}>
            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Vérifier la configuration
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}