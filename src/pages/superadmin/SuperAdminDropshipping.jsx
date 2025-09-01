import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, X, Upload, FileText, Image as ImageIcon, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTablePagination } from '@/components/DataTablePagination';

const ITEMS_PER_PAGE = 6;

const SuperAdminDropshipping = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_dropshipping_companies_paginated', {
      p_page: page,
      p_page_size: ITEMS_PER_PAGE
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de charger les entreprises.' });
    } else {
      setCompanies(data || []);
      setTotalCompanies(data?.[0]?.total_count || 0);
    }
    setLoading(false);
  }, [toast, page]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleOpenForm = (company = null) => {
    setEditingCompany(company);
    setIsFormOpen(true);
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return;

    const { error } = await supabase.from('dropshipping_companies').delete().eq('id', companyId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer l\'entreprise.' });
    } else {
      toast({ title: 'Succès', description: 'Entreprise supprimée.' });
      fetchCompanies();
    }
  };

  const handleToggleActive = async (company) => {
    const { error } = await supabase
      .from('dropshipping_companies')
      .update({ is_active: !company.is_active })
      .eq('id', company.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour le statut.' });
    } else {
      toast({ title: 'Succès', description: 'Statut de l\'entreprise mis à jour.' });
      fetchCompanies();
    }
  };

  return (
    <>
      <Helmet>
        <title>Gestion Dropshipping - Super Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Partenaires Dropshipping</h1>
            <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez des entreprises partenaires.</p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une entreprise
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : companies.length === 0 ? (
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
             <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
             <h2 className="mt-4 text-2xl font-semibold">Aucun partenaire trouvé</h2>
             <p className="mt-2 text-muted-foreground">Commencez par ajouter votre premier partenaire de dropshipping.</p>
             <Button onClick={() => handleOpenForm()} className="mt-6">
               <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un partenaire
             </Button>
           </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map(company => (
                <Card key={company.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <img src={company.logo_url} alt={company.name} className="w-12 h-12 rounded-full object-contain border" />
                        <CardTitle>{company.name}</CardTitle>
                      </div>
                      <Switch
                        checked={company.is_active}
                        onCheckedChange={() => handleToggleActive(company)}
                      />
                    </div>
                    <CardDescription>
                      {company.available_countries?.slice(0, 3).join(', ')}
                      {company.available_countries?.length > 3 && '...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">{company.description}</p>
                  </CardContent>
                  <div className="p-4 border-t flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenForm(company)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(company.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            <DataTablePagination page={page} total={totalCompanies} perPage={ITEMS_PER_PAGE} onPageChange={setPage} />
          </>
        )}
      </div>
      {isFormOpen && (
        <CompanyForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          company={editingCompany}
          onSuccess={fetchCompanies}
        />
      )}
    </>
  );
};

const CompanyForm = ({ isOpen, setIsOpen, company, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    available_countries: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        description: company.description || '',
        available_countries: company.available_countries?.join(', ') || '',
      });
    } else {
      setFormData({ name: '', description: '', available_countries: '' });
    }
  }, [company]);

  const uploadFile = async (file, bucket, path) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let logo_url = company?.logo_url;
      if (logoFile) {
        logo_url = await uploadFile(logoFile, 'dropshipping_assets', `logos/${Date.now()}-${logoFile.name}`);
      }

      let collaboration_pdf_url = company?.collaboration_pdf_url;
      if (pdfFile) {
        collaboration_pdf_url = await uploadFile(pdfFile, 'dropshipping_assets', `pdfs/${Date.now()}-${pdfFile.name}`);
      }

      let portfolio_images = company?.portfolio_images || [];
      if (portfolioFiles.length > 0) {
        const uploadedImageUrls = await Promise.all(
          portfolioFiles.map(file => uploadFile(file, 'dropshipping_assets', `portfolio/${Date.now()}-${file.name}`))
        );
        portfolio_images = [...portfolio_images, ...uploadedImageUrls];
      }

      const companyData = {
        name: formData.name,
        description: formData.description,
        available_countries: formData.available_countries.split(',').map(c => c.trim()).filter(Boolean),
        logo_url,
        collaboration_pdf_url,
        portfolio_images,
      };

      let error;
      if (company) {
        ({ error } = await supabase.from('dropshipping_companies').update(companyData).eq('id', company.id));
      } else {
        ({ error } = await supabase.from('dropshipping_companies').insert(companyData));
      }

      if (error) throw error;

      toast({ title: 'Succès', description: `Entreprise ${company ? 'mise à jour' : 'ajoutée'} avec succès.` });
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
      <DialogContent className="sm:max-w-[600px]" aria-labelledby="company-form-title">
        <DialogHeader>
          <DialogTitle id="company-form-title">{company ? 'Modifier' : 'Ajouter'} une entreprise</DialogTitle>
          <DialogDescription>Remplissez les informations du partenaire de dropshipping.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nom</Label>
            <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">Description</Label>
            <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="countries" className="text-right">Pays (séparés par une virgule)</Label>
            <Input id="countries" value={formData.available_countries} onChange={e => setFormData({...formData, available_countries: e.target.value})} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="logo" className="text-right">Logo</Label>
            <Input id="logo" type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="portfolio" className="text-right pt-2">Portfolio</Label>
            <Input id="portfolio" type="file" accept="image/*" multiple onChange={e => setPortfolioFiles(Array.from(e.target.files))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pdf" className="text-right">PDF de collaboration</Label>
            <Input id="pdf" type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files[0])} className="col-span-3" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {company ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminDropshipping;