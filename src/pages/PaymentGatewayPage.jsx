import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import PageLoader from '@/components/PageLoader';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function PaymentGatewayPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null); // provider slug
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!orderId) {
        toast({ title: "Erreur", description: "Identifiant de commande manquant.", variant: "destructive" });
        navigate('/');
        return;
      }

      setLoading(true);

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, store:store_id(name, slug)')
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        toast({ title: "Erreur", description: "Commande non trouvée.", variant: "destructive" });
        navigate('/');
        return;
      }
      setOrderDetails(orderData);
      
      const { data: providersData, error: providersError } = await supabase
        .from('payment_providers')
        .select('*')
        .eq('is_active', true)
        .or('types.cs.{"product"},types.cs.{"all"}');

      if (providersError) {
        toast({ title: "Erreur", description: "Impossible de charger les fournisseurs de paiement.", variant: "destructive" });
        setProviders([]);
      } else {
        setProviders(providersData);
      }

      setLoading(false);
    };

    fetchPaymentData();
  }, [orderId, navigate, toast]);

  const handlePaymentInitiation = async (provider) => {
    setIsProcessing(provider.slug);

    try {
        let functionName = '';
        let payload = {};

        if (provider.slug === 'cinetpay') {
            functionName = 'cinetpay-product-payment-init';
            payload = {
                orderId: orderDetails.id,
                amount: orderDetails.total,
                currency: orderDetails.currency,
                description: `Paiement pour commande #${orderDetails.id.substring(0,8)} sur ${orderDetails.store.name}`,
                customerName: orderDetails.customer.name,
                customerEmail: orderDetails.customer.email,
                customerPhone: orderDetails.customer.phone,
                metadata: {
                    order_id: orderDetails.id,
                    store_id: orderDetails.store_id,
                    type: 'product_payment'
                }
            };
        } else if (provider.slug === 'apiweb') {
            functionName = 'apiweb-api';
            
            const articlesObject = {};
            orderDetails.items.forEach(item => {
                articlesObject[item.name] = item.price * item.quantity;
            });

            payload = {
                totalPrice: orderDetails.total,
                article: [articlesObject],
                personal_Info: [{ 
                    orderId: orderDetails.id, 
                    customerEmail: orderDetails.customer.email 
                }],
                numeroSend: orderDetails.customer.phone.replace(/[^0-9]/g, ''),
                nomclient: orderDetails.customer.name,
                return_url: `${window.location.origin}/payment-status`
            };
        } else {
            toast({ title: "Non implémenté", description: `La passerelle ${provider.name} n'est pas encore connectée.`, variant: "destructive" });
            setIsProcessing(null);
            return;
        }

        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(functionName, {
            body: payload,
        });

        if (paymentError) {
            throw new Error(paymentError.message);
        }
        
        const paymentUrl = paymentData.payment_url || paymentData.data?.payment_url || paymentData.checkout_url || paymentData.data?.checkout_url || paymentData.url_paiement || paymentData.url;
        
        if (paymentUrl) {
            window.location.href = paymentUrl;
        } else {
            console.error("API Response:", paymentData);
            throw new Error("L'URL de paiement n'a pas été retournée par la passerelle.");
        }

    } catch (error) {
        toast({
            title: "Erreur d'initialisation",
            description: error.message,
            variant: "destructive",
        });
        setIsProcessing(null);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
            <Link to={`/s/${orderDetails?.store?.slug || ''}`} className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Retour à la boutique
            </Link>
        </div>
        <div className="bg-card p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-2">Finaliser le paiement</h1>
          <p className="text-muted-foreground text-center mb-6">
            Montant à payer : <span className="font-bold text-primary">{orderDetails?.total.toLocaleString()} {orderDetails?.currency}</span>
          </p>

          <div className="space-y-4">
            {providers.length > 0 ? (
              providers.map(provider => (
                <Button
                  key={provider.id}
                  onClick={() => handlePaymentInitiation(provider)}
                  className="w-full h-16 text-lg"
                  disabled={isProcessing}
                >
                  {isProcessing === provider.slug ? (
                    <Loader2 className="animate-spin w-6 h-6" />
                  ) : (
                    <>
                      {provider.logo_url && <img src={provider.logo_url} alt={provider.name} className="h-6 w-auto mr-3" />}
                      Payer avec {provider.name}
                    </>
                  )}
                </Button>
              ))
            ) : (
              <p className="text-center text-destructive">Aucune méthode de paiement en ligne n'est disponible pour le moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}