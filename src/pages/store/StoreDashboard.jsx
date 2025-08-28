import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, CheckCircle, ShoppingBag, Users, TrendingUp, AlertTriangle, Package, BarChart, ShieldOff, Sparkles } from 'lucide-react';
import PageLoader from '@/components/PageLoader';
import StatsCard from '@/components/StatsCard';
import SalesChart from '@/components/store/SalesChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function StoreDashboard() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { isSubscriptionActive, loadingProfile } = useProfile();
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchStoreAndStats = async () => {
    setLoading(true);
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError) {
      toast({ title: "Erreur", description: "Impossible de charger les informations de la boutique.", variant: "destructive" });
      navigate('/stores');
      return;
    }
    setStore(storeData);

    const { data: statsData, error: statsError } = await supabase
      .rpc('get_store_dashboard_data', { p_store_id: storeId });

    if (statsError) {
      console.error("Error fetching store stats:", statsError);
      toast({ title: "Erreur", description: "Impossible de charger les statistiques de la boutique.", variant: "destructive" });
    } else {
      setStats(statsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!loadingProfile) {
      fetchStoreAndStats();
    }
  }, [storeId, loadingProfile]);

  const handlePublish = async () => {
    if (store.store_type === 'physical' && !isSubscriptionActive) {
      toast({
        title: "Abonnement Requis",
        description: "Vous devez avoir un abonnement actif pour publier une boutique de produits physiques.",
        variant: "destructive",
      });
      navigate('/pricing');
      return;
    }

    setIsPublishing(true);
    const { error } = await supabase.rpc('publish_store', { p_store_id: storeId });
    
    if (error) {
      toast({
        title: "Erreur de Publication",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Félicitations ! 🚀",
        description: "Votre boutique est maintenant en ligne et visible par tous.",
      });
      await fetchStoreAndStats();
    }
    setIsPublishing(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return <Badge variant="success">Payée</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'shipped':
        return <Badge variant="outline">Expédiée</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading || loadingProfile) {
    return <PageLoader />;
  }

  if (!store) {
    return <div>Boutique non trouvée.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
        <p className="text-muted-foreground">Tableau de bord de votre boutique.</p>
      </div>

      {store.status === 'suspended' && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <div className="flex items-center gap-4">
              <ShieldOff className="w-8 h-8 text-destructive" />
              <div>
                <CardTitle>Boutique Suspendue</CardTitle>
                <CardDescription>
                  Votre abonnement a expiré. Cette boutique est temporairement inaccessible au public.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/pricing')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Se réabonner pour réactiver
            </Button>
          </CardContent>
        </Card>
      )}

      {store.status === 'draft' && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardHeader>
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div>
                <CardTitle>Votre boutique est un brouillon</CardTitle>
                <CardDescription>
                  Elle n'est pas encore visible par le public. Mettez-la en ligne pour commencer à vendre.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handlePublish} disabled={isPublishing}>
              <Rocket className="mr-2 h-4 w-4" />
              {isPublishing ? 'Publication en cours...' : 'Mettre en ligne ma boutique'}
            </Button>
          </CardContent>
        </Card>
      )}

      {store.status === 'published' && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardHeader>
            <div className="flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <CardTitle>Votre boutique est en ligne !</CardTitle>
                <CardDescription>
                  Félicitations ! Votre boutique est visible par tous et prête à recevoir des commandes.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
           <CardContent>
            <Button asChild variant="outline">
              <a href={`/s/${store.slug}`} target="_blank" rel="noopener noreferrer">
                Voir ma boutique en ligne
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Chiffre d'affaires" value={`${stats?.totalRevenue?.toLocaleString() ?? 0} XOF`} icon={TrendingUp} color="from-green-500 to-emerald-500" />
        <StatsCard title="Commandes" value={stats?.totalOrders ?? 0} icon={ShoppingBag} color="from-blue-500 to-cyan-500" />
        <StatsCard title="Clients" value={stats?.totalCustomers ?? 0} icon={Users} color="from-purple-500 to-pink-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SalesChart data={stats?.salesOverTime || []} />
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Produits Populaires</CardTitle>
              <CardDescription>Vos articles les plus vendus.</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Ventes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topProducts.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right">{p.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Package className="mx-auto h-12 w-12" />
                  <p className="mt-4">Aucune vente enregistrée pour le moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commandes Récentes</CardTitle>
          <CardDescription>Les 5 dernières commandes passées sur votre boutique.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{getStatusBadge(o.status)}</TableCell>
                    <TableCell className="text-right">{o.total.toLocaleString()} XOF</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingBag className="mx-auto h-12 w-12" />
              <p className="mt-4">Aucune commande pour le moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}