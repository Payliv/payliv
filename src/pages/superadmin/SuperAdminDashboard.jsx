import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Store, ShoppingCart, DollarSign, Wallet } from 'lucide-react';
import { cn, getStatusColor } from '@/lib/utils'; // Assuming getStatusColor is in utils

const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
  <Card className="shadow-lg glass-card flex flex-col justify-between h-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {Icon && <Icon className={cn("h-4 w-4 text-muted-foreground", colorClass)} />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">Données récentes</p>
    </CardContent>
  </Card>
);

const RecentActivityItem = ({ item }) => {
  const Icon = item.type === 'new_user' ? Users : Store;
  const label = item.type === 'new_user' ? 'Nouvel utilisateur' : 'Nouvelle boutique';
  const detail = item.type === 'new_user' ? item.detail : `${item.detail} (propriétaire)`;

  return (
    <div className="flex items-center space-x-3 py-2 border-b last:border-b-0 border-border">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <p className="text-sm font-medium">{label}: {item.name}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
        <p className="text-xs text-muted-foreground">{format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}</p>
      </div>
    </div>
  );
};

const COLORS = ['#FBBF24', '#10B981', '#6366F1', '#EF4444', '#3B82F6', '#EC4899'];

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: rpcError } = await supabase.rpc('get_superadmin_dashboard_data');
        if (rpcError) {
          throw rpcError;
        }
        setStats(data);
      } catch (err) {
        console.error('Erreur lors du chargement des données du tableau de bord admin:', err);
        setError(err);
        toast({
          title: "Erreur",
          description: err.message || "Impossible de charger les données du tableau de bord.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return <p>Chargement du tableau de bord...</p>;
  }

  if (error) {
    return <p className="text-destructive">Erreur: {error.message}</p>;
  }

  const salesDataForChart = stats.planDistribution.map(plan => ({
    name: plan.name,
    value: plan.count
  }));

  const mrrFormatted = stats.mrr?.toLocaleString(undefined, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const totalSubscriptionRevenueFormatted = stats.totalSubscriptionRevenue?.toLocaleString(undefined, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const pendingPayoutsAmountFormatted = stats.pendingPayoutsAmount?.toLocaleString(undefined, { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <HelmetProvider>
      <Helmet>
        <title>Tableau de Bord Super Admin - PayLiv</title>
        <meta name="description" content="Tableau de bord administrateur pour gérer PayLiv." />
        <meta property="og:title" content="Tableau de Bord Super Admin - PayLiv" />
        <meta property="og:description" content="Tableau de bord administrateur pour gérer PayLiv." />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Super Admin</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard title="Utilisateurs Total" value={stats.totalUsers} icon={Users} colorClass="text-blue-500" />
          <StatsCard title="Boutiques Total" value={stats.totalStores} icon={Store} colorClass="text-green-500" />
          <StatsCard title="Commandes Total" value={stats.totalOrders} icon={ShoppingCart} colorClass="text-yellow-500" />
          <StatsCard title="Revenu Abonnements (Actifs)" value={totalSubscriptionRevenueFormatted} icon={DollarSign} colorClass="text-purple-500" />
          <StatsCard title="Revenu Mensuel Récurrent (MRR)" value={mrrFormatted} icon={BarChart} colorClass="text-indigo-500" />
          <StatsCard title="Retraits en Attente" value={pendingPayoutsAmountFormatted} icon={Wallet} colorClass="text-red-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg glass-card">
            <CardHeader><CardTitle className="text-xl font-semibold">Activité Récente</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((item, index) => (
                    <RecentActivityItem key={index} item={item} />
                  ))
                ) : (
                  <p className="text-muted-foreground">Aucune activité récente.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg glass-card">
            <CardHeader><CardTitle className="text-xl font-semibold">Distribution des Plans d'Abonnement</CardTitle></CardHeader>
            <CardContent>
              {salesDataForChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesDataForChart}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {salesDataForChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} abonnés`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center">Aucune donnée de distribution de plan disponible.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </HelmetProvider>
  );
};

export default SuperAdminDashboard;
