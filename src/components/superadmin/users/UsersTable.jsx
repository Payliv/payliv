import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { Trash2, Award, Truck, DollarSign } from 'lucide-react';

    const getRoleBadge = (role) => {
      switch (role) {
        case 'superadmin': return 'bg-red-500 text-white';
        case 'partner': return 'bg-blue-500 text-white';
        default: return 'bg-muted text-muted-foreground';
      }
    };

    const getRoleName = (role) => {
      switch (role) {
        case 'superadmin': return 'Super Admin';
        case 'partner': return 'Fournisseur';
        default: return 'Utilisateur';
      }
    };

    const getUserStatus = (user) => {
        if (user.subscription_status === 'active') return <Badge variant="success">Actif</Badge>;
        if (user.trial_ends_at && new Date(user.trial_ends_at) > new Date()) return <Badge variant="outline" className="border-yellow-400 text-yellow-400">En Essai</Badge>;
        return <Badge variant="secondary">Expiré</Badge>;
    };

    const UserActions = ({ user, onAction }) => (
      <div className="flex space-x-2 justify-end">
        {user.role !== 'superadmin' && (
          <Button onClick={() => onAction('balance', user)} variant="outline" size="icon" className="h-8 w-8 border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
            <DollarSign className="w-4 h-4" />
          </Button>
        )}
        {user.role === 'user' && (
          <Button onClick={() => onAction('partner', user)} variant="outline" size="icon" className="h-8 w-8 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
            <Truck className="w-4 h-4" />
          </Button>
        )}
        <Button onClick={() => onAction('promo', user)} variant="outline" size="icon" className="h-8 w-8 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"><Award className="w-4 h-4" /></Button>
        <Button onClick={() => onAction('delete', user)} variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4" /></Button>
      </div>
    );

    export const UsersTable = ({ users, onAction }) => {
      return (
        <>
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-sm font-semibold text-foreground">Nom</th>
                  <th className="p-4 text-sm font-semibold text-foreground">Email</th>
                  <th className="p-4 text-sm font-semibold text-foreground">Rôle</th>
                  <th className="p-4 text-sm font-semibold text-foreground">Statut</th>
                  <th className="p-4 text-sm font-semibold text-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-foreground font-medium">{user.name || 'N/A'}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>{getRoleName(user.role)}</span></td>
                    <td className="p-4">{getUserStatus(user)}</td>
                    <td className="p-4">
                      <UserActions user={user} onAction={onAction} />
                    </td>
                  </tr>
                )) : (
                   <tr><td colSpan="5" className="text-center p-8 text-muted-foreground">Aucun utilisateur trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-4">
            {users.length > 0 ? users.map((user) => (
              <div key={user.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                <div>
                  <div className="font-bold text-foreground">{user.name || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>{getRoleName(user.role)}</span>
                  {getUserStatus(user)}
                </div>
                <div className="pt-2 border-t border-border">
                  <UserActions user={user} onAction={onAction} />
                </div>
              </div>
            )) : (
              <div className="text-center p-8 text-muted-foreground">Aucun utilisateur trouvé.</div>
            )}
          </div>
        </>
      );
    };