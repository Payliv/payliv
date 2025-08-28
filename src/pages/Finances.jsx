import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Banknote, History, Download, Loader2 } from 'lucide-react';
import PageLoader from '@/components/PageLoader';
import PayoutRequestDialog from '@/components/PayoutRequestDialog';
import { Helmet } from 'react-helmet-async';

export default function Finances() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ balance: 0, totalRevenue: 0, pendingPayouts: 0 });
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: ledgerData, error: ledgerError } = await supabase
      .from('ledgers')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    if (ledgerError && ledgerError.code !== 'PGRST116') {
      toast({ title: 'Erreur', description: 'Impossible de charger votre solde.', variant: 'destructive' });
    }

    const { data: transactionsData, error: transactionsError } = await supabase
      .rpc('get_partner_transactions', { p_user_id: user.id });
    if (transactionsError) {
      toast({ title: 'Erreur', description: 'Impossible de charger les transactions.', variant: 'destructive' });
    }

    const { data: payoutsData, error: payoutsError } = await supabase
      .from('partner_payouts')
      .select('*')
      .eq('partner_id', user.id)
      .order('requested_at', { ascending: false });
    if (payoutsError) {
      toast({ title: 'Erreur', description: 'Impossible de charger les demandes de retrait.', variant: 'destructive' });
    }

    const totalRevenue = transactionsData?.filter(t => (t.type === 'sale' || t.type === 'dropship_seller') && t.status === 'completed').reduce((acc, t) => acc + (t.seller_net || t.supplier_net || 0), 0) || 0;
    const pendingPayouts = payoutsData?.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0) || 0;

    setStats({
      balance: ledgerData?.balance || 0,
      totalRevenue,
      pendingPayouts,
    });
    setTransactions(transactionsData || []);
    setPayouts(payoutsData || []);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'secondary',
      approved: 'success',
      rejected: 'destructive',
      sent_to_provider: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Mes Finances - PayLiv</title>
        <meta name="description" content="Gérez vos finances, consultez votre solde, vos transactions et demandez des retraits sur PayLiv." />
      </Helmet>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Mes Finances</h1>
          <p className="text-muted-foreground">Votre aperçu financier global sur la plateforme.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Solde Disponible</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.balance.toLocaleString()} XOF</div><p className="text-xs text-muted-foreground">Montant que vous pouvez retirer.</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Revenu Total</CardTitle><History className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} XOF</div><p className="text-xs text-muted-foreground">Total des gains nets sur la plateforme.</p></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Retraits en Attente</CardTitle><Banknote className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.pendingPayouts.toLocaleString()} XOF</div><p className="text-xs text-muted-foreground">Montant total de vos demandes de retrait.</p></CardContent></Card>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Demandes de Retrait</CardTitle>
                  <CardDescription>Historique de vos demandes de retrait.</CardDescription>
                </div>
                <Button onClick={() => setIsPayoutDialogOpen(true)} disabled={stats.balance <= 0}>
                  <Banknote className="w-4 h-4 mr-2" /> Demander un retrait
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Montant</TableHead><TableHead>Méthode</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {payouts.length > 0 ? payouts.map(p => (
                      <TableRow key={p.id}><TableCell>{new Date(p.requested_at).toLocaleDateString('fr-FR')}</TableCell><TableCell>{p.amount.toLocaleString()} XOF</TableCell><TableCell>{p.payout_method}</TableCell><TableCell>{getStatusBadge(p.status)}</TableCell></TableRow>
                    )) : <TableRow><TableCell colSpan="4" className="text-center h-24">Aucune demande de retrait.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Transactions Récentes</CardTitle>
              <CardDescription>Les 10 dernières transactions sur votre compte.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Boutique</TableHead><TableHead>Montant Net</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map(tx => (
                      <TableRow key={tx.id}><TableCell>{new Date(tx.created_at).toLocaleDateString('fr-FR')}</TableCell><TableCell>{tx.type}</TableCell><TableCell>{tx.store_name}</TableCell><TableCell className="font-medium text-green-500">{(tx.seller_net || tx.supplier_net || tx.amount).toLocaleString()} XOF</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <PayoutRequestDialog isOpen={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen} balance={stats.balance} onPayoutRequested={fetchData} />
    </>
  );
}