import * as React from 'react';

interface DigitalProductAccessEmailProps {
  customerName: string;
  orderId: string;
  purchasesUrl: string;
}

export const DigitalProductAccessEmail: React.FC<Readonly<DigitalProductAccessEmailProps>> = ({ customerName, orderId, purchasesUrl }) => (
  <div>
    <h1>Vos produits sont prêts !</h1>
    <p>Bonjour {customerName},</p>
    <p>Merci pour votre achat. Vos produits digitaux pour la commande #{orderId.substring(0, 8)} sont maintenant disponibles.</p>
    <p>Vous pouvez les télécharger à tout moment depuis votre espace personnel.</p>
    <a href={purchasesUrl}>Accéder à mes achats</a>
  </div>
);