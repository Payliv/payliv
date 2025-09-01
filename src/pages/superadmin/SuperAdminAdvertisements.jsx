import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, Briefcase, Link as LinkIcon, AlertTriangle, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdvertisementForm = ({ isOpen, setIsOpen, ad, onSuccess }) => {
  const [formData, setFormData] = useState({ title: '', link_url: '', placement: 'marketplace_top', image_urls: [] });
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (ad) {
      setFormData({ title: ad.title, link_url: ad.link_url || '', placement: ad.placement, image_urls: ad.image_urls || [] });
    } else {
      setFormData({ title: '', link_url: '', placement: 'marketplace_top', image_urls: [] });
    }
    setImageFiles([]);
  }, [ad, isOpen]);

  const handleRemoveImage = (index) => {
    const updatedImageUrls = [...formData.image_urls];
    updatedImageUrls.splice(index, 1);
    setFormData({ ...formData, image_urls: updatedImageUrls });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0 && formData.image_urls.length === 0) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Au moins une image est requise.' });
      return;
    }
    setIsSubmitting(true);

    try {
      const newImageUrls = [];
      for (const file of imageFiles) {
        const filePath = `advertisements/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('store_assets').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('store_assets').getPublicUrl(filePath);
        newImageUrls.push(publicUrl);
      }

      const finalImageUrls = [...formData.image_urls, ...newImageUrls];

      const adData = { 
        title: formData.title,
        link_url: formData.link_url,
        placement: formData.placement,
        image_urls: finalImageUrls, 
        updated_at: new Date().toISOString() 
      };

      let error;
      if (ad) {
        ({ error } = await supabase.from('advertisements').update(adData).eq('id', ad.id));
      } else {
        ({ error } = await supabase.from('advertisements').insert(adData));
      }

      if (error) throw error;

      toast({ title: 'Succès', description: `Publicité ${ad ? 'mise à jour' : 'ajoutée'} avec succès.` });
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]" aria-labelledby="advertisement-form-title">
        <DialogHeader>
          <DialogTitle id="advertisement-form-title">{ad ? 'Modifier la' : 'Ajouter une'} Publicité</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Titre</Label>
            <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link_url" className="text-right">URL de destination</Label>
            <Input id="link_url" type="url" value={formData.link_url} onChange={e => setFormData({...formData, link_url: e.target.value})} className="col-span-3" placeholder="https://example.com" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="placement" className="text-right">Emplacement</Label>
            <Select value={formData.placement} onValueChange={(value) => setFormData({...formData, placement: value})}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="marketplace_top">Haut de la Marketplace</SelectItem>
                    <SelectItem value="landing_page">Page d'accueil (Diaporama)</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Images Actuelles</Label>
            <div className="col-span-3">
              {formData.image_urls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {formData.image_urls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Aperçu ${index}`} className="w-full h-24 object-cover rounded-md" />
                      <Button type="button" size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground pt-2">Aucune image existante.</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">Ajouter des images</Label>
            <Input id="image" type="file" accept="image/*" multiple onChange={e => setImageFiles(Array.from(e.target.files))} className="col-span-3" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ad ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const SuperAdminAdvertisements = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const { toast } = useToast();

  const fetchAds = useCallback(async (isInitialFetch = false) => {
    if(isInitialFetch) setLoading(true);
    const { data, error } = await supabase.from('advertisements').select('*').order('created_at', { ascending: false });

    if (error) {
       toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    } else {
      setAds(data || []);
    }
    if(isInitialFetch) setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAds(true);
  }, [fetchAds]);

  const handleOpenForm = (ad = null) => {
    setEditingAd(ad);
    setIsFormOpen(true);
  };

  const handleDelete = async (adId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) return;
    const { error } = await supabase.from('advertisements').delete().eq('id', adId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer la publicité.' });
    } else {
      toast({ title: 'Succès', description: 'Publicité supprimée.' });
      fetchAds();
    }
  };

  const handleToggleActive = async (ad) => {
    const { error } = await supabase
      .from('advertisements')
      .update({ is_active: !ad.is_active, updated_at: new Date().toISOString() })
      .eq('id', ad.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
    } else {
      toast({ title: 'Succès', description: 'Statut de la publicité mis à jour.' });
      fetchAds();
    }
  };

  return (
    <>
      <Helmet>
        <title>Gestion des Publicités - Super Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Publicités</h1>
            <p className="text-muted-foreground">Ajoutez et gérez les bannières publicitaires.</p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une publicité
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
        ) : ads.length === 0 ? (
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
             <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
             <h2 className="mt-4 text-2xl font-semibold">Aucune publicité trouvée</h2>
             <p className="mt-2 text-muted-foreground">Commencez par ajouter votre première bannière publicitaire.</p>
             <Button onClick={() => handleOpenForm()} className="mt-6"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter une publicité</Button>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map(ad => (
              <Card key={ad.id} className="flex flex-col">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <CardTitle className="truncate">{ad.title}</CardTitle>
                        <Switch checked={ad.is_active} onCheckedChange={() => handleToggleActive(ad)} />
                    </div>
                    <CardDescription>{ad.placement === 'landing_page' ? "Page d'accueil" : "Haut de la Marketplace"}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="aspect-video w-full rounded-md overflow-hidden border bg-muted">
                    {ad.image_urls && ad.image_urls.length > 0 ? (
                        <img src={ad.image_urls[0]} alt={ad.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">Pas d'image</div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ad.image_urls?.length || 0} image{ad.image_urls?.length > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LinkIcon className="w-4 h-4"/>
                    <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">{ad.link_url || 'Aucun lien'}</a>
                  </div>
                </CardContent>
                <div className="p-4 border-t flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenForm(ad)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(ad.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      {isFormOpen && (
        <AdvertisementForm isOpen={isFormOpen} setIsOpen={setIsFormOpen} ad={editingAd} onSuccess={fetchAds} />
      )}
    </>
  );
};

export default SuperAdminAdvertisements;