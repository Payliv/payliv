import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
    import { MoreHorizontal, Loader2, AlertCircle, RefreshCw, XCircle, FileText, CheckCircle, Ban, Eye } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { DataTablePagination } from '@/components/DataTablePagination';
    import UpdatePayoutStatusDialog from '@/components/superadmin/payouts/UpdatePayoutStatusDialog';
    import PayoutDetailsDialog from '@/components/superadmin/payouts/PayoutDetailsDialog';

    const PayoutStatusBadge = ({ status }) => {
      const variants = {
        pending: 'default',
        sent_to_provider: 'secondary',
        approved: 'success',
        rejected: 'destructive',
      };
      const text = {
        pending: 'En attente',
        sent_to_provider: 'En cours',
        approved: 'Approuvé',
        rejected: 'Rejeté',
      };
      return <Badge variant={variants[status] || 'outline'}>{text[status] || status}</Badge>;
    };

    const SuperAdminPayouts = () => {
      const [payouts, setPayouts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [page, setPage] = useState(1);
      const [pageSize] = useState(10);
      const [totalCount, setTotalCount] = useState(0);
      const { toast } = useToast();
      const navigate = useNavigate();
      
      const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
      const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
      const [selectedPayout, setSelectedPayout] = useState(null);
      const [updateAction, setUpdateAction] = useState(null);

      const fetchPayouts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error } = await supabase.rpc('get_all_payouts_unified', {
            p_page_size: pageSize,
            p_page: page,
          });

          if (error) throw error;
          
          setPayouts(data || []);
          if (data && data.length > 0) {
            setTotalCount(data[0].total_count);
          } else {
            setTotalCount(0);
          }
        } catch (err) {
          setError(err.message);
          toast({ title: 'Erreur', description: "Impossible de charger les demandes de paiement.", variant: 'destructive' });
        } finally {
          setLoading(false);
        }
      }, [page, pageSize, toast]);

      useEffect(() => {
        fetchPayouts();
      }, [fetchPayouts]);
      
      useEffect(() => {
        if (!isUpdateDialogOpen && !isDetailsDialogOpen) {
          setSelectedPayout(null);
          setUpdateAction(null);
        }
      }, [isUpdateDialogOpen, isDetailsDialogOpen]);

      const openUpdateDialog = (payout, action) => {
        setSelectedPayout(payout);
        setUpdateAction(action);
        setIsUpdateDialogOpen(true);
      };

      const openDetailsDialog = (payout) => {
        setSelectedPayout(payout);
        setIsDetailsDialogOpen(true);
      };

      const handleAction = async (action, payout) => {
        try {
          let rpcName;
          let params = { p_payout_id: payout.payout_id, p_table_name: payout.table_name };
          let successMessage = '';

          if (action === 'retry') {
            rpcName = 'retry_payout';
            successMessage = 'La demande de paiement a été relancée.';
          } else if (action === 'cancel') {
            rpcName = 'cancel_payout';
            successMessage = 'La demande de paiement a été annulée.';
          } else if (action === 'process') {
            const { error: functionError } = await supabase.functions.invoke('automated-payout-handler', {
              body: { payout_id: payout.payout_id, table_name: payout.table_name }
            });
            if (functionError) throw new Error(functionError.message);
            successMessage = 'Le traitement automatique a été initié.';
            toast({ title: 'Succès', description: successMessage });
            fetchPayouts();
            return;
          }

          if (rpcName) {
            const { error } = await supabase.rpc(rpcName, params);
            if (error) throw error;
            toast({ title: 'Succès', description: successMessage });
            fetchPayouts();
          }
        } catch (err) {
          toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
        }
      };

      return (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Paiements</CardTitle>
                <CardDescription>Supervisez et gérez toutes les demandes de paiement des partenaires et affiliés.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
                {error && (
                  <div className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>Erreur: {error}</p>
                  </div>
                )}
                {!loading && !error && (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payouts.map((payout) => (
                            <TableRow key={payout.payout_id}>
                              <TableCell>
                                <div className="font-medium">{payout.user_name}</div>
                                <div className="text-xs text-muted-foreground">{payout.user_email}</div>
                              </TableCell>
                              <TableCell>{payout.payout_type}</TableCell>
                              <TableCell>{payout.amount.toLocaleString()} FCFA</TableCell>
                              <TableCell><PayoutStatusBadge status={payout.status} /></TableCell>
                              <TableCell>{new Date(payout.requested_at).toLocaleString('fr-FR')}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Ouvrir le menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openDetailsDialog(payout)}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Voir les détails
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => openUpdateDialog(payout, 'approve')}>
                                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                      Approuver Manuellement
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openUpdateDialog(payout, 'reject')}>
                                      <Ban className="mr-2 h-4 w-4 text-red-500" />
                                      Rejeter Manuellement
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate(`/superadmin/payout-logs?payout_id=${payout.payout_id}`)}>
                                      <FileText className="mr-2 h-4 w-4" />
                                      Voir les logs
                                    </DropdownMenuItem>
                                    {payout.status === 'pending' && (
                                      <DropdownMenuItem onClick={() => handleAction('process', payout)}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Traiter via API
                                      </DropdownMenuItem>
                                    )}
                                    {payout.status === 'rejected' && (
                                      <DropdownMenuItem onClick={() => handleAction('retry', payout)}>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Relancer
                                      </DropdownMenuItem>
                                    )}
                                    {payout.status === 'pending' && (
                                      <DropdownMenuItem onClick={() => handleAction('cancel', payout)} className="text-destructive">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Annuler
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <DataTablePagination
                      page={page}
                      total={totalCount}
                      perPage={pageSize}
                      onPageChange={setPage}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <UpdatePayoutStatusDialog
            isOpen={isUpdateDialogOpen}
            onOpenChange={setIsUpdateDialogOpen}
            payout={selectedPayout}
            action={updateAction}
            onSuccess={fetchPayouts}
          />
          <PayoutDetailsDialog
            isOpen={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            payout={selectedPayout}
          />
        </>
      );
    };

    export default SuperAdminPayouts;