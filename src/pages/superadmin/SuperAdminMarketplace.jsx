import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ExternalLink, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTablePagination } from '@/components/DataTablePagination';
import { Helmet } from 'react-helmet-async';

const ITEMS_PER_PAGE = 10;

export default function SuperAdminMarketplace() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalStores, setTotalStores] = useState(0);

  const fetchPublishedStores = useCallback(async () => {
    setLoading(true);
    
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('stores')
      .select('*, owner:user_id(name, email)', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les boutiques de la marketplace.",
        variant: "destructive",
      });
    } else {
      setStores(data || []);
      setTotalStores(count || 0);
    }
    setLoading(false);
  }, [page, searchTerm, toast]);

  useEffect(() => {
    fetchPublishedStores();
  }, [fetchPublishedStores]);

  const getTypeBadge = (type) => {
    const types = {
      physical: { label: 'Physique', color: 'bg-blue-500/20 text-blue-500' },
      digital: { label: 'Digitale', color: 'bg-purple-500/20 text-purple-500' },
    };
    const currentType = types[type] || { label: type, color: 'bg-gray-500/20 text-gray-500' };
    return <Badge className={`capitalize ${currentType.color}`}>{currentType.label}</Badge>;
  };

  return (
    <>
    <Helmet>
        <title>Gestion Marketplace - Super Admin</title>
    </Helmet>
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Store className="w-8 h-8 text-primary"/>
            Boutiques sur la Marketplace
        </h1>
        <p className="text-muted-foreground">Liste de toutes les boutiques actuellement publiées et visibles par les clients.</p>
      </motion.div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Boutiques Actives</CardTitle>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de la boutique</TableHead>
                    <TableHead>Propriétaire</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date de publication</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.length > 0 ? (
                    stores.map(store => (
                      <TableRow key={store.id}>
                        <TableCell className="font-medium">
                            <Link to={`/s/${store.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                                {store.name} <ExternalLink className="w-3 h-3 text-muted-foreground"/>
                            </Link>
                        </TableCell>
                        <TableCell>
                          <div>{store.owner.name}</div>
                          <div className="text-xs text-muted-foreground">{store.owner.email}</div>
                        </TableCell>
                        <TableCell>{getTypeBadge(store.store_type)}</TableCell>
                        <TableCell>{new Date(store.updated_at).toLocaleDateString('fr-FR')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">Aucune boutique publiée trouvée.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
           <DataTablePagination
              page={page}
              total={totalStores}
              perPage={ITEMS_PER_PAGE}
              onPageChange={setPage}
            />
        </CardContent>
      </Card>
    </div>
    </>
  );
}