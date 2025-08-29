import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DigitalCheckoutPage = () => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};
  const { user } = useAuth();
  const { toast } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setCustomerName(user.profile?.name || '');
      setCustomerEmail(user.email || '');
      setCustomerPhone(user.profile?.whatsapp_number || '');
    }
  }, [user]);

  if (!product) {
    return <div>Produit non trouvé. Veuillez retourner à la boutique.</div>;
  }

  const handlePayment = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);

    try {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                storeId: product.store_id,
                items: [{
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                }],
                customer: {
                    name: customerName,
                    email: customerEmail,
                    phone: customerPhone,
                },
                isDigital: true,
            },
        });

        if (error) throw error;

        if (data.payment_url) {
            window.location.href = data.payment_url;
        } else {
            throw new Error('URL de paiement non reçue.');
        }
    } catch (error: any) {
        console.error('Payment initiation failed:', error);
        toast({
            title: 'Échec du paiement',
            description: error.message || "Impossible d'initier le paiement. Veuillez réessayer.",
            variant: 'destructive',
        });
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Finaliser votre achat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 border rounded-lg">
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-lg">{product.price} XOF</p>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Nom complet"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Adresse e-mail"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
            <Input
              placeholder="Numéro de téléphone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            <Button onClick={handlePayment} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Payer maintenant'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalCheckoutPage;