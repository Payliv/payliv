import React, { useState, useEffect, useMemo, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { DollarSign, ShoppingBag, Users, TrendingUp, Package, CheckCircle, Truck, XCircle, WifiOff, RefreshCw } from 'lucide-react';
    import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
    import StatsCard from '@/components/StatsCard';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import PageLoader from '@/components/PageLoader';

    const renderActiveShape = (props) => {
      const RADIAN = Math.PI / 180;
      const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
      const sin = Math.sin(-RADIAN * midAngle);
      const cos = Math.cos(-RADIAN * midAngle);
      const sx = cx + (outerRadius + 10) * cos;
      const sy = cy + (outerRadius + 10) * sin;
      const mx = cx + (outerRadius + 30) * cos;
      const my = cy + (outerRadius + 30) * sin;
      const ex = mx + (cos >= 0 ? 1 : -1) * 22;
      const ey = my;
      const textAnchor = cos >= 0 ? 'start' : 'end';

      return (
        <g>
          <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
            {payload.name}
          </text>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 10}
            fill={fill}
          />
          <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-sm">{`${value} Commandes`}</text>
          <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
            {`( ${(percent * 100).toFixed(2)}% )`}
          </text>
        </g>
      );
    };
    
    const NetworkErrorDisplay = ({ onRetry }) => (
      <div className="text-center py-16">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <WifiOff className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl text-destructive">Erreur de Connexion</CardTitle>
            <CardDescription>Impossible de charger les statistiques.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Veuillez vérifier votre connexion internet. Un bloqueur de publicité pourrait aussi être la cause.
            </p>
            <Button onClick={onRetry} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );

    export default function Stats() {
      const { user } = useAuth();
      const { toast } = useToast();
      const [loading, setLoading] = useState(true);
      const [stats, setStats] = useState(null);
      const [activeIndex, setActiveIndex] = useState(0);
      const [networkError, setNetworkError] = useState(false);

      const loadStats = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setNetworkError(false);
        try {
          const { data, error } = await supabase.rpc('get_user_stats', { p_user_id: user.id });

          if (error) throw error;
          setStats(data);
        } catch (error) {
          if (error.message.includes('Failed to fetch')) {
            setNetworkError(true);
            toast({ title: 'Erreur Réseau', description: 'Impossible de charger les statistiques.', variant: 'destructive' });
          } else {
            toast({ title: 'Erreur', description: 'Une erreur est survenue lors du chargement des statistiques.', variant: 'destructive' });
            console.error(error);
          }
        } finally {
          setLoading(false);
        }
      }, [user, toast]);

      useEffect(() => {
        loadStats();
      }, [loadStats]);

      const onPieEnter = (_, index) => {
        setActiveIndex(index);
      };

      const statusConfig = useMemo(() => ({
        pending: { name: 'En attente', color: 'hsl(var(--primary))', icon: Package },
        confirmed: { name: 'Confirmée', color: 'hsl(var(--secondary))', icon: CheckCircle },
        shipped: { name: 'Expédiée', color: 'hsl(var(--info))', icon: Truck },
        delivered: { name: 'Livrée', color: 'hsl(var(--success))', icon: CheckCircle },
        cancelled: { name: 'Annulée', color: 'hsl(var(--destructive))', icon: XCircle },
      }), []);

      const orderStatusData = useMemo(() => {
        if (!stats?.orderStatusDistribution) return [];
        return stats.orderStatusDistribution.map(item => ({
          name: statusConfig[item.status]?.name || item.status,
          value: item.count,
          color: statusConfig[item.status]?.color || '#8884d8',
        }));
      }, [stats, statusConfig]);

      if (loading) return <PageLoader />;
      if (networkError) return <NetworkErrorDisplay onRetry={loadStats} />;

      if (!stats || stats.totalOrders === 0) {
        return (
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold gradient-text mb-2">Statistiques</h1>
            <p className="text-muted-foreground mb-8">Analysez les performances de vos boutiques.</p>
            <div className="bg-card border border-border rounded-xl p-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground">Aucune donnée à afficher</h3>
              <p className="text-muted-foreground mt-2">Commencez par recevoir des commandes pour voir vos statistiques ici.</p>
            </div>
          </div>
        );
      }

      return (
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-2">Statistiques</h1>
            <p className="text-muted-foreground">Analysez les performances de vos boutiques.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Revenu Total (Livré)" value={`${stats.totalRevenue.toLocaleString()} CFA`} icon={DollarSign} color="from-green-500 to-emerald-500" delay={0.1} />
            <StatsCard title="Commandes Totales" value={stats.totalOrders} icon={ShoppingBag} color="from-blue-500 to-cyan-500" delay={0.2} />
            <StatsCard title="Clients Uniques" value={stats.totalCustomers} icon={Users} color="from-orange-500 to-red-500" delay={0.3} />
            <StatsCard title="Panier Moyen (Livré)" value={`${stats.averageOrderValue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})} CFA`} icon={TrendingUp} color="from-purple-500 to-pink-500" delay={0.4} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-3">
              <Card className="glass-effect h-full">
                <CardHeader>
                  <CardTitle>Revenus par Boutique</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.salesByStore} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                      <Tooltip cursor={{fill: 'hsl(var(--muted-foreground) / 0.2)'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem'}}/>
                      <Legend />
                      <Bar dataKey="revenue" name="Revenu" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2">
              <Card className="glass-effect h-full">
                <CardHeader>
                  <CardTitle>Répartition des Commandes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        dataKey="value"
                        onMouseEnter={onPieEnter}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Meilleures Ventes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.bestSellingProducts.map((product, index) => (
                    <div key={product.name} className="flex flex-wrap justify-between items-center text-sm gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="font-medium text-foreground">{index + 1}. {product.name}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-muted-foreground">{product.quantity} vendus</span>
                        <span className="font-semibold text-secondary">{product.revenue.toLocaleString()} CFA</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }