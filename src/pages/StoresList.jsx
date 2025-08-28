import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Plus, Store, Loader2, Edit, Trash2, Globe, Eye } from 'lucide-react';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogTrigger,
    } from "@/components/ui/alert-dialog";
    import CreateStoreWizard from '@/components/store/CreateStoreWizard';
    import { toast } from '@/components/ui/use-toast';
    import { useProfile } from '@/contexts/ProfileContext';

    const StoreCard = ({ store, onEdit, onDelete }) => (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="border rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300"
      >
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center text-lg">
                  <Store className="w-5 h-5 mr-2 text-primary" />
                  {store.name}
                </CardTitle>
                <CardDescription>
                  {store.store_type === 'digital' ? 'Produits digitaux' : 'Produits physiques'}
                </CardDescription>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${store.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {store.status === 'published' ? 'Publiée' : 'Brouillon'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-between">
            <p className="text-sm text-muted-foreground line-clamp-2">{store.description || "Aucune description"}</p>
            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button variant="ghost" size="icon" onClick={() => window.open(`/s/${store.slug}`, '_blank')}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => onEdit(store.id)}>
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Elle supprimera définitivement votre boutique et toutes les données associées.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(store.id)}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );

    const StoresList = () => {
      const { user } = useAuth();
      const { profile } = useProfile();
      const [stores, setStores] = useState([]);
      const [loading, setLoading] = useState(true);
      const navigate = useNavigate();

      useEffect(() => {
        if (user) {
          fetchStores();
        }
      }, [user]);

      const fetchStores = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Erreur de récupération des boutiques:", error);
          toast({ title: 'Erreur', description: 'Impossible de charger vos boutiques.', variant: 'destructive' });
        } else {
          setStores(data);
        }
        setLoading(false);
      };

      const handleEditStore = (storeId) => {
        navigate(`/store/${storeId}/design`);
      };

      const handleDeleteStore = async (storeId) => {
        const { error } = await supabase.from('stores').delete().eq('id', storeId);
        if (error) {
          toast({ title: 'Erreur', description: "La suppression de la boutique a échoué.", variant: 'destructive' });
        } else {
          toast({ title: 'Succès', description: "Boutique supprimée." });
          setStores(stores.filter(s => s.id !== storeId));
        }
      };

      if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8" /></div>;
      }
      
      const canCreate = profile?.can_create_stores ?? true;

      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Mes Boutiques</h1>
            {canCreate ? (
              <CreateStoreWizard onStoreCreated={fetchStores} />
            ) : (
              <Button disabled>Création de boutique désactivée</Button>
            )}
          </div>

          {stores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map(store => (
                <StoreCard key={store.id} store={store} onEdit={handleEditStore} onDelete={handleDeleteStore} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-xl">
              <Store className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Vous n'avez pas encore de boutique</h3>
              <p className="mt-2 text-sm text-muted-foreground">Commencez à vendre en créant votre première boutique.</p>
              <div className="mt-6">
                <CreateStoreWizard onStoreCreated={fetchStores} />
              </div>
            </div>
          )}
        </div>
      );
    };

    export default StoresList;