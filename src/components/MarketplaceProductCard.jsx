import React from 'react';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { ShoppingCart, Store, Image as ImageIcon } from 'lucide-react';

    const MarketplaceProductCard = ({ product, delay = 0 }) => {
      const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: 'spring',
            stiffness: 100,
            delay
          }
        }
      };

      const formatPrice = (price) => {
        if (typeof price !== 'number') return '';
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price);
      };

      const productLink = `/s/${product.stores.slug}/product/${product.id}`;

      return (
        <motion.div
          variants={itemVariants}
          className="glass-effect rounded-2xl overflow-hidden flex flex-col group h-full border border-border"
        >
          <Link to={productLink} className="block overflow-hidden aspect-square bg-muted/30">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
          </Link>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-md font-bold text-foreground truncate mb-1" title={product.name}>
              <Link to={productLink} className="hover:text-primary transition-colors">{product.name}</Link>
            </h3>
            <p className="text-lg text-primary font-semibold mb-2">{formatPrice(product.price)}</p>
            <div className="text-xs text-muted-foreground flex items-center mb-4">
              <Store className="w-3 h-3 mr-1.5" />
              <Link to={`/s/${product.stores.slug}`} className="hover:underline">{product.stores.name}</Link>
            </div>
            <div className="mt-auto">
              <Button asChild className="w-full">
                <Link to={productLink}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Voir le produit</span>
                </Link>
              </Button>
              {product.product_type === 'physical' && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Paiement à la livraison
                </p>
              )}
            </div>
          </div>
        </motion.div>
      );
    };

    export default MarketplaceProductCard;