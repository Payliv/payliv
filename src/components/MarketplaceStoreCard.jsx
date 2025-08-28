import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store, Eye } from 'lucide-react';

const MarketplaceStoreCard = ({ store, delay = 0 }) => {
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

  return (
    <motion.div
      variants={itemVariants}
      className="glass-effect rounded-2xl overflow-hidden flex flex-col group h-full border border-border"
    >
      <div className="p-6 flex flex-col items-center text-center flex-grow">
        <div className="relative w-32 h-32 mb-4">
          <div className="aspect-square rounded-full bg-muted/30 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
            {store.logo ? (
              <img 
                src={store.logo} 
                alt={`${store.name} logo`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <Store className="w-16 h-16 text-muted-foreground/30" />
            )}
          </div>
        </div>
        <h3 className="text-lg font-bold text-foreground truncate mb-2">{store.name}</h3>
        <p className="text-sm text-muted-foreground flex-grow line-clamp-3 mb-4">
          {store.description || 'Aucune description pour cette boutique.'}
        </p>
      </div>
      <div className="p-6 pt-0 mt-auto">
        <Button asChild className="w-full">
          <Link to={`/s/${store.slug}`}>
            <Eye className="w-4 h-4 mr-2" />
            Visiter la boutique
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default MarketplaceStoreCard;