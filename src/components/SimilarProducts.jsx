import React, { useState, useEffect } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import MarketplaceProductCard from '@/components/MarketplaceProductCard';
    import { Loader2 } from 'lucide-react';
    import { motion } from 'framer-motion';

    const SimilarProducts = ({ storeId, currentProductId }) => {
      const [products, setProducts] = useState([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchOtherProducts = async () => {
          if (!storeId || !currentProductId) {
            setLoading(false);
            return;
          }
          
          setLoading(true);
          const { data, error } = await supabase
            .from('products')
            .select('id, name, price, image, store:store_id(name, slug, status)')
            .eq('store_id', storeId)
            .neq('id', currentProductId)
            .limit(4);

          if (error) {
            console.error("Error fetching other products from store:", error);
            setProducts([]);
          } else {
            const formattedProducts = data.map(p => ({ ...p, stores: p.store }));
            setProducts(formattedProducts);
          }
          setLoading(false);
        };

        fetchOtherProducts();
      }, [storeId, currentProductId]);

      if (loading) {
        return (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        );
      }

      if (products.length === 0) {
        return null;
      }

      return (
        <div className="py-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center"
          >
            Autres produits de cette boutique
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <MarketplaceProductCard key={product.id} product={product} delay={index * 0.15} />
            ))}
          </div>
        </div>
      );
    };

    export default SimilarProducts;