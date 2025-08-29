import * as React from 'react';

interface NewDropshipOrderToPartnerEmailProps {
  orderId: string;
  sellerStoreName: string;
  customer: any;
  items: any[];
  partnerOrdersUrl: string;
}

export const NewDropshipOrderToPartnerEmail: React.FC<Readonly<NewDropshipOrderToPartnerEmailProps>> = ({ orderId, sellerStoreName, customer, items, partnerOrdersUrl }) => (
  <div>
    <h1>Nouvelle commande dropshipping à traiter !</h1>
    <p>La boutique <strong>{sellerStoreName}</strong> a vendu un ou plusieurs de vos produits.</p>
    <h3>Détails de la commande #{orderId.substring(0, 8)}:</h3>
    <ul>
      {items.map((item: any) => (
        <li key={item.id}>Produit: {item.product_name} (x{item.quantity})</li>
      ))}
    </ul>
    <h3>Informations de livraison :</h3>
    <p>Client: {customer.name}</p>
    <p>Téléphone: {customer.phone}</p>
    <p>Ville: {customer.city}</p>
    <p>Veuillez préparer et expédier la commande dès que possible.</p>
    <a href={partnerOrdersUrl}>Gérer mes commandes dropshipping</a>
  </div>
);