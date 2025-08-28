import React from 'react';
    import { motion } from 'framer-motion';
    import { Edit, Trash2, Package, Copy } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';

    export default function ProductList({ products, onEdit, onDelete, currencySymbol, storeSlug }) {
      const { toast } = useToast();

      if (!Array.isArray(products)) {
        return (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Chargement des produits...</h3>
          </div>
        );
      }
      
      if (products.length === 0) {
        return (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Aucun produit à afficher</h3>
            <p className="text-muted-foreground">Ajoutez votre premier produit pour le voir ici.</p>
          </div>
        );
      }

      const handleCopyLink = (productId) => {
        const productUrl = `${window.location.origin}/s/${storeSlug}/product/${productId}`;
        navigator.clipboard.writeText(productUrl);
        toast({
          title: "Lien copié !",
          description: "Le lien du produit a été copié dans le presse-papiers.",
        });
      };

      return (
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-xl p-4 hover:scale-105 transition-transform duration-300 bg-background"
              >
                <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center p-2">
                  {product.image ? (
                    <img className="w-full h-full object-contain rounded-lg" alt={product.name} src={product.image} />
                  ) : (
                    <Package className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground truncate">{product.name}</h4>
                  {product.description && <p className="text-sm text-muted-foreground line-clamp-2 h-10">{product.description}</p>}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-secondary">{product.price}{currencySymbol}</span>
                      {product.original_price && <span className="text-sm line-through text-muted-foreground ml-2">{product.original_price}{currencySymbol}</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopyLink(product.id)} disabled={!product.id}><Copy className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => onEdit(product)} disabled={!product.id}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(product.id)} disabled={!product.id}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  {product.category && <span className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded">{product.category}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }