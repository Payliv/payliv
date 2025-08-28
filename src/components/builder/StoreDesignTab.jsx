import React, { useRef, useState } from 'react';
    import { motion } from 'framer-motion';
    import { Palette, Upload, Type, Layout, Image as ImageIcon, Plus, Trash2, Loader2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { toast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

    const sanitizeFileName = (name) => {
      return name.replace(/[^a-zA-Z0-9.\-_]/g, '_').replace(/_{2,}/g, '_');
    };

    export default function StoreDesignTab({ store, setStore }) {
      const { user } = useAuth();
      const logoInputRef = useRef(null);
      const coverInputRef = useRef(null);
      const [isUploading, setIsUploading] = useState({ logo: false, cover: false });

      const updateStoreField = (field, value) => {
        setStore(prev => ({ ...prev, [field]: value }));
      };

      const updateTheme = (field, value) => {
        setStore(prev => ({
          ...prev,
          theme: { ...prev.theme, [field]: value }
        }));
      };

      const handleFileUpload = async (event, field, isMultiple = false) => {
        if (!user) {
          toast({ title: "Erreur", description: "Vous devez être connecté pour téléverser.", variant: "destructive" });
          return;
        }

        const files = event.target.files;
        if (!files || files.length === 0) return;

        const uploadKey = isMultiple ? 'cover' : 'logo';
        setIsUploading(prev => ({ ...prev, [uploadKey]: true }));

        const uploadPromises = Array.from(files).map(file => {
          const sanitizedName = sanitizeFileName(file.name);
          const fileName = `${user.id}/${store.id || 'new_store'}/${field}/${Date.now()}-${sanitizedName}`;
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
            updateStoreField('cover_images', [...currentImages, ...urls]);
          } else {
            updateStoreField(field, urls[0]);
          }

          toast({
            title: "Téléversement réussi",
            description: `${files.length} image(s) ajoutée(s). N'oubliez pas de sauvegarder.`,
          });
        } catch (error) {
          toast({
            title: "Erreur de téléversement",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsUploading(prev => ({ ...prev, [uploadKey]: false }));
        }
      };

      const removeCoverImage = (indexToRemove) => {
        const updatedCovers = store.cover_images.filter((_, index) => index !== indexToRemove);
        updateStoreField('cover_images', updatedCovers);
      };

      const presetThemes = [
        // Thèmes Équilibrés
        { name: 'Violet Moderne', primaryColor: '#8B5CF6', secondaryColor: '#06B6D4', backgroundColor: '#1F2937', textColor: '#FFFFFF' },
        { name: 'Bleu Océan', primaryColor: '#3B82F6', secondaryColor: '#10B981', backgroundColor: '#0F172A', textColor: '#F8FAFC' },
        { name: 'Rose Élégant', primaryColor: '#EC4899', secondaryColor: '#F59E0B', backgroundColor: '#1E1B4B', textColor: '#FBBF24' },
        { name: 'Vert Nature', primaryColor: '#10B981', secondaryColor: '#8B5CF6', backgroundColor: '#064E3B', textColor: '#ECFDF5' },
        // Thèmes Luxueux & Sombre
        { name: 'Noir & Or', primaryColor: '#FBBF24', secondaryColor: '#D1D5DB', backgroundColor: '#111827', textColor: '#FFFFFF' },
        { name: 'Cyberpunk Nuit', primaryColor: '#00FFFF', secondaryColor: '#FF00FF', backgroundColor: '#000000', textColor: '#FFFFFF' },
        { name: 'Rouge Passion', primaryColor: '#EF4444', secondaryColor: '#F97316', backgroundColor: '#18181B', textColor: '#F8FAFC' },
        { name: 'Espace Profond', primaryColor: '#A78BFA', secondaryColor: '#38BDF8', backgroundColor: '#020617', textColor: '#E2E8F0' },
        // Thèmes Clairs & Propres
        { name: 'Menthe Fraîche', primaryColor: '#34D399', secondaryColor: '#60A5FA', backgroundColor: '#F0FDFA', textColor: '#064E3B' },
        { name: 'Soleil Pêche', primaryColor: '#FB923C', secondaryColor: '#F87171', backgroundColor: '#FFF7ED', textColor: '#44403C' },
        { name: 'Ciel Clair', primaryColor: '#38BDF8', secondaryColor: '#A78BFA', backgroundColor: '#F0F9FF', textColor: '#0C4A6E' },
        { name: 'Sable Doux', primaryColor: '#D8B4FE', secondaryColor: '#7DD3FC', backgroundColor: '#FAF5FF', textColor: '#4A044E' },
        // Thèmes Naturels & Terrestres
        { name: 'Forêt Amazonienne', primaryColor: '#22C55E', secondaryColor: '#F59E0B', backgroundColor: '#14532D', textColor: '#F0FDF4' },
        { name: 'Coucher de Soleil', primaryColor: '#F97316', secondaryColor: '#EC4899', backgroundColor: '#422006', textColor: '#FEF3C7' },
        { name: 'Terre & Argile', primaryColor: '#A16207', secondaryColor: '#EAB308', backgroundColor: '#FEFCE8', textColor: '#422006' },
        { name: 'Lavande Douce', primaryColor: '#C084FC', secondaryColor: '#FB7185', backgroundColor: '#1E1B4B', textColor: '#F5F3FF' },
        // Thèmes Minimalistes & Modernes
        { name: 'Gris Urbain', primaryColor: '#4F46E5', secondaryColor: '#EC4899', backgroundColor: '#E5E7EB', textColor: '#1F2937' },
        { name: 'Monochrome Pro', primaryColor: '#10B981', secondaryColor: '#6B7280', backgroundColor: '#FFFFFF', textColor: '#111827' },
        { name: 'Rétro Vague', primaryColor: '#F472B6', secondaryColor: '#60A5FA', backgroundColor: '#0E1729', textColor: '#E0F2FE' },
        { name: 'Orange Vif', primaryColor: '#F97316', secondaryColor: '#14B8A6', backgroundColor: '#0C0A09', textColor: '#FDE68A' },
        // Nouveaux thèmes élégants
        { name: 'Crème & Café', primaryColor: '#A37E60', secondaryColor: '#D6CFC7', backgroundColor: '#F5F0E6', textColor: '#3D2B1F' },
        { name: 'Bleu Ardoise', primaryColor: '#4A5568', secondaryColor: '#A0AEC0', backgroundColor: '#F7FAFC', textColor: '#1A202C' },
        { name: 'Vert Sauge', primaryColor: '#84A98C', secondaryColor: '#CAD2C5', backgroundColor: '#F0F2EF', textColor: '#2F3E46' },
        { name: 'Bordeaux Chic', primaryColor: '#800020', secondaryColor: '#D3D3D3', backgroundColor: '#FFFFFF', textColor: '#333333' },
        { name: 'Marine & Corail', primaryColor: '#FF7F50', secondaryColor: '#FFFFFF', backgroundColor: '#000080', textColor: '#FFFFFF' },
        { name: 'Graphite & Menthe', primaryColor: '#98FF98', secondaryColor: '#E0E0E0', backgroundColor: '#36454F', textColor: '#FFFFFF' },
        { name: 'Poudré Rosé', primaryColor: '#DDA0DD', secondaryColor: '#8A2BE2', backgroundColor: '#FFF0F5', textColor: '#4B0082' },
        { name: 'Cuivre & Béton', primaryColor: '#B87333', secondaryColor: '#8C92AC', backgroundColor: '#F5F5F5', textColor: '#3A3B3C' },
        { name: 'Canard & Safran', primaryColor: '#F4C430', secondaryColor: '#E0E0E0', backgroundColor: '#008B8B', textColor: '#FFFFFF' },
        { name: 'Nude & Charbon', primaryColor: '#36454F', secondaryColor: '#E3BC9A', backgroundColor: '#FDF5E6', textColor: '#36454F' },
        { name: 'Émeraude Profond', primaryColor: '#50C878', secondaryColor: '#F0FFF0', backgroundColor: '#013220', textColor: '#F0FFF0' },
        { name: 'Ambre & Crépuscule', primaryColor: '#FFBF00', secondaryColor: '#483C32', backgroundColor: '#F2EAD3', textColor: '#483C32' },
        { name: 'Pastel Rêveur', primaryColor: '#A7C7E7', secondaryColor: '#F3E5AB', backgroundColor: '#FFFFFF', textColor: '#5D5D5D' },
        { name: 'Industriel Chic', primaryColor: '#FFA500', secondaryColor: '#FFFFFF', backgroundColor: '#2C3E50', textColor: '#FFFFFF' },
        { name: 'Terracotta & Sable', primaryColor: '#E2725B', secondaryColor: '#F4A460', backgroundColor: '#FDF1E0', textColor: '#5A3A22' },
        { name: 'Galaxie Lointaine', primaryColor: '#9370DB', secondaryColor: '#00CED1', backgroundColor: '#0C090A', textColor: '#E6E6FA' },
        { name: 'Aurore Boréale', primaryColor: '#7DF9FF', secondaryColor: '#FF69B4', backgroundColor: '#000033', textColor: '#FFFFFF' },
        { name: 'Papier & Encre', primaryColor: '#000000', secondaryColor: '#808080', backgroundColor: '#F8F8F8', textColor: '#000000' },
        { name: 'Art Déco', primaryColor: '#D4AF37', secondaryColor: '#FFFFFF', backgroundColor: '#000000', textColor: '#FFFFFF' },
        { name: 'Oasis Tropicale', primaryColor: '#32CD32', secondaryColor: '#FFD700', backgroundColor: '#F0FFF0', textColor: '#2E8B57' }
      ];

      const applyTheme = (theme) => {
        setStore(prev => ({ ...prev, theme: { ...prev.theme, ...theme } }));
        toast({ title: "Thème appliqué", description: `Le thème "${theme.name}" a été appliqué.` });
      };

      const handleThemeSelect = (themeName) => {
        const selectedTheme = presetThemes.find(t => t.name === themeName);
        if (selectedTheme) {
          applyTheme(selectedTheme);
        }
      };

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Store Info */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center space-x-3 mb-6"><Type className="w-6 h-6 text-primary" /><h3 className="text-xl font-semibold text-foreground">Informations de la boutique</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="storeName" className="text-foreground">Nom de la boutique</Label><Input id="storeName" value={store.name} onChange={(e) => updateStoreField('name', e.target.value)} className="bg-background mt-2" placeholder="Ma Super Boutique" /></div>
              <div><Label htmlFor="storeDescription" className="text-foreground">Description</Label><Input id="storeDescription" value={store.description} onChange={(e) => updateStoreField('description', e.target.value)} className="bg-background mt-2" placeholder="Description de votre boutique" /></div>
            </div>
            <div className="mt-6"><Label className="text-foreground">Logo de la boutique</Label><div className="mt-2 flex items-center space-x-4">{store.logo && (<div className="w-16 h-16 rounded-lg bg-muted p-1"><img className="w-full h-full rounded-md object-contain" alt="Logo" src={store.logo} /></div>)}<input type="file" ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" accept="image/*" /><Button onClick={() => logoInputRef.current.click()} variant="outline" disabled={isUploading.logo}>{isUploading.logo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}{store.logo ? 'Changer' : 'Ajouter'}</Button></div></div>
          </div>

          {/* Cover Slideshow */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center space-x-3 mb-2"><ImageIcon className="w-6 h-6 text-primary" /><h3 className="text-xl font-semibold text-foreground">Diaporama de couverture</h3></div>
            <p className="text-sm text-muted-foreground mb-4">Ces images s'affichent en haut de votre boutique. C'est facultatif.</p>
            <input type="file" ref={coverInputRef} onChange={(e) => handleFileUpload(e, 'cover_images', true)} className="hidden" accept="image/*" multiple />
            <Button onClick={() => coverInputRef.current.click()} variant="outline" className="mb-4" disabled={isUploading.cover}>{isUploading.cover ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Ajouter des images</Button>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {store.cover_images?.map((image, index) => (
                <div key={index} className="relative group bg-muted rounded-lg p-1">
                  <img className="w-full h-32 rounded-md object-contain" alt={`Couverture ${index + 1}`} src={image} />
                  <Button onClick={() => removeCoverImage(index)} size="icon" variant="destructive" className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Presets */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center space-x-3 mb-6"><Layout className="w-6 h-6 text-primary" /><h3 className="text-xl font-semibold text-foreground">Thèmes prédéfinis</h3></div>
            <Select onValueChange={handleThemeSelect} defaultValue={presetThemes.find(t => t.primaryColor === store.theme.primaryColor)?.name}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisissez un thème" />
              </SelectTrigger>
              <SelectContent>
                {presetThemes.map((theme) => (
                  <SelectItem key={theme.name} value={theme.name}>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                      <span>{theme.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Colors */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center space-x-3 mb-6"><Palette className="w-6 h-6 text-primary" /><h3 className="text-xl font-semibold text-foreground">Couleurs personnalisées</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="primaryColor" className="text-foreground">Principale</Label><div className="flex items-center space-x-3 mt-2"><input type="color" id="primaryColor" value={store.theme.primaryColor} onChange={(e) => updateTheme('primaryColor', e.target.value)} className="w-12 h-10 rounded border border-border bg-transparent" /><Input value={store.theme.primaryColor} onChange={(e) => updateTheme('primaryColor', e.target.value)} className="bg-background" /></div></div>
              <div><Label htmlFor="secondaryColor" className="text-foreground">Secondaire</Label><div className="flex items-center space-x-3 mt-2"><input type="color" id="secondaryColor" value={store.theme.secondaryColor} onChange={(e) => updateTheme('secondaryColor', e.target.value)} className="w-12 h-10 rounded border border-border bg-transparent" /><Input value={store.theme.secondaryColor} onChange={(e) => updateTheme('secondaryColor', e.target.value)} className="bg-background" /></div></div>
              <div><Label htmlFor="backgroundColor" className="text-foreground">Arrière-plan</Label><div className="flex items-center space-x-3 mt-2"><input type="color" id="backgroundColor" value={store.theme.backgroundColor} onChange={(e) => updateTheme('backgroundColor', e.target.value)} className="w-12 h-10 rounded border border-border bg-transparent" /><Input value={store.theme.backgroundColor} onChange={(e) => updateTheme('backgroundColor', e.target.value)} className="bg-background" /></div></div>
              <div><Label htmlFor="textColor" className="text-foreground">Texte</Label><div className="flex items-center space-x-3 mt-2"><input type="color" id="textColor" value={store.theme.textColor} onChange={(e) => updateTheme('textColor', e.target.value)} className="w-12 h-10 rounded border border-border bg-transparent" /><Input value={store.theme.textColor} onChange={(e) => updateTheme('textColor', e.target.value)} className="bg-background" /></div></div>
            </div>
          </div>
        </motion.div>
      );
    }