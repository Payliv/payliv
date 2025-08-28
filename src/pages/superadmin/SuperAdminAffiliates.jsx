import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Share2, Edit, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTablePagination } from '@/components/DataTablePagination';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const AffiliatesList = () => {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState('');

  const fetchAffiliates = useCallback(async (currentPage) => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_all_affiliates_paginated', {
      p_page: currentPage,
      p_page_size: ITEMS_PER_PAGE
    });

    if (error) {
      toast({ title: "Erreur", description: "Impossible de charger les affiliés.", variant: "destructive" });
    } else {
      setAffiliates(data || []);
      setTotal(data?.[0]?.total_count || 0);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAffiliates(page);
  }, [page, fetchAffiliates]);

  const handleEditClick = (affiliate) => {
    setSelectedAffiliate(affiliate);
    setNewCommissionRate(affiliate.commission_rate || '');
    setIsEditModalOpen(true);
  };

  const handleSaveCommission = async () => {
    if (!selectedAffiliate) return;

    const rate = newCommissionRate === '' ? null : parseFloat(newCommissionRate);
    if (newCommissionRate !== '' && (isNaN(rate) || rate < 0)) {
        toast({ title: "Erreur", description: "Veuillez entrer un taux de commission valide.", variant: "destructive" });
        return;
    }

    const { error } = await supabase.rpc('update_affiliate_commission_rate', {
        p_affiliate_id: selectedAffiliate.id,
        p_new_rate: rate
    });

    if (error) {
        toast({ title: "Erreur", description: "Impossible de mettre à jour le taux.", variant: "destructive" });
    } else {
        toast({ title: "Succès", description: "Le taux de commission a été mis à jour." });
        setIsEditModalOpen(false);
        fetchAffiliates(page);
    }
  };

  return (
    <>
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Liste des Affiliés</CardTitle>
          <CardDescription>Gérez tous les utilisateurs participant au programme d'affiliation.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-sm font-semibold">Affilié</th>
                  <th className="p-4 text-sm font-semibold">Code</th>
                  <th className="p-4 text-sm font-semibold">Commission</th>
                  <th className="p-4 text-sm font-semibold">Solde</th>
                  <th className="p-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                    <tr>
                        <td colSpan="5" className="text-center p-8"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></td>
                    </tr>
                ) : affiliates.length > 0 ? affiliates.map(affiliate => (
                  <tr key={affiliate.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4">
                      <div className="font-medium">{affiliate.name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{affiliate.email}</div>
                    </td>
                    <td className="p-4 font-mono text-primary">{affiliate.affiliate_code}</td>
                    <td className="p-4">
                      {affiliate.commission_rate !== null ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3"/>
                          <span>{affiliate.effective_commission_rate}% (Perso)</span>
                        </Badge>
                      ) : (
                        <span>{affiliate.effective_commission_rate}% (Global)</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold">{affiliate.balance ? affiliate.balance.toLocaleString() : '0'} FCFA</td>
                    <td className="p-4">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(affiliate)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-muted-foreground">Aucun affilié trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <DataTablePagination page={page} total={total} perPage={ITEMS_PER_PAGE} onPageChange={setPage} />
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Modifier le Taux de Commission</DialogTitle>
                <DialogDescription>
                    Définissez un taux de commission personnalisé pour {selectedAffiliate?.name}. 
                    Laissez vide pour utiliser le taux global par défaut.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="commission-rate" className="text-right">Taux (%)</Label>
                    <Input
                        id="commission-rate"
                        type="number"
                        value={newCommissionRate}
                        onChange={(e) => setNewCommissionRate(e.target.value)}
                        placeholder="Taux global par défaut"
                        className="col-span-3"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
                <Button onClick={handleSaveCommission}>Enregistrer</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function SuperAdminAffiliates() {
  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2 flex items-center">
          <Share2 className="w-8 h-8 mr-3" />
          Gestion des Affiliés
        </h1>
        <p className="text-muted-foreground">
          Supervisez tous les aspects de votre programme d'affiliation.
        </p>
      </motion.div>

      <AffiliatesList />
    </div>
  );
}