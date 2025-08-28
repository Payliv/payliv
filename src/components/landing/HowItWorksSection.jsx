import React from 'react';
import { motion } from 'framer-motion';
import { Store, Megaphone, Wallet } from 'lucide-react';

const StepCard = ({ icon: Icon, title, description, stepNumber }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center text-center"
    >
      <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-secondary to-primary/50 rounded-full flex items-center justify-center border-4 border-background">
        <Icon className="w-10 h-10 text-foreground" />
      </div>
      <div className="absolute top-10 left-1/2 w-0.5 h-full bg-border -z-0"></div>
      <h3 className="mt-6 text-xl font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Lancez-vous en 3 étapes simples</h2>
          <p className="mt-4 text-lg text-muted-foreground">De l'idée à la première vente, PayLiv vous accompagne.</p>
        </div>
        <div className="relative">
          <div className="absolute top-10 left-0 right-0 h-0.5 bg-border hidden md:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <StepCard
              icon={Store}
              title="1. Créez votre boutique"
              description="Choisissez un abonnement, personnalisez votre design et ajoutez vos produits en quelques clics."
            />
            <StepCard
              icon={Megaphone}
              title="2. Vendez vos produits"
              description="Partagez votre boutique et commencez à recevoir des commandes avec paiement à la livraison ou en ligne."
            />
            <StepCard
              icon={Wallet}
              title="3. Encaissez vos revenus"
              description="Gérez vos commandes, suivez vos livraisons et retirez vos gains facilement via Mobile Money."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;