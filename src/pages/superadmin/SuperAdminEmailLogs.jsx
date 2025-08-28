
    import React, { useState, useEffect, useCallback } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Badge } from '@/components/ui/badge';
    import { Button } from '@/components/ui/button';
    import { Loader2, RefreshCw, AlertCircle, CheckCircle, MailWarning } from 'lucide-react';
    import { format } from 'date-fns';
    import { fr } from 'date-fns/locale';

    const PAGE_SIZE = 15;

    export default function SuperAdminEmailLogs() {
      const [logs, setLogs] = useState([]);
      const [loading, setLoading] = useState(true);
      const [page, setPage] = useState(0);
      const [hasMore, setHasMore] = useState(true);
      const { toast } = useToast();

      const fetchLogs = useCallback(async (isNewFetch = false) => {
        setLoading(true);
        const from = isNewFetch ? 0 : page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await supabase
          .from('email_logs')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          toast({
            title: 'Erreur',
            description: 'Impossible de charger les journaux d\'e-mails.',
            variant: 'destructive',
          });
          setLogs([]);
        } else {
          if (isNewFetch) {
            setLogs(data);
          } else {
            setLogs(prevLogs => [...prevLogs, ...data]);
          }
          setHasMore(data.length === PAGE_SIZE);
        }
        setLoading(false);
      }, [page, toast]);

      useEffect(() => {
        setPage(0);
        fetchLogs(true);
      }, []);

      const handleLoadMore = () => {
        if (!loading && hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      };
      
      useEffect(() => {
        if (page > 0) {
            fetchLogs();
        }
      }, [page]);


      const getStatusBadge = (status) => {
        switch (status) {
          case 'sent':
            return <Badge variant="success" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Envoyé</Badge>;
          case 'failed':
            return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Échoué</Badge>;
          case 'pending':
            return <Badge variant="outline" className="text-yellow-800 border-yellow-400"><MailWarning className="w-3 h-3 mr-1" />En attente</Badge>;
          default:
            return <Badge variant="secondary">{status}</Badge>;
        }
      };

      return (
        <>
          <Helmet>
            <title>Journaux d'E-mails - Super Admin</title>
          </Helmet>
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Journaux d'Envoi d'E-mails</CardTitle>
                  <CardDescription>Historique de tous les e-mails transactionnels envoyés par le système.</CardDescription>
                </div>
                <Button onClick={() => fetchLogs(true)} variant="outline" size="sm" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Rafraîchir
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Destinataire</TableHead>
                        <TableHead>Sujet</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead className="min-w-[300px]">Erreur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.length > 0 ? (
                        logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                            <TableCell className="font-medium">{log.recipient}</TableCell>
                            <TableCell>{log.subject}</TableCell>
                            <TableCell>{getStatusBadge(log.status)}</TableCell>
                            <TableCell>{log.provider}</TableCell>
                            <TableCell className="text-destructive text-xs">{log.error_message}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            {loading ? "Chargement..." : "Aucun journal trouvé."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                 {hasMore && (
                    <div className="flex justify-center mt-4">
                        <Button onClick={handleLoadMore} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Charger plus"}
                        </Button>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      );
    }
  