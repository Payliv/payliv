import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import PageLoader from '@/components/PageLoader';
import StoreHeader from '@/components/store/preview/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import ProductGrid from '@/components/store/preview/ProductGrid';
import OwnerTools from '@/components/store/preview/OwnerTools';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid } from 'lucide-react';

const StoreHero = ({ store }) => {
  if (!store) return null;
  
  const hasCover = store.cover_images && store.cover_images.length > 0;
  
  return (
    <div className={hasCover ? "relative w-full h-64 md:h-80 text-white" : "bg-muted/30 py-8"}>
      {hasCover && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${store.cover_images[0]})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </>
      )}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8">
        {/* Description moved to header, no longer displayed here */}
      </div>
    </div>
  );
};

export default function StorePreview() {
  const { storeSlug } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tout');

  const isOwner = user && store && user.id === store.user_id;

  const logVisit = useCallback(async (storeId) => {
    await supabase.functions.invoke('log-store-visit', {
      body: { store_id: storeId },
    });
  }, []);

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      setError(null);
      
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', storeSlug)
        .eq('status', 'published')
        .single();
      
      if (storeError || !storeData) {
        setError('Boutique non trouvée ou indisponible.');
        setLoading(false);
        return;
      }
      
      setStore(storeData);
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (productsError) {
        toast({ title: 'Erreur', description: 'Impossible de charger les produits.', variant: 'destructive' });
      } else {
        setProducts(productsData || []);
      }
      
      setLoading(false);
      logVisit(storeData.id);
    };

    fetchStoreData();
  }, [storeSlug, toast, logVisit]);
  
  const categories = useMemo(() => {
    const categorySet = new Set(products.map(p => p.category).filter(Boolean));
    return ['Tout', ...Array.from(categorySet)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Tout' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);
  
  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <div>
          <h1 className="text-4xl font-bold text-destructive">Erreur</h1>
          <p className="mt-4 text-lg text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const pageTitle = store?.settings?.metaTitle || store?.name || 'Boutique';
  const pageDescription = store?.settings?.metaDescription || store?.description || 'Découvrez nos produits exceptionnels.';
  const ogImage = store?.logo || 'https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/adc0bd1dfcc65ced231e230f282d5f14.png';
  const pageUrl = `${window.location.origin}/s/${storeSlug}`;

  return (
    <>
      <Helmet>
        <title>{`${pageTitle} - Propulsé par PayLiv`}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={pageUrl} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content={ogImage} />
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <AnimatePresence>
          {isOwner ? <OwnerTools key="owner-tools-preview" storeId={store.id} /> : null}
        </AnimatePresence>
        
        <StoreHeader store={store} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <StoreHero store={store} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 flex flex-col">
          {categories.length > 2 && (
            <div className="mb-4 self-end w-full sm:w-[240px]">
              <Select onValueChange={(value) => setSelectedCategory(value)} defaultValue={selectedCategory}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Filtrer par catégorie" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <main className="flex-grow">
            <ProductGrid products={filteredProducts} store={store} />
          </main>
        </div>

        <StoreFooter store={store} />
      </div>
    </>
  );
}