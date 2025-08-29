import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Globe, Users } from 'lucide-react';
// Importer le futur composant de graphique
// import PartnerSalesChart from './PartnerSalesChart';

const PartnerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_partner_dashboard_data', { p_user_id: user.id });
        if (error) throw error;
        setData(data);
      } catch (error) {
        console.error('Error fetching partner dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div>Chargement du tableau de bord...</div>;
  if (!data) return <div>Impossible de charger les données.</div>;

  const directSales = data.direct_sales;
  const dropshipping = data.dropshipping;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Statistiques Dropshipping</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Dropshipping</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dropshipping.total_dropship_revenue} XOF</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventes Dropshipping</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{dropshipping.total_dropship_sales} articles</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nombre de Vendeurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dropshipping.total_sellers}</div>
            </CardContent>
          </Card>
        </div>
        {/* Ici on ajoutera le graphique PartnerSalesChart et la liste des ventes par pays */}
      </div>

      {directSales && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Statistiques Ventes Directes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus Ventes Directes</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{directSales.totalRevenue} XOF</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commandes Directes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{directSales.totalOrders}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDashboard;