import React from 'react';
    import { useProfile } from '@/contexts/ProfileContext';
    import { useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { AlertTriangle, Star } from 'lucide-react';
    import PageLoader from '@/components/PageLoader';

    const SubscriptionGuard = ({ children, storeType = 'physical' }) => {
      const { isSubscriptionActive, loadingProfile } = useProfile();
      const navigate = useNavigate();

      if (loadingProfile) {
        return <PageLoader />;
      }

      // Digital stores don't need a subscription
      if (storeType === 'digital') {
        return children;
      }

      if (!isSubscriptionActive) {
        return (
          <div className="flex items-center justify-center h-full p-4">
            <Card className="w-full max-w-md text-center glass-effect">
              <CardHeader>
                <div className="mx-auto bg-yellow-500/10 text-yellow-500 rounded-full p-3 w-fit mb-4">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Accès Premium Requis</CardTitle>
                <CardDescription>
                  Votre abonnement est inactif.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Pour accéder aux fonctionnalités pour boutiques physiques, veuillez activer ou renouveler votre abonnement.
                </p>
                <Button onClick={() => navigate('/pricing')} className="w-full">
                  <Star className="mr-2 h-4 w-4" /> Voir les abonnements
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      return children;
    };

    export default SubscriptionGuard;