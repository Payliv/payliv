import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import PageLoader from '@/components/PageLoader';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Badge } from '@/components/ui/badge';
    import { DollarSign, Download, Users, Briefcase, GitFork, RefreshCw } from 'lucide-react';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import PayoutRequestDialog from '@/components/PayoutRequestDialog';

    const StatsCard = ({ title, value, icon, color, delay }) => {
      const Icon = icon;
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
          <Card className="overflow-hidden">
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${color}`}>
              <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
              <Icon className="h-5 w-5 text-white/80" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default function PartnerFinance() {
      const { user } = useAuth();
      const { toast } = useToast();
      const [loading, setLoading] = useState(true);
      const [balance, setBalance] = useState(0);
      const [transactions, setTransactions] = useState([]);
      const [payouts, setPayouts] = useState([]);
      const [stats, setStats] = useState({});
      const [showPayoutDialog, setShowPayoutDialog] = useState(false);

      const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const { data: ledgerData, error: ledgerError } = await supabase
          .from('ledgers')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (ledgerError && ledgerError.code !== 'PGRST116') {
            console.error("Error fetching ledger balance:", ledgerError);
        }
        setBalance(ledgerData?.balance || 0);
        
        const { data: partnerStats, error: statsError } = await supabase.rpc('get_partner_stats', { p_user_id: user.id });
        if (!statsError) {
          setStats(partnerStats);
        } else {
          console.error("Error fetching partner stats:", statsError);
        }

        const { data: transactionsData, error: transactionsError } = await supabase.rpc('get_partner_transactions', { p_user_id: user.id });

        if (transactionsError) {
          toast({ title: 'Erreur', description: 'Impossible de charger les transactions.', variant: 'destructive' });
        } else {
          setTransactions(transactionsData);
        }

        const { data: payoutsData, error: payoutsError } = await supabase
          .from('partner_payouts')
          .select('*')
          .eq('partner_id', user.id)
          .order('requested_at', { ascending: false });

        if (payoutsError) {
          toast({ title: 'Erreur', description: 'Impossible de charger l\'historique des paiements.', variant: 'destructive' });
        } else {
          setPayouts(payoutsData);
        }

        setLoading(false);
      }, [user, toast]);

      useEffect(() => {
        fetchData();
      }, [fetchData]);

      if (loading) return <PageLoader />;
      if (!user) return null;

      const statusBadge = (status) => {
        const colors = {
          pending: 'bg-yellow-500/20 text-yellow-500',
          sent_to_provider: 'bg-blue-500/20 text-blue-500',
          approved: 'bg-green-500/20 text-green-500',
          rejected: 'bg-red-500/20 text-red-500'
        };
        const statusText = {
          pending: 'En attente',
          sent_to_provider: 'En cours',
          approved: 'Approuvé',
          rejected: 'Rejeté'
        }
        return <Badge className={`capitalize ${colors[status] || 'bg-gray-500/20 text-gray-500'}`}>{statusText[status] || status}</Badge>;
      };
      
      const transactionTypeBadge = (type) => {
        const types = {
          sale: { label: 'Vente Directe', color: 'bg-green-500/20 text-green-500' },
          dropship_supplier: { label: 'Revenu Dropshipping', color: 'bg-sky-500/20 text-sky-500' },
          payout: { label: 'Paiement', color: 'bg-blue-500/20 text-blue-500' },
          manual_adjustment: { label: 'Ajustement Manuel', color: 'bg-purple-500/20 text-purple-500' },
        };
        const currentType = types[type] || { label: type, color: 'bg-gray-500/20 text-gray-500' };
        return <Badge className={`capitalize ${currentType.color}`}>{currentType.label}</Badge>;
      };

      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text">Finances Partenaire</h1>
              <p className="text-muted-foreground">Suivez vos revenus et gérez vos paiements.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setShowPayoutDialog(true)} disabled={balance < 100}>
                <Download className="mr-2 h-4 w-4" /> Demander un paiement
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard title="Solde disponible" value={`${balance.toLocaleString()} XOF`} icon={DollarSign} color="bg-green-600" delay={0.1} />
            <StatsCard title="Revenu Ventes Directes" value={`${(stats.total_direct_revenue || 0).toLocaleString()} XOF`} icon={Briefcase} color="bg-blue-600" delay={0.2} />
            <StatsCard title="Revenu Dropshipping" value={`${(stats.total_dropship_revenue || 0).toLocaleString()} XOF`} icon={GitFork} color="bg-purple-600" delay={0.3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Historique des Transactions</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center">Aucune transaction</TableCell></TableRow>
                    ) : transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>{format(new Date(tx.created_at), 'dd MMM yyyy', { locale: fr })}</TableCell>
                        <TableCell>{transactionTypeBadge(tx.type)}</TableCell>
                        <TableCell className={`text-right font-medium ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} XOF
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Historique des paiements</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {payouts.length === 0 ? (
                        <TableRow><TableCell colSpan={3} className="text-center">Aucun paiement demandé</TableCell></TableRow>
                    ) : payouts.map(payout => (
                      <TableRow key={payout.id}>
                        <TableCell>{format(new Date(payout.requested_at), 'dd MMM yyyy', { locale: fr })}</TableCell>
                        <TableCell>{payout.amount.toLocaleString()} XOF</TableCell>
                        <TableCell>{statusBadge(payout.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <PayoutRequestDialog 
            isOpen={showPayoutDialog}
            onOpenChange={setShowPayoutDialog}
            balance={balance}
            payoutType="partner"
            onSuccessfulRequest={fetchData}
          />
        </div>
      );
    }