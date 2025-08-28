import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import PageLoader from '@/components/PageLoader';
import StatsCard from '@/components/StatsCard';
import { DollarSign, Banknote, History, Download, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function StoreFinance() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ balance: 0, totalRevenue: 0, storeName: '' });
  const [transactions, setTransactions] = useState([]);
  
  const getCurrencySymbol = (currency = 'XOF') => {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'XOF': return 'CFA';
      default: return currency;
    }
  };

  const fetchData = useCallback(async () => {
    if (!user || !storeId) return;
    setLoading(true);

    const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('name')
        .eq('id', storeId)
        .single();
    if(storeError) {
        toast({ title: 'Erreur', description: 'Boutique introuvable.', variant: 'destructive' });
        navigate('/stores');
        return;
    }
    
    const { data: ledgerData, error: ledgerError } = await supabase
        .from('ledgers')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

    if (ledgerError && ledgerError.code !== 'PGRST116') {
        toast({ title: 'Erreur', description: 'Impossible de charger votre solde.', variant: 'destructive' });
    }

    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*, orders(customer)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (transactionsError) {
      toast({ title: 'Erreur', description: 'Impossible de charger les transactions.', variant: 'destructive' });
    } else {
      setTransactions(transactionsData || []);
    }
    
    const totalRevenue = transactionsData
        ?.filter(t => t.type === 'sale' && t.status === 'completed')
        .reduce((acc, t) => acc + (t.seller_net || t.amount || 0), 0) || 0;

    setStats({
        balance: ledgerData?.balance || 0,
        totalRevenue: totalRevenue,
        storeName: storeData.name
    });

    setLoading(false);
  }, [user, storeId, toast, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const getTypeBadge = (type) => {
    const types = {
        sale: { label: 'Vente', variant: 'success' },
        payout: { label: 'Paiement', variant: 'info' },
        refund: { label: 'Remboursement', variant: 'warning' },
        dropship_seller: { label: 'Commission Dropshipping', variant: 'default' },
    };
    const currentType = types[type] || { label: type, variant: 'secondary' };
    return <Badge variant={currentType.variant}>{currentType.label}</Badge>;
  };

  const handleRequestPayout = () => {
    navigate('/finances');
  };

  if (loading) return <PageLoader />;

  const currencySymbol = getCurrencySymbol(transactions[0]?.currency);

  return (
    <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/finances" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="h-4 w-4" />
                Retour aux finances globales
            </Link>
            <h1 className="text-3xl font-bold">Finances de la boutique: <span className="gradient-text">{stats.storeName}</span></h1>
            <p className="text-muted-foreground">Suivez les revenus et transactions spécifiques à cette boutique.</p>
        </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Solde total du compte"
          value={`${stats.balance.toLocaleString()} ${currencySymbol}`}
          icon={DollarSign}
          color="from-green-500 to-emerald-500"
          description="Votre solde disponible sur toutes vos activités."
        />
        <StatsCard
          title="Revenu net (cette boutique)"
          value={`${stats.totalRevenue.toLocaleString()} ${currencySymbol}`}
          icon={History}
          color="from-blue-500 to-sky-500"
          description="Revenu net généré uniquement par cette boutique."
        />
        <Card className="flex flex-col justify-center items-start p-6 bg-card border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Demander un paiement</h3>
            <p className="text-muted-foreground text-sm mb-4">Retirez votre solde disponible via le portail financier global.</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled={stats.balance <= 0} onClick={handleRequestPayout}>
                    <Banknote className="w-4 h-4 mr-2" /> Gérer les retraits
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Les retraits sont gérés dans votre espace Finances global.</p>
              </TooltipContent>
            </Tooltip>
        </Card>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Historique des Transactions</CardTitle>
                    <CardDescription>Toutes les transactions financières de cette boutique.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Bientôt disponible" })}>
                    <Download className="w-4 h-4 mr-2" /> Exporter
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant Total</TableHead>
                    <TableHead>Frais</TableHead>
                    <TableHead>Montant Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.created_at).toLocaleString('fr-FR')}</TableCell>
                        <TableCell>{getTypeBadge(tx.type)}</TableCell>
                        <TableCell>{tx.orders?.customer?.name || 'N/A'}</TableCell>
                        <TableCell className="font-medium">{tx.amount.toLocaleString()} {currencySymbol}</TableCell>
                        <TableCell className="text-red-500">-{tx.platform_fee?.toLocaleString() || 0} {currencySymbol}</TableCell>
                        <TableCell className="font-semibold text-green-500">{(tx.seller_net || tx.amount).toLocaleString()} {currencySymbol}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">Aucune transaction trouvée.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}