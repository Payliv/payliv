import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Badge } from '@/components/ui/badge';
    import { Loader2, Activity, CheckCircle, XCircle, Info } from 'lucide-react';
    import { DataTablePagination } from '@/components/DataTablePagination';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';

    const ITEMS_PER_PAGE = 20;

    const StatusBadge = ({ status }) => {
      const statusConfig = {
        success: { label: 'Succès', color: 'success', icon: CheckCircle },
        error: { label: 'Erreur', color: 'destructive', icon: XCircle },
        initiated: { label: 'Initié', color: 'bg-blue-500/20 text-blue-500', icon: Info },
        ignored: { label: 'Ignoré', color: 'secondary', icon: Info },
      };
      const config = statusConfig[status] || { label: status, color: 'secondary', icon: Info };
      return (
        <Badge variant={config.color} className="flex items-center space-x-1 whitespace-nowrap">
          <config.icon className="w-3 h-3" />
          <span>{config.label}</span>
        </Badge>
      );
    };

    export default function SuperAdminEvents() {
      const { toast } = useToast();
      const [events, setEvents] = useState([]);
      const [loading, setLoading] = useState(true);
      const [page, setPage] = useState(1);
      const [totalEvents, setTotalEvents] = useState(0);

      const fetchEvents = useCallback(async (currentPage) => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_system_events_paginated', {
          p_page: currentPage,
          p_page_size: ITEMS_PER_PAGE,
        });

        if (error) {
          toast({ title: 'Erreur', description: "Impossible de charger le journal d'événements.", variant: 'destructive' });
          setEvents([]);
        } else {
          setEvents(data || []);
          setTotalEvents(data?.[0]?.total_count || 0);
        }
        setLoading(false);
      }, [toast]);

      useEffect(() => {
        fetchEvents(page);
      }, [page, fetchEvents]);

      return (
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2 flex items-center">
              <Activity className="w-8 h-8 mr-3" />
              Journal d'Événements
            </h1>
            <p className="text-muted-foreground">
              Suivez les événements importants du système, y compris les appels API et les webhooks.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Derniers Événements</CardTitle>
              <CardDescription>Liste des événements système enregistrés.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="p-4 text-left text-sm font-semibold">Date</th>
                      <th className="p-4 text-left text-sm font-semibold">Type d'Événement</th>
                      <th className="p-4 text-left text-sm font-semibold">Statut</th>
                      <th className="p-4 text-left text-sm font-semibold">Notes</th>
                      <th className="p-4 text-center text-sm font-semibold">Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="text-center p-8">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        </td>
                      </tr>
                    ) : events.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center p-8 text-muted-foreground">Aucun événement trouvé.</td>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <tr key={event.id} className="border-b hover:bg-muted/30">
                          <td className="p-4 text-sm text-muted-foreground">{new Date(event.created_at).toLocaleString()}</td>
                          <td className="p-4 font-medium">{event.event_type.replace(/_/g, ' ')}</td>
                          <td className="p-4"><StatusBadge status={event.status} /></td>
                          <td className="p-4 text-sm text-muted-foreground truncate max-w-xs" title={event.notes}>{event.notes}</td>
                          <td className="p-4 text-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Voir Payload</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Détails de l'Événement</DialogTitle>
                                </DialogHeader>
                                <pre className="mt-2 w-full overflow-auto rounded-md bg-slate-950 p-4">
                                  <code className="text-white">{JSON.stringify(event.payload, null, 2)}</code>
                                </pre>
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <DataTablePagination page={page} total={totalEvents} perPage={ITEMS_PER_PAGE} onPageChange={setPage} />
            </CardContent>
          </Card>
        </div>
      );
    }