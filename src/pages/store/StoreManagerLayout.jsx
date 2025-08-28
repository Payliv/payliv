import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import StoreManagerSidebar from '@/components/store/StoreManagerSidebar';
import PageLoader from '@/components/PageLoader';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, WifiOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import StoreManagerHeader from '@/components/store/StoreManagerHeader';
import { useProfile } from '@/contexts/ProfileContext';

const StoreManagerLayout = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSubscriptionActive } = useProfile();
  
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchStore = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from('stores')
      .select('*, products(*, products_images(id, url))')
      .eq('id', storeId)
      .single();

    if (fetchError) {
      toast({
        title: 'Erreur',
        description: "Impossible de trouver la boutique ou vous n'avez pas la permission. Vous allez être redirigé.",
        variant: 'destructive',
      });
      setError('Boutique non trouvée');
      setTimeout(() => navigate('/dashboard', { replace: true }), 3000);
    } else {
      const sortedProducts = data.products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setStore({ ...data, products: sortedProducts });
    }
    setLoading(false);
  }, [storeId, navigate, toast]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const updateStore = async (updatedData) => {
    if (!store) return { error: { message: "Store not loaded" } };
    setIsSaving(true);
    const { error } = await supabase
      .from('stores')
      .update(updatedData)
      .eq('id', store.id);
    
    setIsSaving(false);
    if (error) {
      toast({ title: "Erreur", description: `La sauvegarde a échoué: ${error.message}`, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Modifications sauvegardées !" });
      await fetchStore();
    }
    return { error };
  };

  const handlePublish = async () => {
    if (!store) return;
    setIsPublishing(true);

    if (store.store_type === 'digital') {
      const { error: rpcError } = await supabase.rpc('publish_store', { p_store_id: store.id });
      if (rpcError) {
        toast({ title: "Erreur de publication", description: rpcError.message, variant: "destructive" });
      } else {
        toast({ title: "Boutique publiée !", description: "Votre boutique digitale est maintenant en ligne." });
        await fetchStore();
      }
    } else if (store.store_type === 'physical') {
      if (isSubscriptionActive) {
        const { error: rpcError } = await supabase.rpc('publish_store', { p_store_id: store.id });
        if (rpcError) {
          toast({ title: "Erreur de publication", description: rpcError.message, variant: "destructive" });
        } else {
          toast({ title: "Boutique publiée !", description: "Votre boutique physique est maintenant en ligne." });
          await fetchStore();
        }
      } else {
        toast({
          title: "Abonnement requis",
          description: "Un abonnement est nécessaire pour publier une boutique physique.",
          variant: "destructive",
          action: <Button onClick={() => navigate('/pricing')}>S'abonner</Button>,
        });
      }
    }
    setIsPublishing(false);
  };

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">Retour au tableau de bord</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/40">
      <StoreManagerSidebar store={store} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex flex-col flex-1 min-w-0">
        <StoreManagerHeader store={store} onPublish={handlePublish} isPublishing={isPublishing} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet context={{ store, setStore, isSaving, updateStore, refetchStore: fetchStore }} />
        </main>
      </div>
    </div>
  );
};

export default StoreManagerLayout;