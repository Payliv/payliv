import React, { useRef, useState, useEffect, useMemo } from 'react';
    import { motion } from 'framer-motion';
    import { Plus, Upload, Loader2, Trash2, GitFork, FileUp } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { toast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import RichTextEditor from './RichTextEditor';
    import { Switch } from '@/components/ui/switch';
    import { useProfile } from '@/contexts/ProfileContext';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { physicalCategories, digitalCategories } from '@/lib/productCategories';


    export default function ProductForm({ store, editingProduct, onFormSubmit, onCancel, isSubmitting }) {
      const { user } = useAuth();
      const { profile } = useProfile();
      const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        original_price: '',
        image: '',
        images: [],
        category: '',
        stock: '',
        promotion_ends_at: '',
        is_dropshippable: false,
        wholesale_price: '',
        fee_bearer: 'seller',
      });
      const [isUploading, setIsUploading] = useState({ main: false, secondary: false, digital: false });
      const [digitalFiles, setDigitalFiles] = useState([]);
      const imageInputRef = useRef(null);
      const secondaryImagesInputRef = useRef(null);
      const digitalFileInputRef = useRef(null);
      
      const categoriesForStoreType = useMemo(() => {
        if (store.store_type === 'digital') {
          return digitalCategories;
        }
        return physicalCategories;
      }, [store.store_type]);

      useEffect(() => {
        const fetchDigitalFiles = async (productId) => {
          const { data, error } = await supabase
            .from('digital_product_files')
            .select('*')
            .eq('product_id', productId);
          
          if (!error) {
            setDigitalFiles(data || []);
          }
        };

        if (editingProduct) {
          setProductForm({
            name: editingProduct.name || '',
            description: editingProduct.description || '',
            price: editingProduct.price?.toString() || '',
            original_price: editingProduct.original_price?.toString() || '',
            image: editingProduct.image || '',
            images: (editingProduct.products_images || []).map(img => (typeof img === 'string' ? { url: img } : img)),
            category: editingProduct.category || '',
            stock: editingProduct.stock?.toString() || '',
            promotion_ends_at: editingProduct.promotion_ends_at ? new Date(editingProduct.promotion_ends_at).toISOString().slice(0, 16) : '',
            is_dropshippable: editingProduct.is_dropshippable || false,
            wholesale_price: editingProduct.wholesale_price?.toString() || '',
            fee_bearer: editingProduct.fee_bearer || 'seller',
          });
          if (store.store_type === 'digital') {
            fetchDigitalFiles(editingProduct.id);
          }
        } else {
           setProductForm({
            name: '', description: '', price: '', original_price: '',
            image: '', images: [], category: '', stock: '', promotion_ends_at: '',
            is_dropshippable: false, wholesale_price: '', fee_bearer: 'seller'
          });
          setDigitalFiles([]);
        }
      }, [editingProduct, store.store_type]);

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!productForm.name || !productForm.price || !productForm.category) {
          toast({ title: "Erreur", description: "Le nom, le prix et la catégorie sont obligatoires", variant: "destructive" });
          return;
        }
        if (productForm.is_dropshippable && !productForm.wholesale_price) {
          toast({ title: "Erreur", description: "Le prix de gros est obligatoire pour le dropshipping.", variant: "destructive" });
          return;
        }
        if (store.store_type === 'digital' && digitalFiles.length === 0 && !editingProduct) {
          toast({ title: "Erreur", description: "Veuillez ajouter au moins un fichier pour un produit digital.", variant: "destructive" });
          return;
        }

        onFormSubmit({ ...productForm, digital_files: digitalFiles });
      };
      
      const handleImageUpload = async (event, uploadType) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !user) return;

        setIsUploading(prev => ({ ...prev, [uploadType]: true }));

        const bucket = uploadType === 'digital' ? 'digital_products' : 'store_assets';
        const folder = 'products';

        const uploadPromises = Array.from(files).map(file => {
          const sanitizedFilename = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-._]/g, '');
          const fileName = `${user.id}/${store.id || 'new_store'}/${folder}/${Date.now()}-${sanitizedFilename}`;
          return supabase.storage.from(bucket).upload(fileName, file);
        });

        try {
          const results = await Promise.all(uploadPromises);
          
          if (uploadType === 'digital') {
            const newFiles = [];
            for (let i = 0; i < results.length; i++) {
                if (results[i].error) throw results[i].error;
                newFiles.push({
                    product_id: editingProduct?.id,
                    file_name: files[i].name,
                    storage_path: results[i].data.path,
                    file_type: files[i].type,
                    file_size: files[i].size,
                });
            }
            setDigitalFiles(prev => [...prev, ...newFiles]);
          } else {
            const urls = [];
            for (const result of results) {
              if (result.error) throw result.error;
              const { data } = supabase.storage.from(bucket).getPublicUrl(result.data.path);
              if (typeof data.publicUrl === 'string') {
                urls.push({ url: data.publicUrl });
              }
            }

            if (uploadType === 'secondary') {
              setProductForm(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
            } else {
              if (urls[0] && urls[0].url) {
                setProductForm(prev => ({ ...prev, image: urls[0].url }));
              }
            }
          }
          
          toast({ title: "Fichier(s) ajouté(s)" });
        } catch (error) {
          toast({ title: "Erreur de téléversement", description: error.message, variant: "destructive" });
        } finally {
          setIsUploading(prev => ({ ...prev, [uploadType]: false }));
          event.target.value = "";
        }
      };

      const removeSecondaryImage = (indexToRemove) => {
        setProductForm(prev => ({...prev, images: prev.images.filter((_, index) => index !== indexToRemove)}));
      };
      
      const removeDigitalFile = (indexToRemove) => {
        const fileToRemove = digitalFiles[indexToRemove];
        if (fileToRemove.id) {
            supabase.from('digital_product_files').delete().eq('id', fileToRemove.id).then(({error}) => {
                if (error) toast({title: "Erreur", description: "Impossible de supprimer le fichier de la base de données.", variant: "destructive"});
            });
        }
        setDigitalFiles(prev => prev.filter((_, index) => index !== indexToRemove));
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

      const triggerFileInput = (e, ref) => {
        e.stopPropagation();
        ref.current?.click();
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 sm:p-6 border border-border"
        >
          <h4 className="text-lg font-semibold text-foreground mb-4">
            {editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
            <span className="ml-2 text-sm font-normal text-muted-foreground">({store.store_type === 'digital' ? 'Digital' : 'Physique'})</span>
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">

            {profile?.role === 'partner' && (
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_dropshippable" className="flex items-center text-primary font-semibold">
                    <GitFork className="w-5 h-5 mr-2" />
                    <span>Activer pour le Dropshipping</span>
                  </Label>
                  <Switch id="is_dropshippable" checked={productForm.is_dropshippable} onCheckedChange={(c) => setProductForm(p => ({...p, is_dropshippable: c}))} />
                </div>
                {productForm.is_dropshippable && (
                  <div className="mt-4">
                    <Label htmlFor="wholesale_price" className="text-foreground">Prix de gros *</Label>
                    <Input id="wholesale_price" type="number" step="0.01" value={productForm.wholesale_price} onChange={(e) => setProductForm(p => ({ ...p, wholesale_price: e.target.value }))} className="bg-background mt-2" placeholder="Le prix que les vendeurs vous paieront" required />
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Nom du produit *</Label>
                <Input id="productName" value={productForm.name} onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))} className="bg-background mt-2" required />
              </div>
              <div>
                <Label htmlFor="productCategory">Catégorie *</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) => setProductForm(p => ({ ...p, category: value }))}
                >
                  <SelectTrigger id="productCategory" className="bg-background mt-2">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesForStoreType.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="productDescription">Description</Label>
              <RichTextEditor value={productForm.description} onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))} productName={productForm.name} storeId={store.id} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productPrice">Prix de vente final ({currencySymbol}) *</Label>
                <Input id="productPrice" type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))} className="bg-background mt-2" required />
              </div>
              <div>
                <Label htmlFor="productOriginalPrice">Prix barré ({currencySymbol})</Label>
                <Input id="productOriginalPrice" type="number" step="0.01" value={productForm.original_price} onChange={(e) => setProductForm(p => ({ ...p, original_price: e.target.value }))} className="bg-background mt-2" />
              </div>
            </div>

            {store.store_type === 'physical' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productStock">Stock</Label>
                  <Input id="productStock" type="number" value={productForm.stock} onChange={(e) => setProductForm(p => ({ ...p, stock: e.target.value }))} className="bg-background mt-2" />
                </div>
                <div>
                  <Label htmlFor="promotionEndsAt">Fin de la promotion</Label>
                  <Input id="promotionEndsAt" type="datetime-local" value={productForm.promotion_ends_at} onChange={(e) => setProductForm(p => ({ ...p, promotion_ends_at: e.target.value }))} className="bg-background mt-2" />
                </div>
              </div>
            )}

            {store.store_type === 'digital' && (
                <div className="space-y-2">
                    <Label className="text-foreground">Fichiers du produit digital</Label>
                    <input type="file" ref={digitalFileInputRef} onChange={(e) => handleImageUpload(e, 'digital')} className="hidden" multiple accept=".pdf,.zip,.epub,.mobi,.mp3,.mp4,.mov,.docx,.pptx,.xlsx" />
                    <Button type="button" onClick={(e) => triggerFileInput(e, digitalFileInputRef)} variant="outline" className="w-full" disabled={isUploading.digital}>
                        <span className="flex items-center justify-center">
                            {isUploading.digital ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileUp className="w-4 h-4 mr-2" />}
                            <span>Ajouter des fichiers</span>
                        </span>
                    </Button>
                    <div className="space-y-2 mt-2">
                        {digitalFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                                <span className="text-sm truncate">{file.file_name}</span>
                                <Button type="button" size="icon" variant="ghost" onClick={() => removeDigitalFile(index)} className="w-6 h-6">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-foreground">Image principale (Vignette)</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0 p-1">
                    {productForm.image ? <img className="w-full h-full rounded-lg object-contain" alt="Aperçu" src={productForm.image} /> : <Upload className="w-8 h-8 text-muted-foreground" />}
                  </div>
                  <input type="file" ref={imageInputRef} onChange={(e) => handleImageUpload(e, 'main')} className="hidden" accept="image/*" />
                  <Button type="button" onClick={(e) => triggerFileInput(e, imageInputRef)} variant="outline" disabled={isUploading.main}>
                    <span className="flex items-center justify-center">
                      {isUploading.main ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      <span>{productForm.image ? 'Changer' : 'Ajouter'}</span>
                    </span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Images secondaires</Label>
                <input type="file" ref={secondaryImagesInputRef} onChange={(e) => handleImageUpload(e, 'secondary')} className="hidden" accept="image/*" multiple />
                <Button type="button" onClick={(e) => triggerFileInput(e, secondaryImagesInputRef)} variant="outline" className="w-full" disabled={isUploading.secondary}>
                  <span className="flex items-center justify-center">
                    {isUploading.secondary ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    <span>Ajouter des images</span>
                  </span>
                </Button>
                <div className="flex flex-wrap gap-2 mt-2">
                  {productForm.images?.map((img, index) => (
                    <div key={index} className="relative group w-20 h-20 bg-muted rounded-lg p-1">
                      <img src={img.url} alt={`img-${index}`} className="w-full h-full rounded-lg object-contain" />
                      <Button type="button" size="icon" variant="destructive" onClick={() => removeSecondaryImage(index)} className="absolute -top-1 -right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingProduct ? 'Modifier le produit' : 'Ajouter le produit'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Annuler</Button>
            </div>
          </form>
        </motion.div>
      );
    }