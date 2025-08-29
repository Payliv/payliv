import { useState } from 'react';
import { supabase } from '@/integrations/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  storeId: string;
}

const OrderModal = ({ isOpen, onClose, product, storeId }: OrderModalProps) => {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitOrder = async () => {
    if (!customerName || !customerPhone || !customerCity) {
      toast({ title: 'Veuillez remplir tous les champs requis.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.from('orders').insert([
        {
          store_id: storeId,
          customer: { name: customerName, phone: customerPhone, city: customerCity, email: customerEmail },
          items: [{ product_id: product.id, name: product.name, price: product.price, quantity: 1 }],
          total: product.price,
          currency: 'XOF',
          status: 'pending',
          payment_method: 'cod',
        },
      ]);
      if (error) throw error;
      toast({ title: 'Commande passée avec succès !', description: 'Le vendeur vous contactera bientôt.' });
      onClose();
    } catch (error: any) {
      toast({ title: 'Erreur lors de la commande', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Commander {product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input placeholder="Votre nom complet *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <Input placeholder="Votre numéro de téléphone *" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          <Input placeholder="Votre ville *" value={customerCity} onChange={(e) => setCustomerCity(e.target.value)} />
          <Input type="email" placeholder="Votre e-mail (facultatif)" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmitOrder} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirmer la commande'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderModal;