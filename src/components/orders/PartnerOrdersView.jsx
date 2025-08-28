import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, XCircle, Truck, WifiOff, RefreshCw } from 'lucide-react';
import PartnerOrderCard from '@/components/partner/PartnerOrderCard';

export default function PartnerOrdersView() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('dropship_order_items')
      .select(`
        *,
        order:orders!inner(*),
        seller_product:products!dropship_order_items_seller_product_id_fkey(name, image),
        source_product:products!dropship_order_items_source_product_id_fkey(name, wholesale_price),
        seller:profiles!dropship_order_items_seller_id_fkey(name, whatsapp_number)
      `)
      .eq('supplier_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError);
      toast({ title: 'Erreur', description: 'Impossible de charger les commandes à traiter.', variant: 'destructive' });
      console.error(fetchError);
    } else {
      setOrders(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
    if (!user && !authLoading) {
      setLoading(false);
      setOrders([]);
    }
  }, [user, authLoading, loadOrders]);

  const updateItemStatus = async (itemId, newStatus) => {
    const originalOrders = [...orders];
    setOrders(prevOrders => prevOrders.map(item => 
      item.id === itemId ? { ...item, fulfillment_status: newStatus } : item
    ));

    const { error: updateError } = await supabase.rpc('update_dropship_item_status', {
      p_item_id: itemId,
      p_new_status: newStatus
    });

    if (updateError) {
      toast({ title: 'Erreur', description: "La mise à jour du statut a échoué.", variant: 'destructive' });
      setOrders(originalOrders);
    } else {
      toast({ title: 'Statut mis à jour', description: `L'article a été marqué comme ${getStatusLabel(newStatus)}.` });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.fulfillment_status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'shipped': return Truck;
      case 'delivered': return Package;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      confirmed: 'bg-blue-500/20 text-blue-500',
      shipped: 'bg-purple-500/20 text-purple-500',
      delivered: 'bg-green-500/20 text-green-500',
      cancelled: 'bg-red-500/20 text-red-500',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="text-center text-foreground py-16">Chargement des commandes...</div>;
    }
    
    if (error) {
      const isNetworkError = error.message.includes('Failed to fetch');
      return (
        <div className="text-center py-16 bg-card rounded-xl border border-destructive/50">
          <div className="w-24 h-24 mx-auto mb-6 bg-destructive/10 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold text-card-foreground mb-2">
            {isNetworkError ? 'Erreur de connexion' : 'Une erreur est survenue'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isNetworkError 
              ? 'Impossible de charger vos commandes. Veuillez vérifier votre connexion internet et réessayer.' 
              : 'Un problème est survenu lors du chargement des commandes. Notre équipe a été notifiée.'
            }
          </p>
          <Button onClick={loadOrders} className="mt-6">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      );
    }
    
    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse-slow">
            <Package className="w-12 h-12 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Aucune commande trouvée</h3>
          <p className="text-muted-foreground">
            {filter === 'all' ? 'Aucune commande à traiter pour le moment' : `Aucune commande avec le statut "${getStatusLabel(filter)}"`}
          </p>
        </div>
      );
    }
    
    return (
       <div className="space-y-4">
        {filteredOrders.map((item, index) => (
          <PartnerOrderCard
            key={item.id}
            orderItem={item}
            onUpdateStatus={updateItemStatus}
            getStatusIcon={getStatusIcon}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
            delay={index * 0.1}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-4 sm:p-6 mb-8 border border-border">
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'Toutes', icon: Package },
            { key: 'pending', label: 'En attente', icon: Clock },
            { key: 'confirmed', label: 'Confirmées', icon: CheckCircle },
            { key: 'shipped', label: 'Expédiées', icon: Truck },
            { key: 'delivered', label: 'Livrées', icon: Package },
            { key: 'cancelled', label: 'Annulées', icon: XCircle }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
              className={`${filter === key ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
              <span className="ml-2 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                {key === 'all' ? orders.length : orders.filter(o => o.fulfillment_status === key).length}
              </span>
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {renderContent()}
      </motion.div>
    </div>
  );
}