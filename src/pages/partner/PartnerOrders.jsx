import React from 'react';
import PartnerOrdersView from '@/components/orders/PartnerOrdersView';
import { motion } from 'framer-motion';

export default function PartnerOrders() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Commandes à Traiter
        </h1>
        <p className="text-muted-foreground">
          Gérez les commandes de vos produits en dropshipping.
        </p>
      </div>
      <PartnerOrdersView />
    </motion.div>
  );
}