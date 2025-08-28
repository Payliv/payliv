import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/DataTablePagination';

const ITEMS_PER_PAGE = 10;

export default function SuperAdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_all_payments_paginated', {
      p_page: page,
      p_page_size: ITEMS_PER_PAGE
    });

    if (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les paiements.",
        variant: "destructive",
      });
      console.error("Error fetching payments:", error);
      setPayments([]);
    } else {
      setPayments(data || []);
      setTotalPayments(data?.[0]?.total_count || 0);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filteredPayments = payments.filter(payment => {
    const search = searchTerm.toLowerCase();
    return (
      (payment.profile_name && payment.profile_name.toLowerCase().includes(search)) ||
      (payment.profile_email && payment.profile_email.toLowerCase().includes(search)) ||
      (payment.plan_name && payment.plan_name.toLowerCase().includes(search)) ||
      (payment.provider_transaction_id && payment.provider_transaction_id.toLowerCase().includes(search))
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status, transactionId) => {
    if (transactionId && transactionId.startsWith('manual_promo')) {
      return <Badge className="bg-yellow-400 text-black hover:bg-yellow-500">Promotion Manuelle</Badge>;
    }
    if (status === 'active') {
      return <Badge variant="success">Actif</Badge>;
    }
    return <Badge variant="destructive">Inactif</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2 flex items-center">
          <DollarSign className="w-8 h-8 mr-3" />
          Gestion des Paiements
        </h1>
        <p className="text-muted-foreground">
          Consultez l'historique de tous les abonnements et transactions.
        </p>
      </motion.div>

      <Card className="glass-effect border-border text-foreground">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher (nom, email, plan, ID...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-input border-border text-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div>
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-4 text-sm font-semibold text-foreground">Utilisateur</th>
                      <th className="p-4 text-sm font-semibold text-foreground">Formule</th>
                      <th className="p-4 text-sm font-semibold text-foreground">Montant</th>
                      <th className="p-4 text-sm font-semibold text-foreground">Statut</th>
                      <th className="p-4 text-sm font-semibold text-foreground">Date</th>
                      <th className="p-4 text-sm font-semibold text-foreground">ID Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-foreground">{payment.profile_name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{payment.profile_email}</div>
                        </td>
                        <td className="p-4 text-foreground">{payment.plan_name || 'N/A'}</td>
                        <td className="p-4 text-foreground font-medium">
                          {payment.plan_price?.toLocaleString()} {payment.plan_currency || 'XOF'}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(payment.status, payment.provider_transaction_id)}
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">{formatDate(payment.created_at)}</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{payment.provider_transaction_id}</td>
                      </tr>
                    )) : (
                       <tr>
                         <td colSpan="6" className="text-center p-8 text-muted-foreground">Aucun paiement trouvé.</td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden space-y-4">
                {filteredPayments.length > 0 ? filteredPayments.map((payment) => (
                  <div key={payment.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                    <div>
                      <div className="font-bold text-foreground">{payment.profile_name || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{payment.profile_email}</div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Formule:</span>
                      <span className="font-medium text-foreground">{payment.plan_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Montant:</span>
                      <span className="font-medium text-foreground">{payment.plan_price?.toLocaleString()} {payment.plan_currency || 'XOF'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Statut:</span>
                      {getStatusBadge(payment.status, payment.provider_transaction_id)}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="text-foreground">{formatDate(payment.created_at)}</span>
                    </div>
                    <div className="text-sm pt-2 border-t border-border">
                      <div className="text-muted-foreground">ID Transaction:</div>
                      <div className="font-mono text-xs text-foreground break-all">{payment.provider_transaction_id}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center p-8 text-muted-foreground">Aucun paiement trouvé.</div>
                )}
              </div>
              <DataTablePagination page={page} total={totalPayments} perPage={ITEMS_PER_PAGE} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}