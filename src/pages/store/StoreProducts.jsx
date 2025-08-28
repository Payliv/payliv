import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import PageLoader from '@/components/PageLoader';
import { Button } from '@/components/ui/button';
import { Plus, Package, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import ProductForm from '@/components/builder/products/ProductForm';
import ProductList from '@/components/builder/products/ProductList';
import { useProfile } from '@/contexts/ProfileContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function StoreProducts() {
  const { store, refetchStore } = useOutletContext();
  const { storeId } = useParams();
  const { isSubscriptionActive } = useProfile();
  const navigate = useNavigate();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const resetFormState = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };
  
  const handleFormSubmit = async (productData) => {
    setIsSubmitting(true);
    const { images, digital_files, ...restOfProductData } = productData;
    
    const productPayload = {
      ...restOfProductData,
      store_id: storeId,
      price: parseFloat(productData.price),
      original_price: productData.original_price ? parseFloat(productData.original_price) : null,
      stock: store.store_type === 'physical' && productData.stock ? parseInt(productData.stock, 10) : null,
      wholesale_price: productData.wholesale_price ? parseFloat(productData.wholesale_price) : null,
      promotion_ends_at: productData.promotion_ends_at || null,
      product_type: store.store_type,
      fee_bearer: productData.fee_bearer,
    };

    if (editingProduct) {
        productPayload.id = editingProduct.id;
    }

    const { data: upsertedProduct, error } = await supabase
      .from('products')
      .upsert(productPayload)
      .select()
      .single();

    if (error) {
      toast({ title: "Erreur de sauvegarde", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    await supabase.from('products_images').delete().eq('product_id', upsertedProduct.id);
    if (images && images.length > 0) {
      const imagesToInsert = images.map(img => ({ product_id: upsertedProduct.id, url: img.url }));
      const { error: imagesError } = await supabase.from('products_images').insert(imagesToInsert);
      if (imagesError) console.error("Error saving product images:", imagesError);
    }
    
    if (digital_files && store.store_type === 'digital') {
        const existingFiles = await supabase.from('digital_product_files').select('id').eq('product_id', upsertedProduct.id);
        if (existingFiles.data) {
            const filesToDelete = existingFiles.data.filter(f => !digital_files.some(df => df.id === f.id));
            if (filesToDelete.length > 0) {
                await supabase.from('digital_product_files').delete().in('id', filesToDelete.map(f => f.id));
            }
        }
        
        const filesToUpsert = digital_files.map(file => ({ ...file, product_id: upsertedProduct.id }));
        const { error: digitalFilesError } = await supabase.from('digital_product_files').upsert(filesToUpsert);
        if (digitalFilesError) console.error("Error saving digital files:", digitalFilesError);
    }

    toast({ title: "Succès !", description: `Produit ${editingProduct ? 'modifié' : 'ajouté'} avec succès.` });
    resetFormState();
    await refetchStore();
    setIsSubmitting(false);
  };
  
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const { error } = await supabase.from('products').delete().eq('id', productToDelete);
    if (error) {
      toast({ title: "Erreur de suppression", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produit supprimé" });
      await refetchStore();
    }
    setProductToDelete(null);
  };

  if (!store) return <PageLoader />;
  
  const getCurrencySymbol = (currency) => currency === 'XOF' ? 'CFA' : (currency || '€');
  const currencySymbol = getCurrencySymbol(store.settings?.currency);

  return (
    <>
      <div className="space-y-6">
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
            <h1 className="text-3xl font-bold">Produits</h1>
            <p className="text-muted-foreground">Ajoutez et gérez les produits de votre boutique <span className="font-semibold">({store.store_type === 'digital' ? 'Digitale' : 'Physique'})</span>.</p>
          </div>
          {!showProductForm && (
            <Button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter un produit
            </Button>
          )}
        </div>

        {showProductForm && (
          <ProductForm
            store={store}
            editingProduct={editingProduct}
            onFormSubmit={handleFormSubmit}
            onCancel={resetFormState}
            isSubmitting={isSubmitting}
          />
        )}

        {!showProductForm && (store.products?.length > 0 ? (
          <ProductList
            products={store.products}
            onEdit={handleEditProduct}
            onDelete={(productId) => setProductToDelete(productId)}
            currencySymbol={currencySymbol}
            storeSlug={store.slug}
          />
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-dashed">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Aucun produit ajouté</h3>
            <p className="text-muted-foreground mb-6">Commencez par ajouter votre premier produit.</p>
            <Button onClick={() => setShowProductForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter un produit
            </Button>
          </div>
        ))}
      </div>
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé de votre boutique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}