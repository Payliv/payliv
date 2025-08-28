import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search, ArrowRightLeft, Loader2, ArrowDownUp, WrapText as ReceiptText, User, Store, ShoppingCart, Percent, Repeat, Edit, ArrowUpCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/DataTablePagination';

const ITEMS_PER_PAGE = 15;

const TRANSACTION_TYPE_DETAILS = {
  sale: { label: 'Vente Directe', icon: <ShoppingCart className="h-4 w-4" />, color: 'bg-blue-500' },
  dropship_supplier: { label: 'Revenu Fournisseur', icon: <ArrowDownUp className="h-4 w-4" />, color: 'bg-green-500' },
  dropship_seller: { label: 'Commission Vendeur', icon: <Percent className="h-4 w-4" />, color: 'bg-purple-500' },
  subscription: { label: 'Abonnement', icon: <Repeat className="h-4 w-4" />, color: 'bg-indigo-500' },
  manual_adjustment: { label: 'Ajustement Manuel', icon: <Edit className="h-4 w-4" />, color: 'bg-yellow-500 text-black' },
  payout: { label: 'Retrait', icon: <ArrowUpCircle className="h-4 w-4" />, color: 'bg-red-500' },
  default: { label: 'Transaction', icon: <ArrowRightLeft className="h-4 w-4" />, color: 'bg-gray-500' },
};

const getTransactionTypeDetails = (type) => {
  return TRANSACTION_TYPE_DETAILS[type] || TRANSACTION_TYPE_DETAILS.default;
};

const TransactionRow = ({ transaction }) => {
  const { label, icon, color } = getTransactionTypeDetails(transaction.type);
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <motion.div 
      className="border border-border rounded-lg p-4 space-y-3 bg-card/50 transition-colors hover:bg-muted/50"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
           <span className={`p-2 rounded-full ${color}`}>{React.cloneElement(icon, { className: 'h-4 w-4 text-white' })}</span>
           <div>
              <div className="font-bold text-foreground">{label}</div>
              <div className="text-sm text-muted-foreground font-mono">{transaction.id.substring(0,8)}</div>
           </div>
        </div>
        <div className="text-right">
            <div className="font-bold text-lg text-foreground">{transaction.amount.toLocaleString()} XOF</div>
            <div className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground space-y-1 pl-12">
        {transaction.store_name && <div className="flex items-center gap-2"><Store className="h-4 w-4" /> Boutique: <span className="font-medium text-foreground">{transaction.store_name}</span></div>}
        {transaction.customer_name && <div className="flex items-center gap-2"><User className="h-4 w-4" /> Client: <span className="font-medium text-foreground">{transaction.customer_name}</span></div>}
        {transaction.provider_transaction_id && <div className="flex items-center gap-2"><ReceiptText className="h-4 w-4" /> Réf. Fournisseur: <span className="font-mono text-xs text-foreground">{transaction.provider_transaction_id}</span></div>}
      </div>
      <div className="pl-12 pt-2">
        <Badge variant={transaction.status === 'completed' ? 'success' : 'destructive'}>{transaction.status}</Badge>
      </div>
    </motion.div>
  );
};

export default function SuperAdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_all_transactions_paginated', {
      p_page: page,
      p_page_size: ITEMS_PER_PAGE
    });

    if (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les transactions.",
        variant: "destructive",
      });
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } else {
      setTransactions(data || []);
      setTotalTransactions(data?.[0]?.total_count || 0);
    }
    setLoading(false);
  }, [page, toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2 flex items-center">
          <ArrowRightLeft className="w-8 h-8 mr-3" />
          Toutes les Transactions
        </h1>
        <p className="text-muted-foreground">
          Consultez l'historique de toutes les transactions financières sur la plateforme.
        </p>
      </motion.div>

      <Card className="glass-effect border-border text-foreground">
        <CardHeader>
           <CardTitle>Historique des transactions</CardTitle>
           <CardDescription>Liste de toutes les transactions, y compris les ventes, commissions et retraits.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">Aucune transaction trouvée.</div>
                )}
              </div>
              <DataTablePagination page={page} total={totalTransactions} perPage={ITEMS_PER_PAGE} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}