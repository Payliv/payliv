import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';
import { CompanyCard } from '@/components/dropshipping/CompanyCard';
import { CompanyDetailModal } from '@/components/dropshipping/CompanyDetailModal';
import { FaqSection } from '@/components/dropshipping/FaqSection';
import { HowItWorksSection } from '@/components/dropshipping/HowItWorksSection';
import SupplierSubscriptionPicker from '@/components/dropshipping/SupplierSubscriptionPicker';
import { useProfile } from '@/contexts/ProfileContext';

export default function DropshippingPage() {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierPlans, setSupplierPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      const { data, error } = await supabase
        .from('dropshipping_companies')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dropshipping companies:', error);
      } else {
        setCompanies(data);
      }
      setLoadingCompanies(false);
    };

    const fetchSupplierPlans = async () => {
      setLoadingPlans(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .in('name', ['Pro', 'Entreprise'])
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching supplier plans:', error);
      } else {
        setSupplierPlans(data);
      }
      setLoadingPlans(false);
    };

    fetchCompanies();
    fetchSupplierPlans();
  }, []);

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Devenez Fournisseur Dropshipping - PayLiv</title>
        <meta name="description" content="Rejoignez notre réseau de fournisseurs en dropshipping. Vendez vos produits à travers des milliers de boutiques en Afrique sans effort marketing." />
      </Helmet>
      <div className="bg-gradient-to-b from-background to-muted/50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold gradient-text mb-4"
          >
            Multipliez vos Ventes. Pas votre Effort.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Devenez fournisseur sur PayLiv et laissez notre armée de vendeurs propulser vos produits sur tout le marché africain.
          </motion.p>
        </div>
      </div>

      <HowItWorksSection />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Nos Fournisseurs Actuels</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Découvrez les entreprises qui nous font déjà confiance pour distribuer leurs produits.</p>
        </div>
        {loadingCompanies ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map(company => (
              <CompanyCard key={company.id} company={company} onSelect={handleSelectCompany} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-foreground">Aucun partenaire public pour le moment</h2>
            <p className="text-muted-foreground mt-2">Soyez le premier à rejoindre notre réseau en pleine expansion !</p>
          </div>
        )}
      </main>

      <section id="become-partner" className="bg-muted/50 py-20">
        <div className="max-w-5xl mx-auto px-4">
           <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Prêt à passer à la vitesse supérieure ?</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Choisissez une formule Pro ou Entreprise pour devenir fournisseur et accéder à notre réseau de vendeurs.</p>
           </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            {profile?.role === 'partner' || profile?.role === 'superadmin' ? (
              <div className="text-center p-8 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-500 max-w-2xl mx-auto">
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">Vous êtes déjà Fournisseur !</h3>
                  <p className="text-green-600 dark:text-green-400 mt-2">Vous pouvez gérer votre profil public et vos produits depuis votre tableau de bord.</p>
              </div>
            ) : loadingPlans ? (
              <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <SupplierSubscriptionPicker plans={supplierPlans} />
            )}
          </motion.div>
        </div>
      </section>

      <FaqSection />

      <CompanyDetailModal 
        company={selectedCompany} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  );
}