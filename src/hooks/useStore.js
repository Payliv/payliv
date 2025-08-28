import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function useStore(storeId) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchStore = useCallback(async () => {
    if (!storeId || !user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*, products(*, products_images(id, url))')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      toast({ title: "Erreur", description: "Impossible de charger les données de la boutique ou vous n'y avez pas accès.", variant: "destructive" });
      setStore(null);
      navigate('/stores');
    } else {
        const storeData = {
          ...data,
          products: data.products ? data.products.map(p => ({
            ...p,
            images: p.products_images || []
          })) : []
        };
       setStore(storeData);
    }
    setLoading(false);
  }, [storeId, user, navigate]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const updateStore = async (updatedData) => {
    if (!store) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('stores')
      .update(updatedData)
      .eq('id', storeId);
    
    setIsSaving(false);
    if (error) {
      toast({ title: "Erreur", description: "La sauvegarde a échoué.", variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Boutique sauvegardée !" });
      // No need to refetch, local state is managed by setStore
    }
  };

  return { store, setStore, loading, isSaving, updateStore, refetchStore: fetchStore };
}