import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PartnerFinance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payout modal state
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('mobile_money');
  const [payoutDetails, setPayoutDetails] = useState('');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('ledgers')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      if (ledgerError && ledgerError.code !== 'PGRST116') throw ledgerError;
      setBalance(ledgerData?.balance || 0);

      const { data: txData, error: txError } = await supabase.rpc('get_partner_transactions', { p_user_id: user.id });
      if (txError) throw txError;
      setTransactions(txData || []);

      const { data: payoutData, error: payoutError } = await supabase
        .from('partner_payouts')
        .select('*')
        .eq('partner_id', user.id)
        .order('requested_at', { ascending: false });
      if (payoutError) throw payoutError;
      setPayouts(payoutData || []);

    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRequestPayout = async () => {
    try {
        const amount = parseFloat(payoutAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ title: "Montant invalide", variant: "destructive" });
            return;
        }
        const { error } = await supabase.rpc('request_partner_payout', {
            p_amount: amount,
            p_method: payoutMethod,
            p_details: { number: payoutDetails }
        });
        if (error) throw error;
        toast({ title: "Demande de paiement envoyée !" });
        setPayoutAmount('');
        setPayoutDetails('');
        fetchData(); // Refresh data
    } catch (error: any) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  if (loading) return <div>Chargement des finances...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Mon Solde Disponible</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Demander un paiement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Demander un paiement</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Montant</Label>
                  <Input id="amount" type="number" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="details" className="text-right">Numéro</Label>
                  <Input id="details" placeholder="Numéro Mobile Money" value={payoutDetails} onChange={e => setPayoutDetails(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleRequestPayout}>Envoyer la demande</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{balance.toFixed(2)} XOF</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historique des Transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount} XOF</TableCell>
                  <TableCell>{tx.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader><CardTitle>Historique des Paiements</CardTitle></CardHeader>
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
              {payouts.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{new Date(p.requested_at).toLocaleString()}</TableCell>
                  <TableCell>{p.amount} XOF</TableCell>
                  <TableCell>{p.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerFinance;