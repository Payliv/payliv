import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, DollarSign, GitFork, Globe, ShoppingCart, TrendingUp, Plus, Store, Lock } from 'lucide-react';
import PageLoader from '@/components/PageLoader';
import StatsCard from '@/components/StatsCard';
import SalesChart from '@/components/store/SalesChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flag } from '@/components/AfricaFlags';
import StoreCard from '@/components/StoreCard';
import CreateStoreWizard from '@/components/store/CreateStoreWizard';
import { DataTablePagination } from '@/components/DataTablePagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const STORES_PER_PAGE = 3;

const PartnerSalesChart = ({ data, title, description }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <SalesChart data={data} />
      </CardContent>
    </Card>
  );
};

export default function PartnerDashboard() {
  const { profile, loadingProfile, canCreateStore } = useProfile();
  const [supplierProfile, setSupplierProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStores, setTotalStores] = useState(0);

  const fetchPartnerData = useCallback(async () => {
    if (profile) {
      setLoading(true);
      
      const from = (currentPage - 1) * STORES_PER_PAGE;
      const to = from + STORES_PER_PAGE - 1;

      const [
        { data: supplierData, error: supplierError },
        { data: statsData, error: statsError },
        { data: storesData, error: storesError, count }
      ] = await Promise.all([
        supabase.from('dropshipping_companies').select('*').eq('user_id', profile.id).maybeSingle(),
        supabase.rpc('get_partner_dashboard_data', { p_user_id: profile.id }),
        supabase.from('stores').select('*', { count: 'exact' }).eq('user_id', profile.id).range(from, to).order('created_at', { ascending: false })
      ]);

      if (supplierError) {
        console.error("Error fetching supplier profile:", supplierError);
        toast({ title: "Erreur", description: "Impossible de charger le profil fournisseur.", variant: "destructive" });
      } else {
        setSupplierProfile(supplierData);
      }

      if (statsError) {
        console.error("Error fetching partner stats:", statsError);
        toast({ title: "Erreur", description: "Impossible de charger les statistiques.", variant: "destructive" });
      } else {
        setStats(statsData);
      }

      if (storesError) {
        toast({ title: 'Erreur', description: "Impossible de charger les boutiques.", variant: 'destructive' });
      } else {
        setStores(storesData || []);
        setTotalStores(count || 0);
      }

      setLoading(false);
    }
  }, [profile, currentPage, toast]);

  useEffect(() => {
    if (!loadingProfile) {
      fetchPartnerData();
    }
  }, [loadingProfile, fetchPartnerData]);

  const viewStore = (storeSlug) => navigate(`/s/${storeSlug}`);
  const editStore = (storeId) => navigate(`/store/${storeId}`);
  const deleteStore = async (storeId) => {
    const { error } = await supabase.from('stores').delete().eq('id', storeId);
    if (error) {
      toast({ title: "Erreur", description: "La suppression de la boutique a échoué.", variant: 'destructive' });
    } else {
      toast({ title: "Boutique supprimée", description: "La boutique a été supprimée avec succès." });
      fetchPartnerData();
    }
  };

  const copyStoreLink = (storeSlug) => {
    const url = `${window.location.origin}/s/${storeSlug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Lien copié !",
      description: "Le lien de la boutique a été copié dans le presse-papiers.",
    });
  };

  if (loading || loadingProfile) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Unifié</h1>
        <p className="text-muted-foreground">
          {supplierProfile ? `Bienvenue, ${supplierProfile.name}. ` : ''}
          Vue d'ensemble de vos activités de vendeur et de fournisseur.
        </p>
      </motion.div>

      {!supplierProfile && (
        <Card className="w-full text-center p-8 bg-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Devenez Fournisseur</CardTitle>
            <CardDescription>
              Créez votre profil de fournisseur pour commencer à vendre vos produits à notre réseau de vendeurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/partner/profile')}>
              Créer mon profil Fournisseur <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Revenus Ventes Directes" value={`${stats?.direct_sales?.totalRevenue?.toLocaleString() ?? 0} XOF`} icon={TrendingUp} color="from-purple-500 to-pink-500" />
        <StatsCard title="Commandes Directes" value={stats?.direct_sales?.totalOrders ?? 0} icon={ShoppingCart} color="from-orange-500 to-red-500" />
        <StatsCard title="Revenus Dropshipping" value={`${stats?.dropshipping?.total_dropship_revenue?.toLocaleString() ?? 0} XOF`} icon={DollarSign} color="from-green-500 to-emerald-500" />
        <StatsCard title="Ventes Dropshipping" value={stats?.dropshipping?.total_dropship_sales ?? 0} icon={GitFork} color="from-blue-500 to-cyan-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PartnerSalesChart data={stats?.dropshipping?.sales_over_time || []} title="Revenus Dropshipping (30j)" description="Évolution de vos gains en dropshipping." />
        <Card>
          <CardHeader>
            <CardTitle>Ventes par Pays (Dropshipping)</CardTitle>
            <CardDescription>Top 5 des pays où vos produits sont vendus.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.dropshipping?.sales_by_country && stats.dropshipping.sales_by_country.length > 0 ? (
              <ul className="space-y-4">
                {stats.dropshipping.sales_by_country.map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Flag code={item.country} className="w-6 h-6 mr-3 rounded-full object-cover" />
                      <span className="font-medium">{item.country}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.revenue.toLocaleString()} XOF</p>
                      <p className="text-xs text-muted-foreground">{item.sales} ventes</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Globe className="mx-auto h-12 w-12" />
                <p className="mt-4">Aucune donnée de vente par pays disponible.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-card-foreground">Mes Boutiques de Vente Directe</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full sm:w-auto">
                     <CreateStoreWizard onStoreCreated={fetchPartnerData} disabled={!canCreateStore} />
                  </div>
                </TooltipTrigger>
                {!canCreateStore && ( <TooltipContent><p>Vous avez atteint la limite de boutiques pour votre plan.</p></TooltipContent> )}
              </Tooltip>
            </TooltipProvider>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-16">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-card-foreground mb-2">Aucune boutique de vente directe</h3>
            <p className="text-muted-foreground mb-6">Créez une boutique pour vendre vos propres produits.</p>
             <CreateStoreWizard onStoreCreated={fetchPartnerData} disabled={!canCreateStore} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store, index) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onView={() => viewStore(store.slug)}
                  onEdit={() => editStore(store.id)}
                  onDelete={() => deleteStore(store.id)}
                  onCopyLink={() => copyStoreLink(store.slug)}
                  delay={index * 0.1}
                />
              ))}
            </div>
            {totalStores > STORES_PER_PAGE && (
              <DataTablePagination
                page={currentPage}
                total={totalStores}
                perPage={STORES_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}