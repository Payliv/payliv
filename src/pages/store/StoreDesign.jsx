import React, { useRef, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLoader from '@/components/PageLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Save, Upload, Loader2, Image as ImageIcon, Plus, Trash2, Type, Palette } from 'lucide-react';

const sanitizeFileName = (name) => {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_').replace(/_{2,}/g, '_');
};

export default function StoreDesign() {
  const { store, setStore, isSaving, updateStore } = useOutletContext();
  const { user } = useAuth();
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState({ logo: false, cover: false });
  const navigate = useNavigate();

  if (!store) return <PageLoader />;

  const handleFieldChange = (field, value) => {
    setStore(prev => ({ ...prev, [field]: value }));
  };

  const handleThemeChange = (field, value) => {
    setStore(prev => ({ ...prev, theme: { ...prev.theme, [field]: value } }));
  };

  const handleSave = () => {
    const { products, ...storeToSave } = store;
    updateStore(storeToSave);
  };
  
  const handleFileUpload = async (event, field, isMultiple = false) => {
    if (!user) return;

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadKey = isMultiple ? 'cover' : 'logo';
    setIsUploading(prev => ({ ...prev, [uploadKey]: true }));

    const uploadPromises = Array.from(files).map(file => {
      const sanitizedName = sanitizeFileName(file.name);
      const fileName = `${user.id}/${store.id}/${field}/${Date.now()}-${sanitizedName}`;
      return supabase.storage.from('store_assets').upload(fileName, file);
    });

    try {
      const results = await Promise.all(uploadPromises);
      const urls = [];

      for (const result of results) {
        if (result.error) throw result.error;
        const { data } = supabase.storage.from('store_assets').getPublicUrl(result.data.path);
        urls.push(data.publicUrl);
      }

      if (isMultiple) {
        const currentImages = store.cover_images || [];
        handleFieldChange('cover_images', [...currentImages, ...urls]);
      } else {
        handleFieldChange(field, urls[0]);
      }

      toast({ title: "Téléversement réussi", description: `Image(s) ajoutée(s). N'oubliez pas de sauvegarder.` });
    } catch (error) {
      toast({ title: "Erreur de téléversement", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const removeCoverImage = (indexToRemove) => {
    const updatedCovers = store.cover_images.filter((_, index) => index !== indexToRemove);
    handleFieldChange('cover_images', updatedCovers);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Design de la boutique</h1>
          <p className="text-muted-foreground">Personnalisez l'apparence de votre boutique.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Sauvegarder
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Type className="mr-2 h-5 w-5 text-primary" /> Informations de base</CardTitle>
          <CardDescription>Modifiez le nom, la description et le logo de votre boutique.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><Label htmlFor="storeName">Nom de la boutique</Label><Input id="storeName" value={store.name} onChange={(e) => handleFieldChange('name', e.target.value)} /></div>
            <div><Label htmlFor="storeDescription">Description</Label><Input id="storeDescription" value={store.description} onChange={(e) => handleFieldChange('description', e.target.value)} /></div>
          </div>
          <div>
            <Label>Logo</Label>
            <div className="mt-2 flex items-center space-x-4">{store.logo && (<div className="w-20 h-20 rounded-lg bg-muted p-1"><img className="w-full h-full rounded-md object-contain" alt="Logo" src={store.logo} /></div>)}<input type="file" ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" accept="image/*" /><Button onClick={() => logoInputRef.current.click()} variant="outline" disabled={isUploading.logo}>{isUploading.logo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}{store.logo ? 'Changer' : 'Ajouter Logo'}</Button></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" /> Diaporama de couverture</CardTitle>
          <CardDescription>Ajoutez des images pour le diaporama en haut de votre boutique.</CardDescription>
        </CardHeader>
        <CardContent>
          <input type="file" ref={coverInputRef} onChange={(e) => handleFileUpload(e, 'cover_images', true)} className="hidden" accept="image/*" multiple />
          <Button onClick={() => coverInputRef.current.click()} variant="outline" className="mb-4" disabled={isUploading.cover}>{isUploading.cover ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Ajouter des images</Button>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {store.cover_images?.map((image, index) => (
              <div key={index} className="relative group bg-muted rounded-lg p-1"><img className="w-full h-32 rounded-md object-contain" alt={`Couverture ${index + 1}`} src={image} /><Button onClick={() => removeCoverImage(index)} size="icon" variant="destructive" className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button></div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" /> Couleurs</CardTitle>
          <CardDescription>Personnalisez la couleur principale. Le fond reste blanc pour une meilleure lisibilité.</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="primaryColor">Couleur principale</Label>
            <div className="flex items-center space-x-3 mt-2">
              <input type="color" id="primaryColor" value={store.theme?.primaryColor || '#000000'} onChange={(e) => handleThemeChange('primaryColor', e.target.value)} className="w-12 h-10 rounded border border-border bg-transparent" />
              <Input value={store.theme?.primaryColor || '#000000'} onChange={(e) => handleThemeChange('primaryColor', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}