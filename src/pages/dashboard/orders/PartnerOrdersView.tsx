import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PartnerOrdersView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dropship_order_items')
        .select(`
          id,
          quantity,
          fulfillment_status,
          created_at,
          seller_product:seller_product_id ( name ),
          order:order_id ( customer )
        `)
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching partner orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const handleUpdateStatus = async (itemId: string, newStatus: string) => {
    try {
      const { error } = await supabase.rpc('update_dropship_item_status', { p_item_id: itemId, p_new_status: newStatus });
      if (error) throw error;
      toast({ title: 'Statut mis à jour avec succès !' });
      fetchItems(); // Refresh data
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) return <div>Chargement des commandes à traiter...</div>;

  return (
    <Card>
        <CardHeader>
            <CardTitle>Commandes Dropshipping à Traiter</CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell>{item.seller_product.name} (x{item.quantity})</TableCell>
                    <TableCell>{item.order.customer.name}</TableCell>
                    <TableCell>{item.order.customer.city}</TableCell>
                    <TableCell><Badge>{item.fulfillment_status}</Badge></TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'confirmed')}>Confirmer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'shipped')}>Expédier</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'delivered')}>Marquer comme livrée</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
};

export default PartnerOrdersView;