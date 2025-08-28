import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité - PayLiv</title>
        <meta name="description" content="Consultez la politique de confidentialité de PayLiv pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles." />
      </Helmet>
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight text-center gradient-text">Politique de Confidentialité</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none text-muted-foreground space-y-6">
            <p className="text-center text-sm">Dernière mise à jour : 15 juillet 2025</p>
            
            <p>Bienvenue sur PayLiv. PayLiv est un produit de l'entreprise <strong>G-STARTUP LTD</strong>, enregistrée au Niger, au Nigeria et en Côte d'Ivoire. Votre vie privée est d'une importance capitale pour nous. Cette Politique de Confidentialité a pour but de vous informer sur la manière dont nous collectons, utilisons, et protégeons vos informations personnelles lorsque vous utilisez nos services.</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">1. Informations que nous collectons</h2>
            <p>Nous collectons plusieurs types d'informations, notamment :</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Informations d'identification personnelle :</strong> Nom, adresse e-mail, numéro de téléphone, que vous nous fournissez lors de votre inscription.</li>
              <li><strong>Informations sur votre boutique :</strong> Nom de la boutique, produits, commandes, et données clients nécessaires à l'exploitation de votre boutique en ligne.</li>
              <li><strong>Données de navigation :</strong> Informations sur la manière dont vous utilisez notre site, telles que les pages visitées, le temps passé, et votre adresse IP, collectées via des cookies et technologies similaires.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">2. Comment nous utilisons vos informations</h2>
            <p>Les informations collectées sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Fournir, maintenir et améliorer nos services.</li>
              <li>Personnaliser votre expérience et celle de vos clients.</li>
              <li>Traiter les transactions et envoyer des notifications relatives aux commandes.</li>
              <li>Communiquer avec vous, notamment pour le support client et les informations marketing (avec votre consentement).</li>
              <li>Assurer la sécurité de notre plateforme et prévenir la fraude.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">3. Partage de vos informations</h2>
            <p>Nous ne vendons ni ne louons vos informations personnelles. Nous pouvons partager vos informations avec :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Des fournisseurs de services tiers (hébergement, traitement des paiements) qui nous aident à exploiter notre plateforme.</li>
              <li>Les autorités légales si la loi l'exige ou pour protéger nos droits.</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground pt-4">Partage dans le cadre du Dropshipping</h3>
            <p>Dans le cadre du modèle de dropshipping, un partage d'informations limité est nécessaire entre les Vendeurs et les Fournisseurs pour assurer le traitement des commandes :</p>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Du Vendeur au Fournisseur :</strong> Lorsqu'un Vendeur réalise une vente d'un produit en dropshipping, les informations de livraison du client final (nom, adresse, numéro de téléphone) sont transmises au Fournisseur concerné afin que ce dernier puisse expédier le produit.</li>
                <li><strong>Du Fournisseur au Vendeur :</strong> Le Vendeur a accès aux informations du produit fourni par le Fournisseur (nom, description, prix de gros), mais pas aux informations personnelles ou commerciales sensibles du Fournisseur.</li>
            </ul>
            <p>Chaque partie s'engage à n'utiliser ces informations que dans le but exclusif de l'exécution des commandes.</p>


            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">4. Sécurité de vos données</h2>
            <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles robustes pour protéger vos informations contre l'accès non autorisé, la modification, la divulgation ou la destruction.</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">5. Vos droits</h2>
            <p>Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Vous pouvez exercer ces droits en nous contactant via notre page de support.</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">6. Modifications de cette politique</h2>
            <p>Nous pouvons mettre à jour cette politique de temps à autre. Nous vous notifierons de tout changement majeur par e-mail ou via une notification sur notre plateforme.</p>

            <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2">7. Nous contacter</h2>
            <p>Pour toute question relative à cette politique de confidentialité, veuillez nous contacter à l'adresse <a href="mailto:privacy@payliv.pro" className="text-primary hover:underline">privacy@payliv.pro</a>. PayLiv est un service de G-STARTUP LTD. Pour plus d'informations sur notre entreprise, visitez <a href="https://gstartup.pro" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gstartup.pro</a>.</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PrivacyPolicy;