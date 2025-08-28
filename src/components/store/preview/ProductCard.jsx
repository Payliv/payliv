import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { getContrastingTextColor } from '@/lib/utils';

const ProductCard = ({ product, store, delay = 0 }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: delay * 0.1, duration: 0.5, ease: "easeOut" }
    }
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '';
    const currency = store.settings?.currency || 'XOF';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
  };

  const productUrl = `/s/${store.slug}/product/${product.id}`;
  const primaryColor = store.theme?.primaryColor || '#FBBF24';
  const buttonTextColor = getContrastingTextColor(primaryColor);

  return (
    <motion.div 
      variants={cardVariants}
      className="bg-card/50 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-md hover:shadow-primary/20 transition-all duration-300 flex flex-col group"
    >
      <Link to={productUrl} className="block overflow-hidden aspect-w-1 aspect-h-1">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted/20 flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-foreground truncate" title={product.name}>
          <Link to={productUrl} className="hover:text-primary transition-colors">{product.name}</Link>
        </h3>
        <p className="text-xl font-extrabold mt-1 mb-4" style={{ color: primaryColor }}>
          {formatPrice(product.price)}
        </p>

        <div className="mt-auto">
           <Button asChild className="w-full transition-all duration-300 transform group-hover:scale-105" style={{ backgroundColor: primaryColor, color: buttonTextColor }}>
            <Link to={productUrl}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span>Voir le produit</span>
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;