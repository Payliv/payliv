import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Phone, Download } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const loadCustomers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id);

      if (storesError) throw storesError;

      const storeIds = storesData.map(s => s.id);
      
      if (storeIds.length > 0) {
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, customer, total, created_at, currency')
          .in('store_id', storeIds);

        if (ordersError) throw ordersError;

        const customerData = {};

        orders.forEach(order => {
          if (!order.customer || typeof order.customer !== 'object') {
            console.warn('Skipping order with invalid customer data:', order.id);
            return;
          }
          
          const email = order.customer.email || order.customer.phone;
          if (!email) return;

          if (!customerData[email]) {
            customerData[email] = {
              ...order.customer,
              orderCount: 0,
              totalSpent: 0,
              lastOrder: order.created_at,
              currency: order.currency || 'XOF'
            };
          }
          customerData[email].orderCount += 1;
          customerData[email].totalSpent += Number(order.total) || 0;
          if (new Date(order.created_at) > new Date(customerData[email].lastOrder)) {
            customerData[email].lastOrder = order.created_at;
          }
        });
        setCustomers(Object.values(customerData).sort((a, b) => b.totalSpent - a.totalSpent));
      } else {
        setCustomers([]);
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les données clients.', variant: 'destructive' });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCustomers();
    }
    if (!user && !authLoading) {
      setLoading(false);
      setCustomers([]);
    }
  }, [user, authLoading, loadCustomers]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des Clients", 14, 16);
    
    const tableColumn = ["Nom", "Email", "Téléphone", "Commandes", "Total Dépensé", "Dernière Commande"];
    const tableRows = [];

    customers.forEach(customer => {
      const customerData = [
        customer.name,
        customer.email || 'N/A',
        customer.phone,
        customer.orderCount,
        `${customer.totalSpent.toLocaleString()} ${customer.currency}`,
        new Date(customer.lastOrder).toLocaleDateString('fr-FR')
      ];
      tableRows.push(customerData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });
    
    doc.save(`liste_clients_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'Exportation réussie', description: 'Le fichier PDF de vos clients a été téléchargé.' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Gestion des Clients
          </h1>
          <p className="text-muted-foreground">
            Visualisez et exportez les informations et l'activité de vos clients.
          </p>
        </div>
        <Button onClick={exportPDF} disabled={loading || customers.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Exporter en PDF
        </Button>
      </motion.div>

      {loading ? (
        <div className="text-center text-foreground py-16">Chargement des clients...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-2 sm:p-6 border border-border"
        >
          {customers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse-slow">
                <Users className="w-12 h-12 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Aucun client trouvé
              </h3>
              <p className="text-muted-foreground">
                Les données clients apparaîtront ici après les premières commandes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-sm font-semibold text-foreground">Client</th>
                    <th className="hidden md:table-cell p-4 text-sm font-semibold text-foreground">Contact</th>
                    <th className="p-4 text-sm font-semibold text-foreground text-center">Commandes</th>
                    <th className="hidden sm:table-cell p-4 text-sm font-semibold text-foreground text-right">Total Dépensé</th>
                    <th className="hidden lg:table-cell p-4 text-sm font-semibold text-foreground text-right">Dernière Commande</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <motion.tr
                      key={customer.email || customer.phone}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border hover:bg-muted"
                    >
                      <td className="p-4">
                        <div className="font-medium text-foreground">{customer.name}</div>
                        <div className="text-muted-foreground text-sm md:hidden">{customer.email}</div>
                      </td>
                      <td className="hidden md:table-cell p-4 text-muted-foreground">
                        {customer.email && <div className="flex items-center space-x-2"><Mail className="w-4 h-4 text-primary" /><span>{customer.email}</span></div>}
                        {customer.phone && <div className="flex items-center space-x-2 mt-1"><Phone className="w-4 h-4 text-primary" /><span>{customer.phone}</span></div>}
                      </td>
                      <td className="p-4 text-center text-foreground">{customer.orderCount}</td>
                      <td className="hidden sm:table-cell p-4 text-right font-medium text-secondary">{customer.totalSpent.toLocaleString()} {customer.currency}</td>
                      <td className="hidden lg:table-cell p-4 text-right text-muted-foreground">{new Date(customer.lastOrder).toLocaleDateString('fr-FR')}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}