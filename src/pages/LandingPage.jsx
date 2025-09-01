import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Helmet } from 'react-helmet-async';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    // Import refactored components
    import HeroSection from '@/components/landing/HeroSection';
    import SolutionsSection from '@/components/landing/SolutionsSection';
    import MarketplaceSection from '@/components/landing/MarketplaceSection';
    import SubscriptionSection from '@/components/landing/SubscriptionSection';
    import AffiliateSection from '@/components/landing/AffiliateSection';
    import PricingSection from '@/components/landing/PricingSection';
    import AIChatbot from '@/components/AIChatbot';
    import AdCarousel from '@/components/landing/AdCarousel';

    export default function LandingPage() {
      const [plans, setPlans] = useState([]);
      const [loadingPlans, setLoadingPlans] = useState(true);
      const [latestProducts, setLatestProducts] = useState([]);
      const [loadingProducts, setLoadingProducts] = useState(true);
      const [ads, setAds] = useState([]);
      const [loadingAds, setLoadingAds] = useState(true);
      const { user } = useAuth();
      const navigate = useNavigate();

      useEffect(() => {
        const fetchPlans = async () => {
          setLoadingPlans(true);
          const { data, error } = await supabase.from('subscription_plans').select('*').order('price', { ascending: true });
          if (error) {
            console.error("Erreur de chargement des plans", error);
          } else {
            setPlans(data);
          }
          setLoadingPlans(false);
        };
        
        const fetchLatestProducts = async () => {
            setLoadingProducts(true);
            const { data, error } = await supabase
                .from('products')
                .select('id, name, price, image, stores!inner(name, slug, status)')
                .eq('stores.status', 'published')
                .order('created_at', { ascending: false })
                .limit(12);
            
            if (error) {
            } else {
                setLatestProducts(data);
            }
            setLoadingProducts(false);
        };

        const fetchAds = async () => {
            setLoadingAds(true);
            const { data, error } = await supabase
                .from('advertisements')
                .select('*')
                .eq('is_active', true)
                .in('placement', ['landing_page', 'marketplace_top']);

            if (error) {
                console.error("Error fetching ads", error);
            } else {
                setAds(data);
            }
            setLoadingAds(false);
        };

        fetchPlans();
        fetchLatestProducts();
        fetchAds();
      }, []);

      const handleChoosePlan = (plan) => {
        if (!user) {
          navigate(`/signup?plan=${plan.id}&redirect=/pricing`);
        } else {
          navigate('/pricing');
        }
      };

      return (
        <>
          <Helmet>
            <title>PayLiv – E-commerce, Dropshipping & Produits digitaux en Afrique</title>
            <meta name="description" content="Créez votre boutique e-commerce, vendez en dropshipping ou via la marketplace. PayLiv gère les produits digitaux et physiques avec paiement automatisé et à la livraison." />
          </Helmet>
          <div className="overflow-x-hidden">
            <HeroSection />
            <SolutionsSection />
            <AdCarousel ads={ads} loading={loadingAds} />
            <MarketplaceSection products={latestProducts} loading={loadingProducts} />
            <SubscriptionSection plans={plans} loading={loadingPlans} onChoosePlan={handleChoosePlan} />
            <AffiliateSection />
            <PricingSection />
            <AIChatbot />
          </div>
        </>
      );
    }