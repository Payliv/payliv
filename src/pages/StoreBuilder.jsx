import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/contexts/ProfileContext';
import { useStoreManager } from '@/hooks/useStoreManager';
import BuilderHeader from '@/components/builder/BuilderHeader';
import BuilderTabs from '@/components/builder/BuilderTabs';
import PreviewTab from '@/components/builder/PreviewTab';

export default function StoreBuilder() {
  const { storeId } = useParams();
  const { loadingProfile } = useProfile();
  const { store, setStore, loading, isSaving, loadStore, saveStore } = useStoreManager(storeId);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!loadingProfile) {
      loadStore();
    }
  }, [loadStore, loadingProfile]);

  if (loading || loadingProfile) {
    return <div className="flex items-center justify-center h-screen bg-background text-foreground">Chargement du constructeur...</div>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <motion.aside 
        className="flex-shrink-0 flex flex-col bg-card/50 border-r border-border"
        animate={{ width: showPreview ? '420px' : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <BuilderHeader 
          store={store} 
          saveStore={saveStore} 
          isSaving={isSaving} 
          showPreview={showPreview}
          setShowPreview={setShowPreview}
        />
        <BuilderTabs store={store} setStore={setStore} />
      </motion.aside>

      <AnimatePresence>
        {showPreview && (
          <motion.main 
            className="flex-1 flex flex-col bg-background"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex-1 overflow-y-auto p-4">
                <PreviewTab store={store} />
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}