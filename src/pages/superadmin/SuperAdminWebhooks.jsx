import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, RefreshCw, AlertCircle } from 'lucide-react';
import PageLoader from '@/components/PageLoader';
import { DataTablePagination } from '@/components/DataTablePagination';

const getStatusVariant = (status) => {
  switch (status) {
    case 'processed':
      return 'success';
    case 'error':
      return 'destructive';
    case 'received':
    default:
      return 'secondary';
  }
};

const WebhookLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('webhook_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setLogs(data);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching webhook logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const pageCount = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Logs des Webhooks</h1>
        <Button onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Événements Récents des Fournisseurs de Paiement</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <PageLoader />}
          {error && (
            <div className="text-center py-8 text-destructive flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8" />
              <p>Erreur lors du chargement des logs: {error}</p>
            </div>
          )}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>ID Commande</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}</TableCell>
                          <TableCell>{log.provider}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
                          </TableCell>
                          <TableCell>{log.related_order_id || 'N/A'}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Payload du Webhook</DialogTitle>
                                </DialogHeader>
                                <pre className="mt-2 w-full overflow-auto rounded-md bg-muted p-4 text-sm max-h-[60vh]">
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Aucun log de webhook trouvé.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {pageCount > 1 && (
                <div className="mt-4">
                  <DataTablePagination
                    page={page}
                    pageCount={pageCount}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookLogs;