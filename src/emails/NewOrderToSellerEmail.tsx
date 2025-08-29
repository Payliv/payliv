import * as React from 'react';

interface NewOrderToSellerEmailProps {
  orderId: string;
  customerName: string;
  items: any[];
  total: number;
  currency: string;
  orderUrl: string;
}

export const NewOrderToSellerEmail: React.FC<Readonly<NewOrderToSellerEmailProps>> = ({ orderId, customerName, items, total, currency, orderUrl }) => (
  <div>
    <h1>Nouvelle commande ! 🎉</h1>
    <p>Vous avez une nouvelle commande de <strong>{customerName}</strong>.</p>
    <h3>Détails de la commande #{orderId.substring(0, 8)}:</h3>
    <ul>
      {items.map((item: any) => (
        <li key={item.product_id}>{item.name} (x{item.quantity}) - {item.price} {currency}</li>
      ))}
    </ul>
    <p><strong>Total : {total} {currency}</strong></p>
    <p>Connectez-vous à votre tableau de bord pour la gérer.</p>
    <a href={orderUrl}>Voir la commande</a>
  </div>
);