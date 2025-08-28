import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Smartphone, Monitor, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PreviewTab({ store }) {
  const [previewMode, setPreviewMode] = useState('desktop');

  if (!store) return null;

  const previewWidths = {
    mobile: 'max-w-sm',
    tablet: 'max-w-2xl',
    desktop: 'max-w-5xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 w-full h-full flex flex-col"
    >
      {/* Preview Controls */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-foreground">Aperçu de votre boutique</h3>
          <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
            <Button variant={previewMode === 'desktop' ? 'secondary' : 'ghost'} size="sm" onClick={() => setPreviewMode('desktop')} className="flex-1">
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button variant={previewMode === 'tablet' ? 'secondary' : 'ghost'} size="sm" onClick={() => setPreviewMode('tablet')} className="flex-1">
              <Tablet className="w-4 h-4 mr-2" />
              Tablette
            </Button>
            <Button variant={previewMode === 'mobile' ? 'secondary' : 'ghost'} size="sm" onClick={() => setPreviewMode('mobile')} className="flex-1">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="bg-muted rounded-xl p-4 sm:p-6 transition-all duration-500 flex-grow">
        <div className={cn("mx-auto bg-card rounded-lg overflow-hidden shadow-2xl transition-all duration-500 h-full", previewWidths[previewMode])}>
          {/* Store Preview */}
          <div 
            className="h-full overflow-y-auto scrollbar-hide"
            style={{ 
              backgroundColor: store.theme.backgroundColor,
              color: store.theme.textColor 
            }}
          >
            {/* Header */}
            <div className="border-b p-4 sm:p-6" style={{ borderColor: `${store.theme.textColor}20` }}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {store.logo && (
                    <img src={store.logo} alt={store.name} className="h-12 w-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold" style={{ color: store.theme.primaryColor }}>
                      {store.name}
                    </h1>
                    <p className="text-sm opacity-80">{store.description}</p>
                  </div>
                </div>
                
                <div 
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{ 
                    backgroundColor: store.theme.primaryColor,
                    color: store.theme.textColor 
                  }}
                >
                  Panier (0)
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="p-4 sm:p-6">
              <h2 className="text-2xl font-bold mb-6" style={{ color: store.theme.primaryColor }}>
                Nos Produits
              </h2>
              
              {store.products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${store.theme.primaryColor}40` }}>
                    <Eye className="w-8 h-8" style={{ color: store.theme.primaryColor }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aperçu de votre boutique</h3>
                  <p className="opacity-60">Ajoutez des produits pour voir l'aperçu complet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {store.products.slice(0, 6).map((product) => (
                    <div key={product.id} className="border rounded-xl overflow-hidden" style={{ borderColor: `${store.theme.textColor}20` }}>
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted/50 rounded-lg flex items-center justify-center">
                            <Eye className="w-8 h-8 opacity-50" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{product.name}</h3>
                        <p className="text-sm opacity-80 mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-xl font-bold" style={{ color: store.theme.primaryColor }}>
                              {product.price}€
                            </span>
                            {product.original_price && (
                              <span className="text-sm line-through opacity-60 ml-2">
                                {product.original_price}€
                              </span>
                            )}
                          </div>
                          
                          <div 
                            className="px-3 py-1 rounded-lg text-sm font-medium"
                            style={{ 
                              backgroundColor: store.theme.primaryColor,
                              color: store.theme.textColor 
                            }}
                          >
                            Ajouter
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-6 mt-8" style={{ borderColor: `${store.theme.textColor}20` }}>
              <div className="text-center">
                <p className="text-sm opacity-60">
                  © 2024 {store.name}. Tous droits réservés.
                </p>
                <p className="text-xs opacity-40 mt-2">
                  Boutique créée avec PayLiv
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}