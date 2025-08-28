import React, { useEffect, useState } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useProfile } from '@/contexts/ProfileContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import PageLoader from '@/components/PageLoader';
    import { Navigate, useNavigate } from 'react-router-dom';
    import ProductList from '@/components/builder/products/ProductList';
    import { Button } from '@/components/ui/button';
    import { Plus, Package } from 'lucide-react';

    const PartnerProducts = () => {
      const { profile } = useProfile();
      const [store, setStore] = useState(null);
      const [products, setProducts] = useState([]);
      const [loading, setLoading] = useState(true);
      const navigate = useNavigate();

      useEffect(() => {
        const fetchPartnerData = async () => {
          if (profile) {
            setLoading(true);
            const { data: storeData, error: storeError } = await supabase
              .from('stores')
              .select('id, slug, settings')
              .eq('user_id', profile.id)
              .single();
            
            if (storeError && storeError.code !== 'PGRST116') {
              console.error("Error fetching store:", storeError);
            } else {
              setStore(storeData);
              if (storeData) {
                const { data: productsData, error: productsError } = await supabase
                  .from('products')
                  .select('*')
                  .eq('store_id', storeData.id);
                
                if (productsError) {
                  console.error("Error fetching products:", productsError);
                } else {
                  setProducts(productsData);
                }
              }
            }
            setLoading(false);
          }
        };
        fetchPartnerData();
      }, [profile]);

      const handleEdit = (product) => {
        navigate(`/builder/${store.id}?tab=products&edit=${product.id}`);
      };

      const handleDelete = async (productId) => {
        await supabase.from('products').delete().eq('id', productId);
        setProducts(products.filter(p => p.id !== productId));
      };

      if (loading) {
        return <PageLoader />;
      }

      if (!store) {
        return <Navigate to="/partner/dashboard" replace />;
      }
      
      const currencySymbol = store.settings?.currency === 'XOF' ? 'CFA' : (store.settings?.currency || '€');

      return (
        <>
          <Helmet>
            <title>Mes Produits Fournisseur - PayLiv</title>
            <meta name="description" content="Gérez votre catalogue de produits pour le dropshipping." />
          </Helmet>
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">Mes Produits</h1>
                <p className="text-muted-foreground">Gérez votre catalogue de produits pour le dropshipping.</p>
            </div>
            <Button onClick={() => navigate(`/builder/${store.id}?tab=products`)}>
                <Plus className="w-5 h-5 mr-2" />
                Ajouter un produit
            </Button>
          </div>
          {products.length > 0 ? (
            <ProductList 
              products={products} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              currencySymbol={currencySymbol}
              storeSlug={store.slug}
            />
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border border-border">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse-slow">
                <Package className="w-12 h-12 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Aucun produit pour le moment</h3>
              <p className="text-muted-foreground mb-6">Commencez par ajouter vos produits pour les proposer en dropshipping.</p>
              <Button onClick={() => navigate(`/builder/${store.id}?tab=products`)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter mon premier produit
              </Button>
            </div>
          )}
        </>
      );
    };

    export default PartnerProducts;