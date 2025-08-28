import React, { useState, useEffect, useMemo } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/DataTablePagination';
import { ArrowUpDown, MoreHorizontal, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SuperAdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const columns = useMemo(
    () => [
      {
        Header: 'Nom de la boutique',
        accessor: 'name',
        Cell: ({ row }) => (
          <div className="font-medium flex items-center">
            {row.original.name}
            <Link to={`/s/${row.original.slug}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-muted-foreground hover:text-primary">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        ),
      },
      {
        Header: 'Propriétaire',
        accessor: 'owner_name',
        Cell: ({ row }) => (
          <div>
            <div>{row.original.owner_name}</div>
            <div className="text-xs text-muted-foreground">{row.original.owner_email}</div>
          </div>
        ),
      },
      {
        Header: 'Statut',
        accessor: 'status',
        Cell: ({ value }) => {
          const variant = {
            published: 'success',
            draft: 'secondary',
            archived: 'destructive',
          }[value] || 'default';
          return <Badge variant={variant}>{value}</Badge>;
        },
      },
      {
        Header: 'Type',
        accessor: 'store_type',
        Cell: ({ value }) => <Badge variant="outline">{value}</Badge>,
      },
      {
        Header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSortBy(!column.isSortedDesc)}
          >
            Créé le
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessor: 'created_at',
        Cell: ({ value }) => format(new Date(value), 'd MMM yyyy', { locale: fr }),
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount: controlledPageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: stores,
      initialState: { pageIndex: 0, pageSize: 10 },
      manualPagination: true,
      pageCount: pageCount,
    },
    useSortBy,
    usePagination
  );

  const fetchStores = async (pageIndex, pageSize) => {
    setLoading(true);
    const { data, error, count } = await supabase.rpc('get_all_stores_paginated', {
      p_page_size: pageSize,
      p_page: pageIndex + 1,
    });

    if (error) {
      console.error('Error fetching stores:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les boutiques.',
        variant: 'destructive',
      });
    } else {
      setStores(data);
      setPageCount(Math.ceil(data[0]?.total_count / pageSize) || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStores(pageIndex, pageSize);
  }, [pageIndex, pageSize]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-10"
    >
      <h1 className="text-3xl font-bold mb-6">Gestion des Boutiques</h1>
      
      <div className="mb-4">
        <Input
          placeholder="Rechercher une boutique..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table {...getTableProps()}>
          <TableHeader>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <TableHead {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody {...getTableBodyProps()}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : page.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucune boutique trouvée.
                </TableCell>
              </TableRow>
            ) : (
              page.map((row, i) => {
                prepareRow(row);
                return (
                  <TableRow {...row.getRowProps()}>
                    {row.cells.map(cell => {
                      return <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>;
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        pageIndex={pageIndex}
        pageCount={controlledPageCount}
        pageSize={pageSize}
        setPageSize={setPageSize}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        gotoPage={gotoPage}
        previousPage={previousPage}
        nextPage={nextPage}
      />
    </motion.div>
  );
};

export default SuperAdminStores;