import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfile } from '@/contexts/ProfileContext';

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export function useStoreManager(storeId) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canCreateStore, loadingProfile } = useProfile();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadStore = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    if (storeId) {
      const { data, error } = await supabase
        .from('stores')
        .select('*, products(*, products_images(id, url))')
        .eq('id', storeId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast({ title: "Erreur", description: "Impossible de charger la boutique.", variant: "destructive" });
        navigate('/stores');
      } else {
        const storeData = {
          ...data,
          products: data.products.map(p => ({
            ...p,
            images: p.products_images || []
          }))
        };
        setStore(storeData);
      }
    } else {
      if (!loadingProfile && !canCreateStore) {
        toast({
          title: "Abonnement requis",
          description: "Veuillez vous abonner pour créer une nouvelle boutique.",
          variant: "destructive",
        });
        navigate('/pricing');
        return;
      }
      setStore({
        name: 'Ma Nouvelle Boutique',
        slug: '',
        description: 'La description de ma super boutique.',
        logo: '',
        cover_images: [],
        theme: {
          primaryColor: '#FBBF24',
          secondaryColor: '#10B981',
          font: 'Inter',
          backgroundColor: '#111827',
          textColor: '#F9FAFB'
        },
        products: [],
        settings: {
          metaTitle: '',
          metaDescription: '',
          currency: 'XOF',
          shippingCost: 5,
          freeShippingThreshold: 50,
          pixels: { facebook: '', tiktok: '' }
        },
        custom_domain: '',
      });
    }
    setLoading(false);
  }, [storeId, navigate, user, canCreateStore, loadingProfile]);

  const saveStore = async () => {
    if (!store || !user) {
      toast({ title: "Erreur", description: "Utilisateur non authentifié ou boutique non chargée.", variant: "destructive" });
      return;
    }
    setIsSaving(true);

    let currentStoreId = store.id;
    let storeResult;

    if (currentStoreId) {
      const storeData = {
        name: store.name, slug: slugify(store.name), description: store.description,
        logo: store.logo, cover_images: store.cover_images, theme: store.theme,
        settings: store.settings, custom_domain: store.custom_domain, user_id: user.id,
      };
      const { data, error } = await supabase.from('stores').update(storeData).eq('id', currentStoreId).select().single();
      storeResult = { data, error };
    } else {
      if (!canCreateStore) {
        toast({ title: "Action non autorisée", description: "Votre essai est terminé. Veuillez vous abonner.", variant: "destructive" });
        setIsSaving(false);
        navigate('/pricing');
        return;
      }

      let finalSlug = slugify(store.name);
      let isUnique = false;
      while (!isUnique) {
        const { data: existingStore, error: checkError } = await supabase.from('stores').select('slug').eq('slug', finalSlug).maybeSingle();
        if (checkError) {
          toast({ title: "Erreur de vérification", description: "Impossible de vérifier l'unicité de l'URL.", variant: "destructive" });
          setIsSaving(false);
          return;
        }
        if (!existingStore) {
          isUnique = true;
        } else {
          finalSlug = `${slugify(store.name)}-${Math.random().toString(36).substring(2, 6)}`;
        }
      }

      const storeData = {
        name: store.name, slug: finalSlug, description: store.description,
        logo: store.logo, cover_images: store.cover_images, theme: store.theme,
        settings: store.settings, custom_domain: store.custom_domain, user_id: user.id,
      };

      const { data, error } = await supabase.from('stores').insert(storeData).select().single();
      storeResult = { data, error };
      if (data) {
        currentStoreId = data.id;
        setStore(prev => ({...prev, id: data.id, slug: data.slug}));
        navigate(`/builder/${currentStoreId}`, { replace: true });
      }
    }

    if (storeResult.error) {
      toast({ title: "Erreur de sauvegarde", description: storeResult.error.message, variant: "destructive" });
      setIsSaving(false);
      return;
    }

    if (store.products && store.products.length > 0) {
      for (const product of store.products) {
        const { images, ...productData } = product;
        const sanitizedProductData = { ...productData, store_id: currentStoreId, image: product.image || null, promotion_ends_at: product.promotion_ends_at || null };
        if (typeof product.id === 'string' && product.id.startsWith('new_')) {
          delete sanitizedProductData.id;
        }

        const { data: upsertedProduct, error: productError } = await supabase.from('products').upsert(sanitizedProductData).select().single();
        if (productError) {
          console.error("Error upserting product:", productError);
          toast({ title: "Erreur de sauvegarde produit", description: productError.message, variant: "destructive" });
          continue;
        }

        if (upsertedProduct && images && images.length > 0) {
          await supabase.from('products_images').delete().eq('product_id', upsertedProduct.id);
          const imagesToInsert = images.map(img => ({ product_id: upsertedProduct.id, url: typeof img === 'string' ? img : img.url }));
          const { error: imagesError } = await supabase.from('products_images').insert(imagesToInsert);
          if (imagesError) console.error("Error saving product images:", imagesError);
        }
      }
    }

    toast({ title: "Succès", description: "Boutique sauvegardée avec succès !" });
    setIsSaving(false);
    loadStore();
  };

  return { store, setStore, loading, isSaving, loadStore, saveStore };
}