import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({ name, dashboardUrl }) => (
  <div>
    <h1>Bienvenue sur PayLiv, {name}!</h1>
    <p>Nous sommes ravis de vous compter parmi nous.</p>
    <p>
      Votre boutique digitale a été pré-créée pour vous faire gagner du temps.
      Vous pouvez commencer à ajouter vos produits et à la personnaliser dès maintenant.
    </p>
    <a href={dashboardUrl}>Accéder à mon tableau de bord</a>
    <p>L'équipe PayLiv</p>
  </div>
);