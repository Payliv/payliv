import * as React from 'react';

interface NewOrderToCustomerEmailProps {
  orderId: string;
  storeName: string;
  items: any[];
  total: number;
  currency: string;
}

export const NewOrderToCustomerEmail: React.FC<Readonly<NewOrderToCustomerEmailProps>> = ({ orderId, storeName, items, total, currency }) => (
  <div>
    <h1>Merci pour votre commande !</h1>
    <p>Votre commande #{orderId.substring(0, 8)} auprès de <strong>{storeName}</strong> a bien été reçue.</p>
    <h3>Détails de la commande :</h3>
    <ul>
      {items.map((item: any) => (
        <li key={item.product_id}>{item.name} (x{item.quantity}) - {item.price} {currency}</li>
      ))}
    </ul>
    <p><strong>Total : {total} {currency}</strong></p>
    <p>Le vendeur vous contactera bientôt pour la livraison. Si vous avez des questions, veuillez le contacter directement.</p>
  </div>
);