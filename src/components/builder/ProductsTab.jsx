import React, { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Plus, Package, Sparkles } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import ProductForm from './products/ProductForm';
    import ProductList from './products/ProductList';
    import { useProfile } from '@/contexts/ProfileContext';
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

    export default function ProductsTab({ store, setStore }) {
      const [showProductForm, setShowProductForm] = useState(false);
      const [editingProduct, setEditingProduct] = useState(null);
      const { isSubscriptionActive } = useProfile();
      const navigate = useNavigate();

      const resetFormState = () => {
        setShowProductForm(false);
        setEditingProduct(null);
      };

      const handleFormSubmit = async (productData) => {
        const { images, ...restOfProductData } = productData;
        
        const productPayload = {
          ...restOfProductData,
          price: parseFloat(productData.price),
          original_price: productData.original_price ? parseFloat(productData.original_price) : null,
          stock: productData.stock ? parseInt(productData.stock, 10) : null,
          wholesale_price: productData.wholesale_price ? parseFloat(productData.wholesale_price) : null,
          promotion_ends_at: productData.promotion_ends_at || null,
          product_type: store.store_type, // Set product type based on store type
        };

        if (editingProduct) {
          delete productPayload.id;

          const { data: updatedProduct, error } = await supabase
            .from('products')
            .update(productPayload)
            .eq('id', editingProduct.id)
            .select()
            .single();

          if (error) {
            toast({ title: "Erreur de mise à jour", description: error.message, variant: "destructive" });
            return;
          }

          let finalImages = [];
          if (updatedProduct) {
            await supabase.from('products_images').delete().eq('product_id', updatedProduct.id);

            if (images && images.length > 0) {
              const imagesToInsert = images.map(img => ({
                product_id: updatedProduct.id,
                url: img.url,
              }));
              const { data: insertedImages, error: imagesError } = await supabase
                .from('products_images')
                .insert(imagesToInsert)
                .select();
              
              if (imagesError) {
                console.error("Error saving product images:", imagesError);
                toast({ title: "Erreur sauvegarde images", description: imagesError.message, variant: "destructive" });
              } else {
                finalImages = insertedImages || [];
              }
            }
          }

          const finalProduct = {
            ...updatedProduct,
            images: finalImages
          };

          setStore(prev => ({
            ...prev,
            products: prev.products.map(p => p.id === editingProduct.id ? finalProduct : p)
          }));

          toast({ title: "Succès !", description: "Produit modifié et sauvegardé automatiquement." });
          resetFormState();

        } else {
          if (!store.id) {
            toast({
              title: "Action requise",
              description: "Veuillez d'abord sauvegarder votre boutique avant d'ajouter un produit.",
              variant: "destructive"
            });
            return;
          }

          productPayload.store_id = store.id;
          delete productPayload.id;

          const { data: insertedProduct, error } = await supabase
            .from('products')
            .insert(productPayload)
            .select()
            .single();

          if (error) {
            toast({ title: "Erreur de sauvegarde automatique", description: error.message, variant: "destructive" });
            return;
          }
          
          let finalImages = [];
          if (insertedProduct && images && images.length > 0) {
              const imagesToInsert = images.map(img => ({
                product_id: insertedProduct.id,
                url: img.url,
              }));
              const { data: insertedImages, error: imagesError } = await supabase
                .from('products_images')
                .insert(imagesToInsert)
                .select();
                
              if (imagesError) {
                console.error("Error saving product images:", imagesError);
                toast({ title: "Erreur sauvegarde images", description: imagesError.message, variant: "destructive" });
              } else {
                finalImages = insertedImages || [];
              }
          }

          const finalProduct = {
            ...insertedProduct,
            images: finalImages
          };

          setStore(prev => ({
            ...prev,
            products: [...(prev.products || []), finalProduct]
          }));

          toast({ title: "Succès !", description: "Produit ajouté et sauvegardé automatiquement." });
          resetFormState();
        }
      };

      const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowProductForm(true);
      };

      const handleDeleteProduct = async (productId) => {
        const productToDelete = store.products.find(p => p.id === productId);
        setStore(prev => ({
          ...prev,
          products: prev.products.filter(p => p.id !== productId)
        }));

        if (typeof productId === 'string' && productId.match(/^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i)) {
          const { error } = await supabase.from('products').delete().eq('id', productId);
          if (error) {
            toast({ title: "Erreur de suppression", description: error.message, variant: "destructive" });
            setStore(prev => ({...prev, products: [...prev.products, productToDelete]}));
            return;
          }
        }
        
        toast({ title: "Produit supprimé" });
      };
      
      const getCurrencySymbol = (currency) => {
        switch (currency) {
          case 'EUR': return '€';
          case 'USD': return '$';
          case 'XOF': return 'CFA';
          default: return currency;
        }
      };
      const currencySymbol = getCurrencySymbol(store.settings?.currency);

      const products = store.products || [];

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {store.store_type === 'physical' && !isSubscriptionActive && (
            <Alert className="mb-4 border-primary bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary font-bold">Mode de création uniquement</AlertTitle>
              <AlertDescription>
                Vous pouvez ajouter et modifier vos produits physiques. Pour publier votre boutique et commencer à vendre, un <span className="font-bold">abonnement premium</span> est requis.
                <Button variant="link" className="p-0 h-auto ml-1 text-primary underline" onClick={() => navigate('/pricing')}>Voir les abonnements</Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Gestion des produits</h3>
              <p className="text-muted-foreground">Ajoutez et gérez les produits de votre boutique <span className="font-semibold">({store.store_type === 'digital' ? 'Digitale' : 'Physique'})</span></p>
            </div>
            <Button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un produit
            </Button>
          </div>

          {showProductForm && (
            <ProductForm
              store={store}
              editingProduct={editingProduct}
              onFormSubmit={handleFormSubmit}
              onCancel={resetFormState}
            />
          )}

          {products.length > 0 ? (
            <ProductList
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              currencySymbol={currencySymbol}
              storeSlug={store.slug}
            />
          ) : (
            !showProductForm && (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse-slow">
                  <Package className="w-12 h-12 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Aucun produit ajouté</h3>
                <p className="text-muted-foreground mb-6">Commencez par ajouter votre premier produit</p>
                <Button onClick={() => setShowProductForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>
            )
          )}
        </motion.div>
      );
    }