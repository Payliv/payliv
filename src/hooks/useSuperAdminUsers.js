import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

export function useSuperAdminUsers(page, pageSize, searchTerm, statusFilter) {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_users_filtered_paginated', {
        p_page_size: pageSize,
        p_page: page,
        p_search_term: searchTerm,
        p_status_filter: statusFilter
      });

      if (rpcError) {
        throw rpcError;
      }
      
      setUsers(data || []);
      setTotalCount(data?.[0]?.total_count || 0);

    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: `Impossible de charger les utilisateurs: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, totalCount, loading, error, refetch: fetchUsers };
}