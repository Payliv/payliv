import React from 'react';
import { Palette, ShoppingCart, Zap } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="glass-effect p-8 rounded-2xl text-center h-full">
    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-secondary to-primary/50 rounded-full flex items-center justify-center">
      <Icon className="w-8 h-8 text-foreground" />
    </div>
    <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">La solution complète pour la vente en ligne en Afrique</h2>
          <p className="mt-4 text-lg text-muted-foreground">Du dropshipping à la gestion des livraisons, tout est inclus.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon={Palette} title="Boutique en ligne personnalisée" description="Créez une boutique e-commerce professionnelle qui reflète votre marque, optimisée pour le marché africain." />
          <FeatureCard icon={ShoppingCart} title="Paiement à la livraison intégré" description="Gérez facilement les commandes avec paiement à la livraison, un atout majeur pour la confiance client en Afrique." />
          <FeatureCard icon={Zap} title="Dropshipping et Vente Directe" description="Lancez-vous dans le dropshipping ou vendez vos propres produits. PayLiv s'adapte à votre modèle de business." />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;