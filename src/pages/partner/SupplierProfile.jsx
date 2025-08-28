import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import PageLoader from '@/components/PageLoader';
import { v4 as uuidv4 } from 'uuid';

export default function SupplierProfile() {
  const { profile, loadingProfile } = useProfile();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    portfolio_images: [],
    available_countries: [],
    collaboration_pdf_url: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (profile) {
      setLoading(true);
      const { data, error } = await supabase
        .from('dropshipping_companies')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (data) {
        setFormData({
          ...data,
          portfolio_images: data.portfolio_images || [],
          available_countries: data.available_countries || [],
        });
      }
      if (error) {
        console.error("Error fetching supplier profile:", error);
        if (error.code !== 'PGRST116') {
          toast({ title: "Erreur", description: "Impossible de charger le profil.", variant: "destructive" });
        }
      }
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    setIsUploading(true);
    const filePath = `${user.id}/${type}/${uuidv4()}`;
    const { data, error } = await supabase.storage.from('dropshipping_assets').upload(filePath, file);
    
    if (error) {
      toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('dropshipping_assets').getPublicUrl(filePath);
      if (type === 'logo') {
        setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      } else if (type === 'portfolio') {
        setFormData(prev => ({ ...prev, portfolio_images: [...prev.portfolio_images, publicUrl] }));
      } else if (type === 'pdf') {
        setFormData(prev => ({ ...prev, collaboration_pdf_url: publicUrl }));
      }
    }
    setIsUploading(false);
  };

  const removePortfolioImage = (index) => {
    setFormData(prev => ({
      ...prev,
      portfolio_images: prev.portfolio_images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const dataToUpsert = {
      ...formData,
      user_id: profile.id,
      id: formData.id || undefined,
    };

    const { error } = await supabase.from('dropshipping_companies').upsert(dataToUpsert, { onConflict: 'user_id' });

    if (error) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder le profil.", variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Profil sauvegardé avec succès." });
      fetchProfile();
    }
    setIsSaving(false);
  };

  if (loading || loadingProfile) {
    return <PageLoader />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Profil Fournisseur</CardTitle>
          <CardDescription>Gérez les informations publiques de votre entreprise pour les vendeurs.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 flex flex-col items-center">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center mb-2 overflow-hidden">
                    {formData.logo_url ? (
                      <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-sm text-primary text-center block">Changer le logo</span>
                </Label>
                <Input id="logo-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0], 'logo')} accept="image/*" />
              </div>
              <div className="md:col-span-2 space-y-4">
                <div>
                  <Label htmlFor="name">Nom de l'entreprise</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} />
                </div>
              </div>
            </div>

            <div>
              <Label>Portfolio de produits (images)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {formData.portfolio_images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePortfolioImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Label htmlFor="portfolio-upload" className="cursor-pointer w-full h-24 border-2 border-dashed rounded-md flex items-center justify-center">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </Label>
                <Input id="portfolio-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0], 'portfolio')} accept="image/*" />
              </div>
            </div>

            <div>
              <Label htmlFor="available_countries">Pays de livraison (séparés par une virgule)</Label>
              <Input 
                id="available_countries" 
                name="available_countries" 
                value={Array.isArray(formData.available_countries) ? formData.available_countries.join(', ') : ''} 
                onChange={(e) => setFormData(prev => ({...prev, available_countries: e.target.value.split(',').map(c => c.trim())}))}
              />
            </div>

            <div>
              <Label htmlFor="collaboration_pdf_url">Lien vers le PDF de collaboration</Label>
              <Input id="collaboration_pdf_url" name="collaboration_pdf_url" value={formData.collaboration_pdf_url} onChange={handleInputChange} placeholder="https://..." />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <Label htmlFor="is_active">Profil actif et visible par les vendeurs</Label>
              </div>
              <Button type="submit" disabled={isSaving || isUploading}>
                {(isSaving || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sauvegarder
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}