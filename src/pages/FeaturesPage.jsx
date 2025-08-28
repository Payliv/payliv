import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Store,
  Paintbrush,
  Code,
  DollarSign,
  Truck,
  Users,
  BarChart2,
  Share2,
  ShieldCheck,
  CreditCard,
  Briefcase,
  Layers,
  Gift,
  DownloadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: delay * 0.1 }}
    className="bg-card/30 backdrop-blur-sm p-6 rounded-2xl border border-border/20 h-full flex flex-col items-start"
  >
    <div className="p-3 bg-primary/20 rounded-lg mb-4">
      <Icon className="w-7 h-7 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground text-sm flex-grow">{description}</p>
  </motion.div>
);

const featuresList = {
  "Boutique & Personnalisation": [
    { icon: Store, title: "Création de boutique intuitive", description: "Lancez votre boutique en quelques clics grâce à notre assistant de création simple et rapide." },
    { icon: Paintbrush, title: "Personnalisation complète", description: "Adaptez le design, les couleurs et les polices pour une boutique qui vous ressemble à 100%." },
    { icon: Code, title: "Nom de domaine personnalisé", description: "Utilisez votre propre nom de domaine pour renforcer votre marque et votre crédibilité." },
  ],
  "Produits & Ventes": [
    { icon: Briefcase, title: "Vente de produits physiques", description: "Gérez votre stock, vos variantes et expédiez vos propres produits facilement." },
    { icon: DownloadCloud, title: "Vente de produits digitaux", description: "Vendez des e-books, formations, ou logiciels avec livraison automatique et sécurisée." },
    { icon: Layers, title: "Dropshipping intégré", description: "Accédez à un catalogue de fournisseurs partenaires et importez des produits en un clic." },
    { icon: Gift, title: "Gestion des promotions", description: "Créez des offres spéciales avec des prix barrés et des comptes à rebours pour booster vos ventes." },
  ],
  "Paiements & Tarification": [
    { icon: Truck, title: "Paiement à la livraison", description: "Le mode de paiement préféré en Afrique, entièrement géré pour rassurer vos clients et maximiser les ventes." },
    { icon: CreditCard, title: "Paiements en ligne sécurisés", description: "Acceptez les paiements par Mobile Money et carte bancaire grâce à nos intégrations de passerelles locales." },
    { icon: DollarSign, title: "Tarification transparente", description: "Des frais clairs et prévisibles. Nous prélevons 3.5% sur les transactions via passerelle de paiement et 3% sur les retraits de votre solde." },
  ],
  "Marketing & Croissance": [
    { icon: BarChart2, title: "Tableau de bord analytique", description: "Suivez vos ventes, vos revenus, et comprenez le comportement de vos clients pour prendre les bonnes décisions." },
    { icon: Share2, title: "Programme d'affiliation", description: "Générez des revenus passifs en recommandant PayLiv. Vos affiliés gagnent aussi des commissions !" },
    { icon: Users, title: "Outils SEO & Pixels", description: "Optimisez votre référencement et intégrez vos pixels Facebook & TikTok pour des campagnes publicitaires efficaces." },
  ],
};

export default function FeaturesPage() {
  return (
    <>
      <Helmet>
        <title>Fonctionnalités - PayLiv</title>
        <meta name="description" content="Découvrez toutes les fonctionnalités de PayLiv pour créer et développer votre activité de e-commerce en Afrique. De la boutique personnalisable au dropshipping, en passant par les paiements locaux." />
      </Helmet>
      <div className="bg-background text-foreground">
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-br from-background via-background/80 to-primary/10"></div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl gradient-text">
                Une plateforme, <span className="text-primary">toutes</span> les fonctionnalités.
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto">
                PayLiv est conçu pour vous offrir tous les outils dont vous avez besoin pour réussir dans le e-commerce en Afrique, sans la complexité.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg" className="neon-glow">
                  <Link to="/signup">Démarrer gratuitement</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/pricing">Voir les tarifs</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {Object.entries(featuresList).map(([category, features], index) => (
              <div key={category} className="mb-20">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{category}</h2>
                  <Separator className="mt-4 w-24 mx-auto bg-primary h-1" />
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature, idx) => (
                    <FeatureCard
                      key={feature.title}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      delay={idx}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}