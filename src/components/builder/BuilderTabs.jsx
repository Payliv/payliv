import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, ShoppingBag, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StoreDesignTab from '@/components/builder/StoreDesignTab';
import ProductsTab from '@/components/builder/ProductsTab';
import SettingsTab from '@/components/builder/SettingsTab';

export default function BuilderTabs({ store, setStore }) {
  const [activeTab, setActiveTab] = useState('design');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
      <TabsList className="grid w-full grid-cols-3 bg-muted/20 rounded-none h-14 flex-shrink-0">
        <TabsTrigger value="design" className="text-base"><Palette className="w-5 h-5 mr-2" />Design</TabsTrigger>
        <TabsTrigger value="products" className="text-base"><ShoppingBag className="w-5 h-5 mr-2" />Produits</TabsTrigger>
        <TabsTrigger value="settings" className="text-base"><SettingsIcon className="w-5 h-5 mr-2" />Paramètres</TabsTrigger>
      </TabsList>
      <div className="flex-grow overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="design" className="mt-0">
              <StoreDesignTab store={store} setStore={setStore} />
            </TabsContent>
            <TabsContent value="products" className="mt-0">
              <ProductsTab store={store} setStore={setStore} />
            </TabsContent>
            <TabsContent value="settings" className="mt-0">
              <SettingsTab store={store} setStore={setStore} />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </div>
    </Tabs>
  );
}