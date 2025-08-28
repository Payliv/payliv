import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Package, SlidersHorizontal } from 'lucide-react';
import MarketplaceProductCard from '@/components/MarketplaceProductCard';
import { Helmet } from 'react-helmet-async';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { harmonizeCategories } from '@/lib/utils';
import { physicalCategories, digitalCategories } from '@/lib/productCategories';
import AdSlideshow from '@/components/AdSlideshow';

const PRODUCTS_PER_PAGE = 12;

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [ad, setAd] = useState(null);
  const [filters, setFilters] = useState({
    productType: 'all',
    category: 'all',
  });
  const { toast } = useToast();

  const fetchAd = async () => {
    const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .eq('placement', 'marketplace_top')
        .limit(1)
        .single();
    if (data && !error) {
        setAd(data);
    }
  };

  useEffect(() => {
    const allPredefinedCategories = [...physicalCategories, ...digitalCategories];
    const harmonized = harmonizeCategories(allPredefinedCategories);
    setCategories(harmonized);
    fetchAd();
  }, []);

  const buildQuery = useCallback(() => {
    let query = supabase
      .from('products')
      .select('id, name, price, image, product_type, category, stores!inner(name, slug, status)', { count: 'exact' })
      .eq('stores.status', 'published');

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    if (filters.productType !== 'all') {
      query = query.eq('product_type', filters.productType);
    }
    if (filters.category !== 'all') {
      const selectedCategoryGroup = categories.find(c => c.name === filters.category);
      if (selectedCategoryGroup) {
        query = query.in('category', selectedCategoryGroup.originalCategories);
      } else {
        query = query.eq('category', filters.category);
      }
    }
    return query;
  }, [searchTerm, filters, categories]);

  const loadInitialProducts = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1);

    const query = buildQuery();
    const { data, error, count } = await query.order('created_at', { ascending: false }).range(0, PRODUCTS_PER_PAGE - 1);

    if (error) {
      toast({ title: 'Erreur', description: "Impossible de charger les produits.", variant: 'destructive' });
      console.error(error);
    } else {
      setProducts(data || []);
      setTotalProducts(count || 0);
      setCurrentPage(2);
    }
    setLoading(false);
  }, [buildQuery, toast]);

  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const from = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;

    const query = buildQuery();
    const { data, error } = await query.order('created_at', { ascending: false }).range(from, to);

    if (error) {
      toast({ title: 'Erreur', description: "Impossible de charger plus de produits.", variant: 'destructive' });
      console.error(error);
    } else if (data) {
      setProducts(prev => [...prev, ...data]);
      setCurrentPage(prev => prev + 1);
    }
    setLoadingMore(false);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const pageUrl = `${window.location.origin}/marketplace`;
  const title = "Marketplace - Découvrez les produits sur PayLiv";
  const description = "Explorez la marketplace de PayLiv et découvrez une variété de produits proposés par nos entrepreneurs talentueux à travers l'Afrique.";
  const ogImage = "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/adc0bd1dfcc65ced231e230f282d5f14.png";

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:alt" content="Marketplace PayLiv" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={pageUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={ogImage} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight gradient-text">Marketplace PayLiv</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Découvrez une sélection de produits uniques proposés par notre communauté d'entrepreneurs.
          </p>
        </motion.div>

        <AdSlideshow ad={ad} />

        <Card className="mb-8 p-4 sm:p-6 glass-effect">
          <CardContent className="p-0">
            <div className="flex flex-col gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher un produit par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg bg-background/50 border-border focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtres :</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select onValueChange={(value) => handleFilterChange('productType', value)} defaultValue="all">
                  <SelectTrigger className="h-11 bg-background/50">
                    <SelectValue placeholder="Type de produit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="physical">Produits Physiques</SelectItem>
                    <SelectItem value="digital">Produits Digitaux</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleFilterChange('category', value)} defaultValue="all" disabled={categories.length === 0}>
                  <SelectTrigger className="h-11 bg-background/50">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground">
              {searchTerm || filters.productType !== 'all' || filters.category !== 'all'
                ? "Aucun produit ne correspond à vos critères. Essayez de les modifier."
                : "Il n'y a pas encore de produits à afficher. Revenez bientôt !"
              }
            </p>
          </div>
        ) : (
          <>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8"
            >
              {products.map((product, index) => (
                <MarketplaceProductCard key={`${product.id}-${index}`} product={product} delay={index * 0.05} />
              ))}
            </motion.div>

            {!loading && products.length < totalProducts && (
              <div className="mt-12 text-center">
                <Button onClick={handleLoadMore} disabled={loadingMore} size="lg">
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    'Voir plus'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}