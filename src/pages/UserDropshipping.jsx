import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Store, Package, GitFork, Check, X, Download, FileText, MonitorPlay } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTablePagination } from '@/components/DataTablePagination';

const STORES_PER_PAGE = 8;

const SupplierStoreCard = ({ store, onSelect }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-effect rounded-2xl overflow-hidden flex flex-col group h-full border border-border cursor-pointer"
    onClick={() => onSelect(store)}
  >
    <div className="relative aspect-video bg-muted/30 flex items-center justify-center overflow-hidden">
      {store.logo ? (
        <img src={store.logo} alt={`${store.name} logo`} className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105 p-4" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
          <Store className="w-16 h-16 text-muted-foreground/30" />
        </div>
      )}
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-lg font-bold text-foreground truncate mb-2">{store.name}</h3>
      <p className="text-sm text-muted-foreground flex-grow line-clamp-3 mb-4">
        {store.description || 'Aucune description pour cette boutique.'}
      </p>
      <div className="text-xs text-muted-foreground mt-auto pt-2 border-t border-border">
        Fournisseur: {store.profile_name}
      </div>
    </div>
  </motion.div>
);

const ImportProductDialog = ({ product, userStores, onImport, onOpenChange, isOpen }) => {
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userStores.length > 0) {
      setSelectedStoreId(userStores[0].id);
    }
  }, [userStores]);

  const handleImport = async () => {
    if (!selectedStoreId) {
      toast({ title: "Aucune boutique sélectionnée", variant: "destructive" });
      return;
    }
    setIsImporting(true);
    await onImport(product, selectedStoreId);
    setIsImporting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer le produit : {product.name}</DialogTitle>
          <DialogDescription>Sélectionnez la boutique dans laquelle vous souhaitez importer ce produit.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une boutique" />
            </SelectTrigger>
            <SelectContent>
              {userStores.map(store => (
                <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleImport} disabled={isImporting || !selectedStoreId}>
            {isImporting ? <Loader2 className="animate-spin mr-2" /> : <Download className="mr-2 h-4 w-4" />}
            Importer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SupplierProductsView = ({ supplierStore, onBack, userStores, onImportProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [productToImport, setProductToImport] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, products_images(url)')
        .eq('store_id', supplierStore.id)
        .eq('is_dropshippable', true);

      if (error) {
        toast({ title: "Erreur", description: "Impossible de charger les produits du fournisseur.", variant: "destructive" });
      } else {
        const productsWithImages = data.map(p => ({
          ...p,
          images: p.products_images.map(img => img.url)
        }));
        setProducts(productsWithImages);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [supplierStore.id, toast]);

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'XOF': return 'CFA';
      default: return currency;
    }
  };
  const currencySymbol = getCurrencySymbol(supplierStore.settings?.currency);

  const ProductTypeIcon = ({ type }) => {
    if (type === 'digital') {
      return <FileText className="h-4 w-4 mr-2 text-blue-400" title="Produit Digital" />;
    }
    return <Package className="h-4 w-4 mr-2 text-green-400" title="Produit Physique" />;
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <X className="mr-2 h-4 w-4" /> Retour aux fournisseurs
      </Button>
      <h2 className="text-3xl font-bold mb-4">Produits de {supplierStore.name}</h2>
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <p>Ce fournisseur n'a aucun produit disponible pour le dropshipping pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader className="p-0">
                <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center p-2 relative">
                  {product.image ? (
                    <img className="w-full h-full object-contain rounded-md" alt={product.name} src={product.image} />
                  ) : (
                    <Package className="w-16 h-16 text-muted-foreground" />
                  )}
                   <div className="absolute top-2 right-2 bg-background/80 p-1 rounded-full backdrop-blur-sm">
                      <ProductTypeIcon type={product.product_type} />
                   </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-grow">
                <CardTitle className="text-lg font-semibold truncate mb-2">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground mb-2">Prix de gros: <span className="font-bold text-primary">{product.wholesale_price}{currencySymbol}</span></p>
                <p className="text-sm text-muted-foreground mb-4">Prix de vente suggéré: <span className="font-bold text-foreground">{product.price}{currencySymbol}</span></p>
                <Button className="w-full mt-auto" onClick={() => setProductToImport(product)}>
                  <Download className="mr-2 h-4 w-4" /> Importer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {productToImport && (
        <ImportProductDialog
          isOpen={!!productToImport}
          onOpenChange={() => setProductToImport(null)}
          product={productToImport}
          userStores={userStores}
          onImport={onImportProduct}
        />
      )}
    </div>
  );
};

export default function UserDropshipping() {
  const [supplierStores, setSupplierStores] = useState([]);
  const [userStores, setUserStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalStores, setTotalStores] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    
    const { data: suppliersData, error: suppliersError } = await supabase.rpc('get_supplier_stores_paginated', {
      p_page: page,
      p_page_size: STORES_PER_PAGE
    });

    if (suppliersError) {
      toast({ title: 'Erreur', description: "Impossible de charger les fournisseurs.", variant: 'destructive' });
    } else {
      setSupplierStores(suppliersData || []);
      setTotalStores(suppliersData?.[0]?.total_count || 0);
    }

    if (user) {
      const { data: userStoresData, error: userStoresError } = await supabase
        .from('stores')
        .select('id, name')
        .eq('user_id', user.id);
      
      if (userStoresError) {
        toast({ title: 'Erreur', description: "Impossible de charger vos boutiques.", variant: 'destructive' });
      } else {
        setUserStores(userStoresData || []);
      }
    }

    setLoading(false);
  }, [toast, user, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImportProduct = async (product, storeId) => {
    const { images, ...productData } = product;
    const newProduct = {
      store_id: storeId,
      name: product.name,
      description: product.description,
      price: product.price,
      original_price: product.original_price,
      category: product.category,
      stock: product.product_type === 'physical' ? product.stock : null,
      image: product.image,
      is_dropshippable: false,
      wholesale_price: null,
      source_product_id: product.id,
      product_type: product.product_type,
      fee_bearer: product.fee_bearer,
    };

    const { data: insertedProduct, error } = await supabase
      .from('products')
      .insert(newProduct)
      .select()
      .single();

    if (error) {
      toast({ title: "Erreur d'importation", description: error.message, variant: "destructive" });
      return;
    }

    if (insertedProduct && images && images.length > 0) {
      const imagesToInsert = images.map(imgUrl => ({
        product_id: insertedProduct.id,
        url: imgUrl,
      }));
      const { error: imagesError } = await supabase.from('products_images').insert(imagesToInsert);
      if (imagesError) {
        toast({ title: "Erreur d'importation des images", description: imagesError.message, variant: "destructive" });
      }
    }

    toast({ title: "Produit importé !", description: `${product.name} a été ajouté à votre boutique.` });
  };

  const filteredSupplierStores = supplierStores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Dropshipping - PayLiv</title>
        <meta name="description" content="Trouvez des fournisseurs et importez des produits dans votre boutique." />
      </Helmet>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Dropshipping</h1>
          <p className="text-muted-foreground">Trouvez des produits auprès de nos fournisseurs partenaires et ajoutez-les à votre boutique.</p>
        </motion.div>

        {selectedSupplier ? (
          <SupplierProductsView 
            supplierStore={selectedSupplier} 
            onBack={() => setSelectedSupplier(null)}
            userStores={userStores}
            onImportProduct={handleImportProduct}
          />
        ) : (
          <>
            <div className="mb-8 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg bg-card border-border focus:ring-primary"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            ) : filteredSupplierStores.length === 0 ? (
              <div className="text-center py-20">
                <GitFork className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-2xl font-semibold text-foreground mb-2">Aucun fournisseur trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Aucun fournisseur ne correspond à votre recherche." : "Revenez bientôt pour découvrir nos partenaires."}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {filteredSupplierStores.map(store => (
                    <SupplierStoreCard key={store.id} store={store} onSelect={setSelectedSupplier} />
                  ))}
                </div>
                <DataTablePagination page={page} total={totalStores} perPage={STORES_PER_PAGE} onPageChange={setPage} />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}