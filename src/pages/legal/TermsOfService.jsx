import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Conditions d'Utilisation - PayLiv</title>
        <meta name="description" content="Lisez les conditions d'utilisation de PayLiv. En utilisant nos services, vous acceptez ces conditions qui régissent votre accès et votre utilisation de la plateforme." />
      </Helmet>
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight text-center gradient-text">Conditions Générales d'Utilisation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none text-muted-foreground space-y-6">
            <p className="text-center text-sm">Dernière mise à jour : 15 juillet 2025</p>

            <p>Les présentes Conditions Générales d'Utilisation ("CGU") régissent votre accès et votre utilisation de la plateforme PayLiv, un service fourni par <strong>G-STARTUP LTD</strong>, une entreprise enregistrée au Niger, au Nigeria et en Côte d'Ivoire. En créant un compte ou en utilisant nos services, vous acceptez d'être lié par ces CGU.</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">1. Description du Service</h2>
            <p>PayLiv est une plateforme SaaS (Software as a Service) qui permet aux utilisateurs de créer et de gérer des boutiques en ligne, notamment pour l'e-commerce et le dropshipping, avec un focus sur le paiement à la livraison en Afrique. Le service est opéré par G-STARTUP LTD. Plus d'informations sur <a href="https://gstartup.pro" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gstartup.pro</a>.</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">2. Compte Utilisateur</h2>
            <p>Pour utiliser nos services, vous devez créer un compte. Vous êtes responsable de la sécurité de votre compte et de toutes les activités qui s'y déroulent. Vous vous engagez à fournir des informations exactes et à les maintenir à jour.</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">3. Utilisation Acceptable</h2>
            <p>Vous vous engagez à ne pas utiliser le service pour :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Vendre des produits illégaux, contrefaits ou dangereux.</li>
              <li>Mener des activités frauduleuses ou trompeuses.</li>
              <li>Violer les droits de propriété intellectuelle de tiers.</li>
              <li>Envoyer du spam ou des communications non sollicitées.</li>
              <li>Perturber le bon fonctionnement de la plateforme.</li>
            </ul>
            <p>Nous nous réservons le droit de suspendre ou de résilier tout compte qui enfreint ces règles.</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">4. Tarifs et Paiement</h2>
            <p>L'utilisation de PayLiv est soumise à des frais d'abonnement décrits sur notre page de <a href="/pricing" className="text-primary hover:underline">tarifs</a>. Les abonnements sont facturés périodiquement (mensuellement ou annuellement) et sont non remboursables, sauf indication contraire.</p>
            
            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">5. Rôles et Responsabilités des Vendeurs et Fournisseurs</h2>
            <p>La plateforme PayLiv distingue deux rôles principaux dans le cadre du dropshipping : les Vendeurs et les Fournisseurs (Partenaires).</p>
            <h3 className="text-xl font-semibold text-foreground pt-4">Pour les Vendeurs :</h3>
            <ul className="list-disc list-inside space-y-2">
                <li>Vous êtes responsable de la création de votre boutique, de la sélection des produits depuis la marketplace, de la fixation des prix de vente au détail et de la promotion de vos produits.</li>
                <li>Vous êtes le premier point de contact pour vos clients.</li>
                <li>Votre revenu est la commission, qui correspond à la différence entre votre prix de vente et le prix de gros fixé par le Fournisseur.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground pt-4">Pour les Fournisseurs (Partenaires) :</h3>
             <ul className="list-disc list-inside space-y-2">
                <li>Vous êtes responsable de la qualité, du stock et de l'exactitude des informations des produits que vous mettez à disposition sur la marketplace.</li>
                <li>Vous vous engagez à expédier les commandes aux clients finaux dans les délais convenus.</li>
                <li>Votre revenu correspond au prix de gros que vous avez fixé pour vos produits.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">6. Propriété Intellectuelle</h2>
            <p>La plateforme PayLiv, y compris son logiciel, son design et son contenu, est la propriété exclusive de G-STARTUP LTD. Vous conservez la pleine propriété de tout le contenu que vous téléchargez sur votre boutique (produits, images, textes).</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">7. Limitation de Responsabilité</h2>
            <p>PayLiv est fourni "tel quel". Nous ne garantissons pas que le service sera ininterrompu ou exempt d'erreurs. Notre responsabilité ne pourra être engagée pour tout dommage indirect, y compris la perte de profits ou de données, résultant de l'utilisation de notre service.</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">8. Résiliation</h2>
            <p>Vous pouvez résilier votre compte à tout moment. Nous pouvons également suspendre ou résilier votre compte si vous ne respectez pas ces CGU.</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">9. Droit Applicable</h2>
            <p>Ces CGU sont régies par le droit en vigueur dans les pays d'enregistrement de G-STARTUP LTD. Tout litige sera soumis à la compétence exclusive des tribunaux compétents de ces juridictions.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TermsOfService;