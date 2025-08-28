import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Palette, Package, Settings, Rocket } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const HowToCreateStore = () => {
  const steps = [
    {
      icon: ShoppingCart,
      title: "Étape 1 : Accédez à la section 'Mes Boutiques'",
      description: "Depuis votre tableau de bord, cliquez sur 'Mes Boutiques' dans le menu de gauche. C'est ici que vous pouvez voir toutes vos boutiques existantes et en créer de nouvelles.",
      image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/c772340fd6383dad3f1ac19d96b4b9cc.jpg",
      alt: "Tableau de bord de la plateforme montrant la section Mes Boutiques"
    },
    {
      icon: Palette,
      title: "Étape 2 : Créez et personnalisez votre boutique",
      description: "Cliquez sur 'Créer une boutique'. Vous serez dirigé vers l'éditeur de boutique où vous pourrez choisir un nom, ajouter un logo, et personnaliser les couleurs et les polices pour correspondre à votre marque.",
      image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/0cacb05bc2ba2883903a60e521399483.jpg",
      alt: "Éditeur de boutique montrant les options de personnalisation du design"
    },
    {
      icon: Package,
      title: "Étape 3 : Ajoutez vos produits",
      description: "Allez dans l'onglet 'Produits' pour ajouter vos articles. Renseignez le nom, la description, le prix et ajoutez des photos de haute qualité pour chaque produit.",
      image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/3b2f1d9c45b410d40c3af404edb9235e.jpg",
      alt: "Interface d'ajout de produits dans l'éditeur de boutique"
    },
    {
      icon: Settings,
      title: "Étape 4 : Configurez les paramètres",
      description: "Dans l'onglet 'Paramètres', configurez les options de paiement (comme le paiement à la livraison), les frais de livraison, la devise et les informations SEO pour votre boutique.",
      image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/1b980a2dcb1a71e7bb6344176c832fe9.jpg",
      alt: "Écran des paramètres de la boutique avec les options de paiement et de livraison"
    },
    {
      icon: Rocket,
      title: "Étape 5 : Sauvegardez et déployez !",
      description: "Une fois que tout est configuré comme vous le souhaitez, cliquez sur 'Sauvegarder', puis sur 'Déployer'. Votre boutique sera instantanément mise en ligne, prête à recevoir des commandes.",
      image: "https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/6acbe35bc913e5b51a65118e97d249f3.jpg",
      alt: "Bouton de déploiement dans l'éditeur de boutique"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Comment Créer une Boutique - PayLiv</title>
        <meta name="description" content="Suivez notre guide étape par étape pour créer, personnaliser et lancer votre boutique en ligne sur PayLiv. De l'ajout de produits au déploiement." />
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center my-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight gradient-text mb-4">
            Créez votre boutique en 5 étapes faciles
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            De l'idée à la première vente, suivez ce guide simple pour mettre votre commerce en ligne avec PayLiv.
          </p>
        </motion.div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
                index % 2 !== 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="md:w-1/2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{step.title}</h2>
                </div>
                <p className="text-muted-foreground text-base leading-relaxed">{step.description}</p>
              </div>

              <div className="md:w-1/2 w-full">
                <img
                  src={step.image}
                  alt={step.alt}
                  className="rounded-xl shadow-2xl shadow-primary/10 aspect-video object-cover object-top w-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HowToCreateStore;