import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Book, CreditCard, LifeBuoy, ShoppingCart, Package, Download, Users, Banknote } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Section = ({ title, description, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-12"
  >
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p className="text-muted-foreground mb-6">{description}</p>
    {children}
  </motion.div>
);

const CodeBlock = ({ children }) => (
    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto my-2">
        <code>
            {children}
        </code>
    </pre>
);

const AlertBlock = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300",
    warning: "bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300"
  };
  return (
    <div className={`border-l-4 p-4 my-4 ${variants[variant]}`} role="alert">
      {children}
    </div>
  );
};

const DocItem = ({ icon, title, children }) => (
    <AccordionItem value={title}>
        <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center">
                {icon}
                <span className="ml-3">{title}</span>
            </div>
        </AccordionTrigger>
        <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pl-10">
            {children}
        </AccordionContent>
    </AccordionItem>
);

export default function DocumentationPage() {
  return (
    <>
      <Helmet>
        <title>Documentation - PayLiv</title>
        <meta name="description" content="Explorez la documentation de PayLiv pour créer votre boutique, vendre des produits, et comprendre notre système de paiement et de commissions." />
      </Helmet>
      <div className="container mx-auto px-4 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-4">Documentation PayLiv</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Votre guide complet pour construire, intégrer et réussir avec la plateforme PayLiv.
          </p>
        </motion.div>

        <Section title="Guide d'Utilisation de la Plateforme" description="Apprenez à maîtriser les fonctionnalités clés de PayLiv pour lancer et gérer votre business en ligne.">
            <Accordion type="single" collapsible className="w-full">
                <DocItem icon={<ShoppingCart className="w-5 h-5 text-primary" />} title="Comment créer sa boutique ?">
                    <p>Lancer votre boutique sur PayLiv est un jeu d'enfant. Suivez ces étapes :</p>
                    <ol>
                        <li>Depuis votre tableau de bord principal, cliquez sur le bouton <strong>"Créer une boutique"</strong>.</li>
                        <li>Remplissez les informations demandées : le nom de votre boutique, son URL (slug), et une brève description.</li>
                        <li>Personnalisez l'apparence avec votre logo et une image de couverture.</li>
                        <li>Votre boutique est prête ! Vous pouvez commencer à y ajouter des produits.</li>
                    </ol>
                </DocItem>
                <DocItem icon={<Package className="w-5 h-5 text-primary" />} title="Comment ajouter ses propres produits ?">
                    <p>Vous pouvez vendre deux types de produits : physiques et digitaux.</p>
                    <ol>
                        <li>Allez dans le tableau de bord de votre boutique et cliquez sur l'onglet <strong>"Produits"</strong>.</li>
                        <li>Cliquez sur <strong>"Ajouter un produit"</strong>.</li>
                        <li>Remplissez les détails : nom, description, prix, et ajoutez des images de haute qualité.</li>
                        <li>Choisissez le type de produit : <strong>"Physique"</strong> ou <strong>"Digital"</strong>.</li>
                        <li>Si c'est un produit digital, téléversez le fichier que vos clients recevront après l'achat.</li>
                        <li>Enregistrez, et votre produit est immédiatement disponible à la vente.</li>
                    </ol>
                </DocItem>
                <DocItem icon={<Download className="w-5 h-5 text-primary" />} title="Comment importer les produits en dropshipping ?">
                    <p>Le dropshipping vous permet de vendre des produits sans gérer de stock. Voici comment faire :</p>
                    <ol>
                        <li>Dans votre tableau de bord utilisateur, allez dans la section <strong>"Dropshipping"</strong>.</li>
                        <li>Parcourez le catalogue de produits de nos partenaires fournisseurs.</li>
                        <li>Lorsque vous trouvez un produit qui vous plaît, cliquez sur <strong>"Importer dans ma boutique"</strong>.</li>
                        <li>Choisissez la boutique de destination.</li>
                        <li>Le produit est automatiquement ajouté à votre liste de produits. Vous pouvez modifier son prix de vente pour définir votre marge.</li>
                    </ol>
                </DocItem>
                <DocItem icon={<Package className="w-5 h-5 text-primary" />} title="Comment se passe la vente des produits physiques ?">
                    <p>La vente de produits physiques repose principalement sur le <strong>paiement à la livraison</strong>.</p>
                    <ul>
                        <li>Lorsqu'un client passe une commande, vous recevez une notification et la commande apparaît dans votre onglet <strong>"Commandes"</strong> avec le statut "En attente".</li>
                        <li>Vous êtes responsable de l'emballage et de l'expédition du produit au client.</li>
                        <li>Le paiement est collecté <strong>directement par vous</strong> ou votre livreur au moment de la livraison.</li>
                        <li>Une fois la livraison effectuée et le paiement reçu, vous devez marquer la commande comme <strong>"Livrée"</strong> dans votre tableau de bord.</li>
                    </ul>
                    <AlertBlock variant="warning">
                      <p className="font-bold">Important</p>
                      <p>Les revenus des ventes de produits physiques payés à la livraison ne sont pas crédités sur votre solde PayLiv, car vous les collectez vous-même.</p>
                    </AlertBlock>
                </DocItem>
                <DocItem icon={<Download className="w-5 h-5 text-primary" />} title="Comment se passe la vente des produits digitaux ?">
                    <p>La vente de produits digitaux est entièrement automatisée pour vous faire gagner du temps.</p>
                    <ul>
                        <li>Le client doit payer le produit en ligne via l'un de nos moyens de paiement intégrés (Mobile Money, Carte bancaire).</li>
                        <li>Dès que le paiement est confirmé, notre système envoie <strong>automatiquement</strong> un e-mail au client contenant un lien de téléchargement sécurisé.</li>
                        <li>La commande est marquée comme "Payée" et "Livrée" sans aucune action de votre part.</li>
                        <li>Le montant de la vente est instantanément crédité sur votre <strong>solde retirable PayLiv</strong>.</li>
                    </ul>
                </DocItem>
                <DocItem icon={<Users className="w-5 h-5 text-primary" />} title="Comment fonctionnent les commissions ?">
                    <p>Notre système de commission est transparent et conçu pour être juste pour tout le monde.</p>
                    <h4>Vente directe (Produits physiques ou digitaux propres)</h4>
                    <p>Le vendeur conserve <strong>100% des revenus</strong> de la vente. Les frais de PayLiv sont couverts par votre abonnement mensuel ou annuel, pas par des commissions sur vos ventes directes.</p>
                    <h4>Vente en Dropshipping</h4>
                    <ul>
                        <li>Le <strong>Partenaire (fournisseur)</strong> définit un "prix de gros". C'est le montant qu'il souhaite recevoir pour son produit.</li>
                        <li>Le <strong>Vendeur (vous)</strong> définit un "prix de vente" public.</li>
                        <li>Votre commission est la différence : <code>(Prix de vente - Prix de gros)</code>.</li>
                        <li>Lors d'une vente, si le paiement est fait en ligne, le système répartit automatiquement les fonds. Votre commission est alors ajoutée à votre <strong>solde retirable PayLiv</strong>.</li>
                    </ul>
                </DocItem>
                <DocItem icon={<Banknote className="w-5 h-5 text-primary" />} title="Comment se passent les retraits ?">
                    <p>Retirez les gains collectés par la plateforme en toute simplicité.</p>
                    <AlertBlock>
                      <p className="font-bold">Quel est le solde retirable ?</p>
                      <p>Votre solde retirable comprend uniquement les fonds qui ont été traités par les systèmes de paiement de PayLiv. Cela inclut :</p>
                      <ul className="list-disc list-inside mt-2">
                          <li>Les revenus des ventes de <strong>produits digitaux</strong>.</li>
                          <li>Les commissions gagnées sur les ventes en <strong>dropshipping</strong> (si payées en ligne).</li>
                          <li>Les commissions de votre programme d'<strong>affiliation</strong>.</li>
                      </ul>
                      <p className="mt-2">Les paiements à la livraison pour les produits physiques ne font pas partie de ce solde.</p>
                    </AlertBlock>
                    <ol className="mt-4">
                        <li>Rendez-vous dans la section <strong>"Finance"</strong> ou <strong>"Portefeuille"</strong> de votre tableau de bord.</li>
                        <li>Votre solde disponible retirable y est affiché en temps réel.</li>
                        <li>Cliquez sur <strong>"Demander un retrait"</strong>.</li>
                        <li>Indiquez le montant que vous souhaitez retirer et choisissez votre méthode de paiement (ex: Orange Money, Wave, etc.).</li>
                        <li>Votre demande est envoyée à notre équipe financière pour traitement. Vous pouvez suivre son statut (En attente, Approuvée, Traitée) directement depuis votre tableau de bord.</li>
                    </ol>
                </DocItem>
            </Accordion>
        </Section>
      </div>
    </>
  );
}