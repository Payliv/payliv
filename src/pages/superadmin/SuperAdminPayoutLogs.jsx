import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const LogLevelBadge = ({ level }) => {
  const variants = {
    INFO: 'default',
    ERROR: 'destructive',
    WARNING: 'secondary',
  };
  return <Badge variant={variants[level] || 'outline'}>{level}</Badge>;
};

const SuperAdminPayoutLogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payoutIdFilter, setPayoutIdFilter] = useState(searchParams.get('payout_id') || '');

  const fetchLogs = useCallback(async (filterId) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('payout_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterId) {
        query = query.eq('payout_id', filterId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      setLogs(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching payout logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialFilter = searchParams.get('payout_id');
    if (initialFilter) {
      fetchLogs(initialFilter);
    }
  }, [fetchLogs, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(payoutIdFilter ? { payout_id: payoutIdFilter } : {});
    fetchLogs(payoutIdFilter);
  };

  const renderPayload = (payload) => {
    if (!payload) return <p className="text-muted-foreground text-xs">N/A</p>;
    return (
      <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">
        {JSON.stringify(payload, null, 2)}
      </pre>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Logs des Paiements</CardTitle>
          <CardDescription>
            Consultez les journaux détaillés des processus de paiement pour diagnostiquer les problèmes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
            <Input
              type="text"
              placeholder="Filtrer par Payout ID..."
              value={payoutIdFilter}
              onChange={(e) => setPayoutIdFilter(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Rechercher
            </Button>
          </form>

          {loading && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>Erreur lors du chargement des logs: {error}</p>
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <p>Aucun log trouvé.</p>
              <p className="text-sm">Essayez une recherche sans filtre pour voir les logs les plus récents.</p>
            </div>
          )}

          {!loading && !error && logs.length > 0 && (
            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id} className="bg-background/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <LogLevelBadge level={log.log_level} />
                        <p className="font-mono text-sm text-primary">{log.function_name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <p className="font-semibold mb-2">{log.message}</p>
                    <p className="text-xs text-muted-foreground font-mono mb-2">
                      Payout ID: {log.payout_id || 'N/A'}
                    </p>
                    {renderPayload(log.payload)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SuperAdminPayoutLogs;