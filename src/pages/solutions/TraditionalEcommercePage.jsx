import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Box, Package, Users, Store, CheckCircle, Zap } from 'lucide-react';

const FeaturePoint = ({ icon, title, children }) => {
  const Icon = icon;
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground mt-1">{children}</p>
      </div>
    </div>
  );
};

export default function TraditionalEcommercePage() {
  return (
    <>
      <Helmet>
        <title>E-commerce Traditionnel - Vendez vos propres produits | PayLiv</title>
        <meta name="description" content="Découvrez comment vendre vos propres produits en ligne avec PayLiv. Maîtrisez votre stock, construisez votre marque et gérez vos livraisons facilement." />
      </Helmet>
      <div className="bg-background">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-primary/5 to-background pt-24 pb-16 sm:pt-32 sm:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block bg-primary/10 text-primary p-3 rounded-full mb-4">
                <Box className="w-8 h-8" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight gradient-text">
                E-commerce Traditionnel : Vendez Vos Propres Produits
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg lg:text-xl text-muted-foreground">
                Prenez le contrôle total de votre business. Vendez vos produits, gérez votre stock et construisez une marque qui vous ressemble avec les outils puissants de PayLiv.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link to="/signup">
                  Créer ma boutique <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* How it works Section */}
        <div className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight">Comment ça marche ?</h2>
              <p className="mt-4 text-lg text-muted-foreground">Lancez votre boutique en 4 étapes simples.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[{
                icon: Store,
                title: "Créez votre boutique",
                desc: "Personnalisez une belle boutique en ligne en quelques clics, sans compétences techniques."
              }, {
                icon: Package,
                title: "Ajoutez vos produits",
                desc: "Mettez en ligne vos articles, ajoutez des photos, des descriptions et gérez votre stock."
              }, {
                icon: Users,
                title: "Gérez vos commandes",
                desc: "Recevez et traitez vos commandes depuis un tableau de bord centralisé et intuitif."
              }, {
                icon: CheckCircle,
                title: "Livrez et soyez payé",
                desc: "Organisez vos livraisons et gérez le paiement à la livraison pour maximiser la confiance."
              }].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="p-6 bg-background/50 rounded-xl h-full">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-secondary to-primary/50 rounded-full flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 sm:py-24 bg-background/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-3 lg:gap-12 items-center">
              <div className="lg:col-span-1">
                <h2 className="text-3xl font-bold tracking-tight">Les outils pour réussir votre e-commerce</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  PayLiv vous fournit tout ce dont vous avez besoin pour gérer efficacement votre boutique de A à Z.
                </p>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-2">
                <dl className="space-y-10">
                  <FeaturePoint icon={Package} title="Gestion de stock simplifiée">
                    Suivez vos quantités en temps réel pour ne jamais vendre un produit en rupture. Mettez à jour votre inventaire facilement depuis votre tableau de bord.
                  </FeaturePoint>
                  <FeaturePoint icon={CheckCircle} title="Contrôle total sur votre marque">
                    Votre boutique, vos règles. Personnalisez le design, les prix, et la communication pour créer une expérience client unique et mémorable.
                  </FeaturePoint>
                  <FeaturePoint icon={Users} title="Fidélisation des clients">
                    Accédez aux informations de vos clients pour créer des campagnes marketing ciblées et construire une relation durable.
                  </FeaturePoint>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24">
          <div className="max-w-4xl mx-auto text-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block bg-primary/20 text-primary p-3 rounded-full mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold">Prêt à vendre vos propres produits ?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Rejoignez la communauté d'entrepreneurs qui ont choisi PayLiv pour construire leur empire en ligne.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link to="/signup">
                  Commencer gratuitement <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}