import React from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import PageLoader from '@/components/PageLoader';
import SellerOrdersView from '@/components/orders/SellerOrdersView';
import PartnerOrdersView from '@/components/orders/PartnerOrdersView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

export default function Orders() {
  const { profile, loadingProfile } = useProfile();

  if (loadingProfile) {
    return <PageLoader />;
  }

  if (profile?.role === 'partner') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Gestion des Commandes
          </h1>
          <p className="text-muted-foreground">
            Suivez et gérez vos ventes directes et les commandes de dropshipping à traiter.
          </p>
        </div>
        <Tabs defaultValue="direct_sales" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct_sales">Mes Ventes Directes</TabsTrigger>
            <TabsTrigger value="dropshipping_orders">Commandes à Traiter (Dropshipping)</TabsTrigger>
          </TabsList>
          <TabsContent value="direct_sales" className="mt-6">
            <SellerOrdersView />
          </TabsContent>
          <TabsContent value="dropshipping_orders" className="mt-6">
            <PartnerOrdersView />
          </TabsContent>
        </Tabs>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Gestion des Commandes
        </h1>
        <p className="text-muted-foreground">
          Suivez et gérez toutes vos commandes.
        </p>
      </div>
      <SellerOrdersView />
    </motion.div>
  );
}