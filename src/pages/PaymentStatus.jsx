import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Home, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfile } from '@/contexts/ProfileContext';

export default function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Vérification du statut de votre paiement...');
  const [orderId, setOrderId] = useState(null);
  const { user } = useAuth();
  const { refreshProfile } = useProfile();

  const verifyApiWebPayment = useCallback(async (token) => {
    try {
      const { data, error } = await supabase.functions.invoke('apiweb-verify-payment', {
        body: { token },
      });

      if (error) throw error;
      
      if (data.statut && data.data) {
          const paymentDetails = data.data;
          const paymentStatus = paymentDetails.statut;
          const orderInfo = paymentDetails.personal_Info?.[0];
          
          if (orderInfo?.orderId) {
            setOrderId(orderInfo.orderId);
          }

          if (paymentStatus === 'paid') {
            setStatus('success');
            setMessage('Votre paiement a été confirmé avec succès !');
            toast({ title: 'Paiement Réussi', description: 'Votre transaction a été complétée.' });
          } else {
            setStatus('error');
            setMessage(`Le paiement est en statut "${paymentStatus}". Veuillez réessayer ou contacter le support.`);
            toast({ title: 'Paiement non complété', description: `Statut: ${paymentStatus}`, variant: 'destructive' });
          }
      } else {
        setStatus('error');
        setMessage(data.message || 'La vérification du paiement a échoué.');
        toast({ title: 'Vérification Échouée', description: data.message || 'Veuillez contacter le support.', variant: 'destructive' });
      }
    } catch (err) {
      setStatus('error');
      const errorMessage = err.context?.body?.error || err.message || 'Une erreur inattendue est survenue.';
      setMessage(`Erreur de vérification : ${errorMessage}`);
      toast({ title: 'Erreur de Vérification', description: errorMessage, variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const orderIdFromUrl = params.get('order_id');
    const cinetpayTxId = params.get('transaction_id');
    const redirectStatus = params.get('status');
    const isSubscriptionFlow = !orderIdFromUrl && (cinetpayTxId || (redirectStatus === 'success' && !token));

    if (user && isSubscriptionFlow) {
      setStatus('loading');
      setMessage("Vérification de l'activation de votre abonnement, un instant...");
      toast({ title: 'Paiement reçu', description: 'Nous confirmons votre abonnement...' });

      const maxAttempts = 15;
      let attempt = 0;

      const poller = setInterval(async () => {
        attempt++;
        if (attempt > maxAttempts) {
          clearInterval(poller);
          setStatus('error');
          setMessage("La confirmation prend plus de temps que prévu. Votre abonnement sera activé sous peu. Vous pouvez rafraîchir la page ou contacter le support si besoin.");
          toast({ title: "Activation en attente", description: "Veuillez vérifier votre page d'abonnement dans quelques instants.", variant: 'default' });
          return;
        }

        const { data: subscription, error } = await supabase
          .from('user_subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (subscription && subscription.status === 'active') {
          clearInterval(poller);
          await refreshProfile();
          setStatus('success');
          setMessage('Félicitations ! Votre abonnement est actif. Redirection vers le tableau de bord...');
          toast({
              title: 'Abonnement Activé !',
              description: 'Vous avez maintenant accès à toutes les fonctionnalités premium.',
              className: 'bg-green-500 text-white'
          });
          setTimeout(() => navigate('/dashboard'), 3000);
        }
      }, 2000);

      return () => clearInterval(poller);
    } else if (token) {
      setMessage('Vérification de votre paiement produit...');
      verifyApiWebPayment(token);
    } else if (orderIdFromUrl) {
      setStatus('success');
      setMessage('Paiement initié. La confirmation est en attente de la notification du fournisseur.');
      setOrderId(orderIdFromUrl);
    } else if (redirectStatus === 'cancelled' || redirectStatus === 'failed') {
      setStatus('error');
      setMessage('Le paiement a échoué ou a été annulé.');
    } else if (!isSubscriptionFlow && cinetpayTxId) {
      setStatus('success');
      setMessage("Paiement initié. La confirmation est en attente. Vous recevrez une notification par email.");
    } else if (!isSubscriptionFlow && !token && !orderIdFromUrl && !redirectStatus) {
      setStatus('error');
      setMessage("Information de transaction non trouvée. Impossible de vérifier le paiement.");
    }
  }, [location, user, navigate, toast, refreshProfile, verifyApiWebPayment]);

  const renderIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-24 h-24 text-green-500" />;
      case 'error':
        return <XCircle className="w-24 h-24 text-red-500" />;
      default:
        return <Loader className="w-24 h-24 text-yellow-400 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl p-8 md:p-12 text-center max-w-lg w-full border border-border shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
          className="mb-6 flex justify-center"
        >
          {renderIcon()}
        </motion.div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {status === 'success' ? 'Paiement Réussi' : status === 'error' ? 'Paiement Échoué' : 'Vérification en cours...'}
        </h1>
        <p className="text-muted-foreground mb-8 min-h-[40px]">{message}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {status === 'success' && orderId && (
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to={`/telechargement?order_id=${orderId}`}>
                <Download className="w-4 h-4 mr-2" />
                Accéder à mes produits
              </Link>
            </Button>
          )}
           {status !== 'loading' && (
              <Button asChild variant="outline">
                <Link to="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Aller au tableau de bord
                </Link>
              </Button>
            )}
        </div>
      </motion.div>
    </div>
  );
}