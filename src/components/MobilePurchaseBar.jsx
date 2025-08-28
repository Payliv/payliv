import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { ShoppingCart } from 'lucide-react';
    import { getContrastingTextColor } from '@/lib/utils';
    import MobileMoneyLogos from '@/components/MobileMoneyLogos';

    const MobilePurchaseBar = ({ product, store, onOrder }) => {
      if (!product || !store) return null;

      const primaryColor = store.theme?.primaryColor || '#FBBF24';
      const textColor = getContrastingTextColor(primaryColor);
      const currency = store.settings?.currency || 'XOF';

      const handleOrderClick = () => {
        onOrder();
      };

      const isDigital = product.product_type === 'digital' && store.settings?.payments?.apiweb_enabled;
      const isPhysical = product.product_type === 'physical';

      return (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border p-3 shadow-lg z-40 md:hidden"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-lg font-bold" style={{ color: primaryColor }}>
                {product.price.toLocaleString()} {currency}
              </span>
              {isDigital && <MobileMoneyLogos />}
            </div>
            
            {isDigital && (
                 <Button onClick={handleOrderClick} className="flex-grow text-base" size="lg" style={{ backgroundColor: primaryColor, color: textColor }}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Acheter
                </Button>
            )}
            
            {isPhysical && (
                 <Button onClick={handleOrderClick} className="flex-grow text-base" size="lg" style={{ backgroundColor: primaryColor, color: textColor }}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Commander
                </Button>
            )}
          </div>
        </motion.div>
      );
    };

    export default MobilePurchaseBar;