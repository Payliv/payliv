import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Truck, Store, Share2, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const dropshippingContent = (
  <div className="space-y-4 text-muted-foreground">
    <p>
      Le système de dropshipping sur PayLiv est conçu pour créer un pont de confiance entre deux types d'acteurs : les <strong>fournisseurs</strong> (ceux qui ont les produits) et les <strong>vendeurs</strong> (ceux qui ont les boutiques en ligne).
    </p>

    <h4 className="font-semibold text-foreground">Pour les Fournisseurs (Ceux qui ont le stock)</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Devenir Partenaire :</strong> Un fournisseur paie des frais d'inscription uniques de 50 000 FCFA pour un accès à vie à notre réseau de vendeurs.</li>
      <li><strong>Création du Profil :</strong> Notre équipe crée un profil public pour le fournisseur, présentant son entreprise et son catalogue de produits.</li>
      <li><strong>Recevoir les Commandes :</strong> Les vendeurs de PayLiv contactent le fournisseur pour vendre ses produits.</li>
      <li><strong>Gestion de la Livraison :</strong> Le fournisseur prépare et expédie la commande directement au client final. Il n'a pas à se soucier du marketing.</li>
    </ul>

    <h4 className="font-semibold text-foreground">Pour les Vendeurs (Ceux qui ont les boutiques)</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Choisir un Fournisseur :</strong> Le vendeur parcourt la liste des fournisseurs vérifiés et choisit des produits.</li>
      <li><strong>Vendre sans Stock :</strong> Le vendeur ajoute les produits à sa boutique PayLiv avec sa propre marge.</li>
      <li><strong>Transmettre la Commande :</strong> Quand un client achète, le vendeur encaisse le paiement et envoie les détails de la commande au fournisseur.</li>
      <li><strong>Gagner sa Commission :</strong> Une fois le produit livré, le fournisseur verse au vendeur sa commission.</li>
    </ul>

     <h4 className="font-semibold text-foreground">Le Rôle de PayLiv</h4>
    <p>
      PayLiv agit comme un <strong>tiers de confiance</strong>. Nous vérifions les fournisseurs, fournissons les outils aux vendeurs, et garantissons la confiance en appliquant des règles strictes (par exemple, un fournisseur qui ne paie pas est banni).
    </p>
  </div>
);

const marketplaceContent = (
  <div className="space-y-4 text-muted-foreground">
    <p>
      La Marketplace est une grande <strong>vitrine publique</strong> qui met en avant toutes les boutiques créées par les vendeurs sur notre plateforme. C'est comme un grand centre commercial en ligne.
    </p>

    <h4 className="font-semibold text-foreground">Quel est son but ?</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Pour les Visiteurs :</strong> Elle leur permet de découvrir de nouvelles boutiques et des produits intéressants.</li>
      <li><strong>Pour les Vendeurs :</strong> Elle leur offre une visibilité gratuite et automatique. Chaque nouvelle boutique est une source de nouveaux clients potentiels.</li>
    </ul>

    <h4 className="font-semibold text-foreground">Comment ça marche ?</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Listing Automatique :</strong> Chaque nouvelle boutique est automatiquement ajoutée à la Marketplace.</li>
      <li><strong>Navigation Facile :</strong> Les visiteurs accèdent à la Marketplace via le menu principal.</li>
      <li><strong>Recherche et Découverte :</strong> Ils peuvent explorer la grille des boutiques ou utiliser la barre de recherche.</li>
      <li><strong>Visiter une Boutique :</strong> En cliquant sur "Visiter la boutique", le visiteur est redirigé vers le site du vendeur pour faire ses achats.</li>
    </ul>
    <p>
      En résumé, la Marketplace est un écosystème gagnant-gagnant qui aide les vendeurs à obtenir plus de visibilité et offre aux acheteurs une expérience de shopping riche.
    </p>
  </div>
);

const affiliationContent = (
  <div className="space-y-4 text-muted-foreground">
    <p>
      Le programme d'affiliation vous <strong>récompense financièrement</strong> pour avoir recommandé PayLiv à d'autres personnes.
    </p>

    <h4 className="font-semibold text-foreground">Comment ça marche ?</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Inscription Automatique :</strong> Dès que vous créez un compte sur PayLiv, vous êtes automatiquement affilié.</li>
      <li><strong>Votre Lien Unique :</strong> Vous recevez un lien d'affiliation personnel dans votre tableau de bord "Affiliation".</li>
      <li><strong>Partagez et Gagnez :</strong> Partagez ce lien. Quand une personne s'inscrit et paie un abonnement via votre lien, vous touchez une <strong>commission de 30%</strong>.</li>
      <li><strong>Revenus à Vie :</strong> Vous touchez cette commission non seulement sur le premier paiement, mais sur <strong>chaque renouvellement</strong>, aussi longtemps que votre filleul reste abonné.</li>
    </ul>

    <h4 className="font-semibold text-foreground">Comment recevoir votre argent ?</h4>
    <ul className="list-disc pl-5 space-y-2">
      <li><strong>Suivi en Temps Réel :</strong> Votre tableau de bord vous montre vos gains.</li>
      <li><strong>Demande de Paiement :</strong> Vous pouvez demander un paiement dès que votre solde atteint le minimum requis.</li>
      <li><strong>Paiement Ultra-Rapide :</strong> Vos gains sont envoyés en moins de 5 minutes par Mobile Money, Nita, ou Crypto-monnaie (USDT).</li>
    </ul>
  </div>
);

const helpData = [
  {
    category: "Le Dropshipping sur PayLiv",
    icon: Truck,
    faqs: [
      {
        question: "Comment fonctionne le dropshipping sur PayLiv ?",
        answer: dropshippingContent,
      },
    ],
  },
  {
    category: "La Marketplace PayLiv",
    icon: Store,
    faqs: [
      {
        question: "C'est quoi, la Marketplace, et comment fonctionne-t-elle ?",
        answer: marketplaceContent,
      },
    ],
  },
  {
    category: "Le Programme d'Affiliation",
    icon: Share2,
    faqs: [
      {
        question: "Comment fonctionne le programme d'affiliation ?",
        answer: affiliationContent,
      },
    ],
  },
   {
    category: "Questions Générales",
    icon: HelpCircle,
    faqs: [
      {
        question: "Comment puis-je créer ma première boutique ?",
        answer: (
            <p className="text-muted-foreground">
                Nous avons un guide complet qui vous montre comment créer votre boutique étape par étape. {' '}
                <Link to="/how-to-create-store" className="text-primary font-semibold hover:underline">
                    Consultez le guide ici.
                </Link>
            </p>
        ),
      },
      {
        question: "Quels sont les tarifs de PayLiv ?",
        answer: (
            <p className="text-muted-foreground">
                Vous pouvez consulter tous nos plans et leurs fonctionnalités sur notre page des tarifs. {' '}
                <Link to="/pricing" className="text-primary font-semibold hover:underline">
                    Voir les tarifs.
                </Link>
            </p>
        ),
      },
      {
        question: "Comment contacter le support technique ?",
        answer: (
             <p className="text-muted-foreground">
                Pour toute question ou problème technique, vous pouvez nous contacter directement par email à{' '}
                <a href="mailto:support@payliv.pro" className="text-primary font-semibold hover:underline">
                    support@payliv.pro
                </a>.
                Notre équipe vous répondra dans les plus brefs délais.
            </p>
        ),
      },
    ],
  },
];

const HelpCenter = () => {
    return (
        <>
            <Helmet>
                <title>Centre d'Aide - PayLiv</title>
                <meta name="description" content="Trouvez des réponses à vos questions sur le dropshipping, la marketplace, l'affiliation et plus encore. Le centre d'aide PayLiv est là pour vous accompagner." />
            </Helmet>
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2">
                        Centre d'Aide
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Nous sommes là pour vous aider à chaque étape.
                    </p>
                </motion.div>

                <div className="space-y-10">
                    {helpData.map((section) => (
                        <motion.div 
                            key={section.category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="flex items-center text-2xl font-bold mb-4 text-foreground">
                                <section.icon className="mr-3 w-6 h-6 text-primary" />
                                {section.category}
                            </h2>
                            <Accordion type="single" collapsible className="w-full bg-card p-4 rounded-lg border">
                                {section.faqs.map((faq, faqIndex) => (
                                    <AccordionItem value={`item-${faqIndex}`} key={faqIndex} className="border-b-0">
                                        <AccordionTrigger className="text-left hover:no-underline text-base font-semibold">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-2 text-base">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default HelpCenter;