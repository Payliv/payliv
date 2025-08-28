import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Search, MoreHorizontal } from 'lucide-react';
import { DataTablePagination } from '@/components/DataTablePagination';
import { useSuperAdminUsers } from '@/hooks/useSuperAdminUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/lib/customSupabaseClient';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

export default function SuperAdminUsers() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { users, totalCount, loading, error, refetch } = useSuperAdminUsers(
    page,
    pageSize,
    debouncedSearchTerm,
    statusFilter
  );

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToAction, setUserToAction] = useState(null);
  const [actionType, setActionType] = useState(null);

  const handleActionTrigger = (type, user) => {
    setUserToAction(user);
    setActionType(type);
  };

  const closeDialog = () => {
    setUserToAction(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!userToAction || !actionType) return;

    let rpcName = '';
    let params = {};
    let successMessage = '';

    switch (actionType) {
      case 'delete':
        rpcName = 'delete_user_by_admin';
        params = { p_user_id: userToAction.id };
        successMessage = "Utilisateur supprimé avec succès.";
        break;
      case 'promote-partner':
        rpcName = 'promote_user_to_partner';
        params = { p_user_id: userToAction.id };
        successMessage = "Utilisateur promu en partenaire.";
        break;
      case 'promote-premium':
        // For simplicity, we'll use a default plan ID. A real implementation would have a plan selector.
        // Let's assume plan ID 2 is 'Pro'.
        rpcName = 'promote_user_to_premium';
        params = { p_user_id: userToAction.id, p_plan_id: 2 };
        successMessage = "Utilisateur promu en Premium (Plan Pro).";
        break;
      default:
        toast({ variant: 'destructive', title: 'Action non reconnue' });
        closeDialog();
        return;
    }

    try {
      const { error: actionError } = await supabase.rpc(rpcName, params);
      if (actionError) throw actionError;
      toast({ title: 'Succès', description: successMessage });
      refetch();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message });
    } finally {
      closeDialog();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Actif</Badge>;
      case 'trial':
        return <Badge variant="warning">Essai</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expiré</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-800">Super Admin</Badge>;
      case 'partner':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-800">Partenaire</Badge>;
      case 'user':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-800">Utilisateur</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Helmet>
        <title>Gestion des Utilisateurs - Super Admin</title>
        <meta name="description" content="Gérez tous les utilisateurs, leurs rôles et leurs abonnements." />
      </Helmet>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        <Button onClick={() => toast({
            title: 'Fonctionnalité non implémentée',
            description: 'Ceci est une fonctionnalité non implémentée—mais ne vous inquiétez pas ! Vous pouvez la demander dans votre prochaine prompt ! 🚀',
            variant: 'default',
        })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un utilisateur
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rechercher et Filtrer les Utilisateurs</CardTitle>
          <CardDescription>Recherchez par nom ou e-mail et filtrez par statut d'abonnement.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select onValueChange={(value) => { setStatusFilter(value); setPage(1); }} value={statusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif (Abonné)</SelectItem>
                <SelectItem value="trial">Essai</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>
            Aperçu de tous les utilisateurs enregistrés sur la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Nom</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">E-mail</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Rôle</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Statut Abonnement</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="h-24 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="h-24 text-center text-destructive">
                      Erreur: {error}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="h-24 text-center text-muted-foreground">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{user.name || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getStatusBadge(user.subscription_status)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {user.role !== 'superadmin' && (
                              <>
                                <DropdownMenuItem onClick={() => handleActionTrigger('promote-partner', user)}>
                                  Promouvoir en Partenaire
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleActionTrigger('promote-premium', user)}>
                                  Promouvoir en Premium
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast({ title: 'Fonctionnalité non implémentée' })}>
                                  Ajuster le solde
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleActionTrigger('delete', user)} className="text-red-600">
                                  Supprimer l'utilisateur
                                </DropdownMenuItem>
                              </>
                            )}
                            {user.role === 'superadmin' && (
                              <DropdownMenuItem disabled>
                                Aucune action disponible
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <DataTablePagination
            page={page}
            total={totalCount}
            perPage={pageSize}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!actionType} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'delete' && "Cette action est irréversible. Toutes les données liées à cet utilisateur seront supprimées."}
              {actionType === 'promote-partner' && `Voulez-vous vraiment promouvoir ${userToAction?.name} au rôle de Partenaire ?`}
              {actionType === 'promote-premium' && `Voulez-vous vraiment promouvoir ${userToAction?.name} en Premium (Plan Pro) ?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialog}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} className={actionType === 'delete' ? "bg-red-600 hover:bg-red-700" : ""}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}