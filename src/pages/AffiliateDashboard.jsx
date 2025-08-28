import React, { useState, useEffect, useCallback } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { BarChart, Copy, DollarSign, ExternalLink, Link as LinkIcon, Users, Star, Gift, CheckCircle, Clock } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Badge } from '@/components/ui/badge';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useProfile } from '@/contexts/ProfileContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import PayoutRequestDialog from '@/components/PayoutRequestDialog';
    import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    } from "@/components/ui/dialog"
    import PageLoader from '@/components/PageLoader';
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

    const StatCard = ({ title, value, icon, description }) => (
      <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );

    const AffiliateDashboard = () => {
      const { user } = useAuth();
      const { profile } = useProfile();
      const { toast } = useToast();
      const [affiliateData, setAffiliateData] = useState(null);
      const [stats, setStats] = useState({});
      const [referrals, setReferrals] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);

      const siteUrl = window.location.origin;

      const loadAffiliateData = useCallback(async () => {
        if (!user || !profile) return;
        setLoading(true);
        setError(null);

        try {
          const { data, error } = await supabase.rpc('get_my_affiliate_data');
          if (error) throw error;
          
          if (data) {
            setAffiliateData(data);
            const { data: statsData, error: statsError } = await supabase.rpc('get_my_affiliate_dashboard_stats', { p_affiliate_id: data.id });
            if (statsError) throw statsError;
            setStats(statsData);

            const { data: referralsData, error: referralsError } = await supabase.rpc('get_my_all_referrals_by_link', {
              p_affiliate_code: data.affiliate_code,
              p_page: 1,
              p_page_size: 10
            });
            if (referralsError) throw referralsError;
            setReferrals(referralsData || []);
          } else {
            const { data: enrolledData, error: enrollError } = await supabase.rpc('enroll_in_affiliate_program');
            if (enrollError) throw enrollError;
            if(enrolledData) {
              setAffiliateData(enrolledData);
            }
          }
        } catch (err) {
          console.error('Error loading affiliate data:', err);
          setError(err.message);
          toast({
            title: 'Erreur',
            description: "Impossible de charger les données d'affiliation. Veuillez réessayer.",
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }, [user, profile, toast]);

      useEffect(() => {
        if (profile) {
          loadAffiliateData();
        }
      }, [profile, loadAffiliateData]);

      const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
          toast({
            title: 'Copié !',
            description: 'Votre lien d\'affiliation a été copié dans le presse-papiers.',
          });
        });
      };
      
      if (loading || !profile) {
        return <PageLoader />;
      }

      if (error) {
        return (
          <div className="text-center py-10">
            <p className="text-destructive">Erreur: {error}</p>
            <Button onClick={loadAffiliateData} className="mt-4">Réessayer</Button>
          </div>
        );
      }

      if (!affiliateData) {
        return (
          <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center p-8">
              <CardHeader>
                <Gift className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4 text-2xl font-bold">Rejoignez notre programme d'affiliation</CardTitle>
                <CardDescription>Devenez partenaire PayLiv et gagnez des commissions en recommandant notre plateforme.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={loadAffiliateData} size="lg" className="w-full">
                  <Star className="mr-2 h-4 w-4" /> Devenir Affilié
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      const referralLink = `${siteUrl}/signup?ref=${affiliateData.affiliate_code}`;

      return (
        <>
          <Helmet>
            <title>Tableau de Bord Affiliation - PayLiv</title>
            <meta name="description" content="Gérez votre programme d'affiliation, suivez vos parrainages et vos gains." />
          </Helmet>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord d'Affiliation</h1>
                <p className="text-muted-foreground">Suivez vos parrainages et vos gains.</p>
              </div>
               <Button onClick={() => setIsPayoutDialogOpen(true)} disabled={!affiliateData || affiliateData.balance <= 0}>
                <DollarSign className="mr-2 h-4 w-4" /> Demander un retrait
              </Button>
            </div>
            
            <Alert>
              <Star className="h-4 w-4" />
              <AlertTitle>Votre lien d'affiliation unique</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="flex flex-wrap items-center gap-4 bg-muted p-3 rounded-lg">
                  <LinkIcon className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="font-mono text-sm break-all flex-grow">{referralLink}</p>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(referralLink)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Partagez ce lien. Quand un utilisateur s'inscrit et passe à un abonnement premium, vous gagnez une commission de {affiliateData.effective_commission_rate}%.
                </p>
              </AlertDescription>
            </Alert>


            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Solde Actuel"
                value={`${affiliateData.balance.toLocaleString('fr-FR')} XOF`}
                description="Gains disponibles pour le retrait"
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Gains Totaux"
                value={`${(stats.total_earnings || 0).toLocaleString('fr-FR')} XOF`}
                description="Toutes les commissions que vous avez générées"
                icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Filleuls Inscrits"
                value={stats.total_referrals || 0}
                description="Nombre total d'inscriptions via votre lien"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Filleuls Actifs"
                value={stats.active_referrals || 0}
                description="Filleuls avec un abonnement premium actif"
                icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vos 10 Derniers Filleuls</CardTitle>
                <CardDescription>Liste des derniers utilisateurs inscrits avec votre lien.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Date d'inscription</TableHead>
                        <TableHead>Statut Abonnement</TableHead>
                        <TableHead className="text-right">Commission Reçue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referrals && referrals.length > 0 ? (
                        referrals.map((referral) => (
                          <TableRow key={referral.referred_user_id}>
                            <TableCell>
                              <div className="font-medium">{referral.referred_user_name || 'Non disponible'}</div>
                              <div className="text-sm text-muted-foreground">{referral.referred_user_email || 'Non disponible'}</div>
                            </TableCell>
                            <TableCell>
                              {referral.signup_date ? new Date(referral.signup_date).toLocaleDateString('fr-FR') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={referral.subscription_status === 'active' ? 'success' : 'outline'}>
                                {referral.subscription_status === 'active' ? 'Actif' : 'Inactif'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {referral.commission_earned != null ? `${referral.commission_earned.toLocaleString('fr-FR')} XOF` : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan="4" className="text-center h-24">
                            Vous n'avez pas encore de filleuls. Partagez votre lien !
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <PayoutRequestDialog
            isOpen={isPayoutDialogOpen}
            onOpenChange={setIsPayoutDialogOpen}
            balance={affiliateData.balance}
            payoutType="affiliate"
            onSuccessfulRequest={loadAffiliateData}
          />
        </>
      );
    };

    export default AffiliateDashboard;