
    import React, { useState, useEffect, Suspense } from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
    import { Helmet, HelmetProvider } from 'react-helmet-async';
    import { Toaster } from '@/components/ui/toaster';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useProfile } from '@/contexts/ProfileContext';
    import { cn } from '@/lib/utils';
    import Sidebar from '@/components/Sidebar';
    import Header from '@/components/Header';
    import PublicHeader from '@/components/PublicHeader';
    import PublicFooter from '@/components/PublicFooter';
    import { TooltipProvider } from "@/components/ui/tooltip";
    import SubscriptionStatusBanner from '@/components/SubscriptionStatusBanner';
    import NetworkStatusIndicator from '@/components/NetworkStatusIndicator';
    import PageLoader from '@/components/PageLoader';
    import RealtimeNotificationHandler from '@/components/RealtimeNotificationHandler';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { WifiOff } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { supabase } from '@/lib/customSupabaseClient';
    import SuperAdminLayout from '@/layouts/SuperAdminLayout';
    import DashboardFooter from '@/components/DashboardFooter'; // Import DashboardFooter

    // Static imports for Store Manager to fix dynamic import issue
    import StoreManagerLayout from '@/pages/store/StoreManagerLayout';
    import StoreDesign from '@/pages/store/StoreDesign';
    import StoreProducts from '@/pages/store/StoreProducts';
    import StoreSettings from '@/pages/store/StoreSettings';

    // Lazy load all other page components
    const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
    const Orders = React.lazy(() => import('@/pages/Orders'));
    const Settings = React.lazy(() => import('@/pages/Settings'));
    const Login = React.lazy(() => import('@/pages/Login'));
    const SignUp = React.lazy(() => import('@/pages/SignUp'));
    const ForgotPassword = React.lazy(() => import('@/pages/ForgotPassword'));
    const ResetPassword = React.lazy(() => import('@/pages/ResetPassword'));
    const SuperAdminDashboard = React.lazy(() => import('@/pages/superadmin/SuperAdminDashboard'));
    const SuperAdminUsers = React.lazy(() => import('@/pages/superadmin/SuperAdminUsers'));
    const SuperAdminSettings = React.lazy(() => import('@/pages/superadmin/SuperAdminSettings'));
    const SuperAdminLogin = React.lazy(() => import('@/pages/superadmin/SuperAdminLogin'));
    const SuperAdminEmails = React.lazy(() => import('@/pages/superadmin/SuperAdminEmails'));
    const SuperAdminEmailLogs = React.lazy(() => import('@/pages/superadmin/SuperAdminEmailLogs'));
    const Pricing = React.lazy(() => import('@/pages/Pricing'));
    const SuperAdminPlans = React.lazy(() => import('@/pages/superadmin/SuperAdminPlans'));
    const PaymentStatus = React.lazy(() => import('@/pages/PaymentStatus'));
    const SubscriptionSettings = React.lazy(() => import('@/pages/SubscriptionSettings'));
    const StoresList = React.lazy(() => import('@/pages/StoresList'));
    const StorePreview = React.lazy(() => import('@/pages/StorePreview'));
    const ProductDetailPage = React.lazy(() => import('@/pages/ProductDetailPage'));
    const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
    const SuperAdminTransactions = React.lazy(() => import('@/pages/superadmin/SuperAdminTransactions'));
    const PrivacyPolicy = React.lazy(() => import('@/pages/legal/PrivacyPolicy'));
    const TermsOfService = React.lazy(() => import('@/pages/legal/TermsOfService'));
    const DropshippingPage = React.lazy(() => import('@/pages/solutions/DropshippingPage'));
    const SuperAdminAffiliates = React.lazy(() => import('@/pages/superadmin/SuperAdminAffiliates'));
    const SuperAdminPayouts = React.lazy(() => import('@/pages/superadmin/SuperAdminPayouts'));
    const AffiliateDashboard = React.lazy(() => import('@/pages/AffiliateDashboard'));
    const AffiliationPage = React.lazy(() => import('@/pages/AffiliationPage'));
    const SuperAdminDropshipping = React.lazy(() => import('@/pages/superadmin/SuperAdminDropshipping'));
    const MarketplacePage = React.lazy(() => import('@/pages/MarketplacePage'));
    const UserDropshipping = React.lazy(() => import('@/pages/UserDropshipping'));
    const Finances = React.lazy(() => import('@/pages/Finances'));
    const FeaturesPage = React.lazy(() => import('@/pages/FeaturesPage'));
    const DocumentationPage = React.lazy(() => import('@/pages/DocumentationPage'));
    const SuperAdminPaymentProviders = React.lazy(() => import('@/pages/superadmin/SuperAdminPaymentProviders'));
    const DigitalAccessPage = React.lazy(() => import('@/pages/DigitalAccessPage'));
    const SuperAdminStores = React.lazy(() => import('@/pages/superadmin/SuperAdminStores'));
    const SuperAdminEvents = React.lazy(() => import('@/pages/superadmin/SuperAdminEvents'));
    const SuperAdminPayoutLogs = React.lazy(() => import('@/pages/superadmin/SuperAdminPayoutLogs'));
    const SuperAdminAdvertisements = React.lazy(() => import('@/pages/superadmin/SuperAdminAdvertisements'));
    const SuperAdminWhatsapp = React.lazy(() => import('@/pages/superadmin/SuperAdminWhatsapp'));
    const DigitalCheckoutPage = React.lazy(() => import('@/pages/DigitalCheckoutPage'));
    const SuperAdminMarketplace = React.lazy(() => import('@/pages/superadmin/SuperAdminMarketplace'));
    const UserPurchases = React.lazy(() => import('@/pages/UserPurchases'));
    const DigitalOrderDetailsPage = React.lazy(() => import('@/pages/DigitalOrderDetailsPage'));
    const Stats = React.lazy(() => import('@/pages/Stats'));
    const Customers = React.lazy(() => import('@/pages/Customers'));
    const SuperAdminWebhooks = React.lazy(() => import('@/pages/superadmin/SuperAdminWebhooks'));

    // Partner pages
    const SupplierProfile = React.lazy(() => import('@/pages/partner/SupplierProfile'));
    const PartnerProducts = React.lazy(() => import('@/pages/partner/PartnerProducts'));
    const PartnerOrders = React.lazy(() => import('@/pages/partner/PartnerOrders'));
    const PartnerFinance = React.lazy(() => import('@/pages/partner/PartnerFinance'));

    // LAYOUT COMPONENTS
    const PublicLayout = ({ children }) => (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <PublicHeader />
        <main className="flex-grow">{children || <Outlet />}</main>
        <PublicFooter />
      </div>
    );

    const DashboardLayout = () => {
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
      const { networkError, profile } = useProfile();
      const isSuperAdmin = profile?.role === 'superadmin';

      return (
        <div className={cn(
          "min-h-screen bg-background lg:grid transition-[grid-template-columns] duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:grid-cols-[80px_1fr]" : "lg:grid-cols-[288px_1fr]",
        )}>
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          <div className="flex flex-col min-w-0">
            <Header
              setSidebarOpen={setSidebarOpen}
              isSidebarCollapsed={isSidebarCollapsed}
              setIsSidebarCollapsed={setIsSidebarCollapsed}
            />
            {networkError && <NetworkStatusIndicator />}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {!isSuperAdmin && <SubscriptionStatusBanner />}
              <Outlet />
            </main>
            <DashboardFooter /> {/* Added DashboardFooter */}
          </div>
        </div>
      );
    };

    // ROUTE GUARDS
    const AuthGuard = () => {
      const { user, loading: authLoading } = useAuth();
      const { profile, loadingProfile } = useProfile();

      if (authLoading || (user && loadingProfile)) {
        return <PageLoader />;
      }

      if (user && profile) {
        if (profile.role === 'superadmin') {
          return <Navigate to="/superadmin" />;
        }
        return <Navigate to="/dashboard" />;
      }
      
      return <Outlet />;
    };

    const PrivateRoutesLayout = () => {
      const { user, loading: authLoading } = useAuth();
      const { loadingProfile, networkError } = useProfile();
      const [isInitialLoad, setIsInitialLoad] = useState(true);

      useEffect(() => {
        if (!authLoading && !loadingProfile) {
          setIsInitialLoad(false);
        }
      }, [authLoading, loadingProfile]);
      
      useEffect(() => {
        const initializeStorage = async () => {
          const initialized = sessionStorage.getItem('storage_initialized');
          if (!initialized && user) {
            try {
              console.log('Attempting to initialize storage...');
              const { data, error } = await supabase.functions.invoke('initialize-storage');
              if (error) {
                console.error("Storage initialization via function failed:", error.message);
              } else {
                console.log("Storage initialization function completed:", data.message);
                sessionStorage.setItem('storage_initialized', 'true');
              }
            } catch (e) {
              console.error("Error invoking storage initialization function:", e.message);
            }
          }
        };
        initializeStorage();
      }, [user]);

      if ((authLoading || loadingProfile) && isInitialLoad) {
        return <PageLoader />;
      }

      if (networkError) {
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-background">
            <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                    <Card className="w-full max-w-md p-6 sm:p-8 bg-card border-border shadow-2xl shadow-primary/10">
                        <CardHeader className="p-0 mb-4 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                                <WifiOff className="h-8 w-8 text-destructive" aria-hidden="true" />
                            </div>
                            <CardTitle className="mt-4 text-2xl font-bold text-destructive">Erreur de Connexion</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 text-center">
                            <p className="text-muted-foreground">
                                Impossible de communiquer avec nos serveurs. Cela peut être dû à un problème de connexion internet ou à une extension de votre navigateur (comme un bloqueur de publicité) qui interfère.
                            </p>
                            <Button className="mt-6 w-full" onClick={() => window.location.reload()}>
                                Rafraîchir la page
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
          </div>
        );
      }

      if (!user) return <Navigate to="/login" />;
      return <Outlet />;
    };

    const SuperAdminRoutesLayout = () => {
      const { user, loading: authLoading } = useAuth();
      const { profile, loadingProfile } = useProfile();
      if (authLoading || loadingProfile) return <PageLoader />;
      if (!user) return <Navigate to="/admin/login" />;
      if (profile?.role !== 'superadmin') return <Navigate to="/" />;
      return <SuperAdminLayout />;
    };

    const PartnerRoutesLayout = () => {
      const { profile, loadingProfile } = useProfile();
      if (loadingProfile) return <PageLoader />;
      if (profile?.role === 'partner' || profile?.role === 'superadmin') {
        return <Outlet />;
      }
      return <Navigate to="/dashboard" replace />;
    };

    const RootRedirect = () => {
        const { user, loading: authLoading } = useAuth();
        const { profile, loadingProfile } = useProfile();

        if (authLoading || loadingProfile) return <PageLoader />;

        if (user && profile) {
            if (profile.role === 'superadmin') {
                return <Navigate to="/superadmin" />;
            }
            return <Navigate to="/dashboard" />;
        }

        return <PublicLayout><LandingPage /></PublicLayout>;
    };

    function App() {
      return (
        <>
          <Helmet>
            <html lang="fr" />
            <title>PayLiv – E-commerce, Dropshipping & Produits digitaux en Afrique</title>
            <meta name="description" content="Créez votre boutique e-commerce, vendez en dropshipping ou via la marketplace. PayLiv gère les produits digitaux et physiques avec paiement automatisé et à la livraison." />
            <meta name="keywords" content="e-commerce, vente en ligne, dropshipping, paiement à la livraison, boutique en ligne, afrique, côte d'ivoire, sénégal, cameroun, business en ligne, PayLiv, produits digitaux" />
            <link rel="canonical" href="https://payliv.shop" />
          </Helmet>
          <TooltipProvider>
              <Router>
                  <RealtimeNotificationHandler />
                  <div className="min-h-screen bg-background">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/s/:storeSlug" element={<StorePreview />} />
                        <Route path="/s/:storeSlug/product/:productId" element={<ProductDetailPage />} />

                        <Route element={<PublicLayout />}>
                          <Route path="/pricing" element={<Pricing />} />
                          <Route path="/features" element={<FeaturesPage />} />
                          <Route path="/affiliation" element={<AffiliationPage />} />
                          <Route path="/documentation" element={<DocumentationPage />} />
                          <Route path="/privacy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsOfService />} />
                          <Route path="/solutions/dropshipping" element={<DropshippingPage />} />
                          <Route path="/marketplace" element={<MarketplacePage />} />
                          <Route path="/telechargement" element={<DigitalAccessPage />} />
                        </Route>

                        <Route path="/checkout/:orderId" element={<DigitalCheckoutPage />} />
                        <Route path="/payment-status" element={<PaymentStatus />} />

                        {/* Auth Routes */}
                        <Route element={<AuthGuard />}>
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<SignUp />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/admin/login" element={<SuperAdminLogin />} />
                        </Route>
                        <Route path="/reset-password" element={<ResetPassword />} />
                        
                        {/* --- Private Routes --- */}
                        <Route element={<PrivateRoutesLayout />}>
                          <Route element={<DashboardLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/stats" element={<Stats />} />
                            <Route path="/stores" element={<StoresList />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/settings/subscription" element={<SubscriptionSettings />} />
                            <Route path="/affiliate" element={<AffiliateDashboard />} />
                            <Route path="/finances" element={<Finances />} />
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/dropshipping" element={<UserDropshipping />} />
                            <Route path="/my-purchases" element={<UserPurchases />} />
                            <Route path="/my-purchases/:orderId" element={<DigitalOrderDetailsPage />} />

                            <Route element={<PartnerRoutesLayout />}>
                                <Route path="/partner/profile" element={<SupplierProfile />} />
                                <Route path="/partner/products" element={<PartnerProducts />} />
                                <Route path="/partner/orders" element={<PartnerOrders />} />
                                <Route path="/partner/finance" element={<PartnerFinance />} />
                            </Route>
                          </Route>

                          <Route path="/store/:storeId" element={<StoreManagerLayout />}>
                            <Route index element={<Navigate to="design" replace />} />
                            <Route path="design" element={<StoreDesign />} />
                            <Route path="products" element={<StoreProducts />} />
                            <Route path="settings" element={<StoreSettings />} />
                          </Route>
                        </Route>

                        {/* Super Admin Routes */}
                        <Route element={<SuperAdminRoutesLayout />}>
                          <Route path="/superadmin" element={<SuperAdminDashboard />} />
                          <Route path="/superadmin/users" element={<SuperAdminUsers />} />
                          <Route path="/superadmin/stores" element={<SuperAdminStores />} />
                          <Route path="/superadmin/settings" element={<SuperAdminSettings />} />
                          <Route path="/superadmin/whatsapp" element={<SuperAdminWhatsapp />} />
                          <Route path="/superadmin/payment-providers" element={<SuperAdminPaymentProviders />} />
                          <Route path="/superadmin/plans" element={<SuperAdminPlans />} />
                          <Route path="/superadmin/transactions" element={<SuperAdminTransactions />} />
                          <Route path="/superadmin/emails" element={<SuperAdminEmails />} />
                          <Route path="/superadmin/email-logs" element={<SuperAdminEmailLogs />} />
                          <Route path="/superadmin/affiliates" element={<SuperAdminAffiliates />} />
                          <Route path="/superadmin/payouts" element={<SuperAdminPayouts />} />
                          <Route path="/superadmin/payout-logs" element={<SuperAdminPayoutLogs />} />
                          <Route path="/superadmin/events" element={<SuperAdminEvents />} />
                          <Route path="/superadmin/dropshipping" element={<SuperAdminDropshipping />} />
                          <Route path="/superadmin/advertisements" element={<SuperAdminAdvertisements />} />
                          <Route path="/superadmin/marketplace" element={<SuperAdminMarketplace />} />
                          <Route path="/superadmin/webhooks" element={<SuperAdminWebhooks />} />
                        </Route>
                      </Routes>
                    </Suspense>
                    <Toaster />
                  </div>
              </Router>
          </TooltipProvider>
        </>
      );
    }

    export default App;
  