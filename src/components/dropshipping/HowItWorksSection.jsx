import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Package, Users, Ship, ShieldCheck } from 'lucide-react';

const howItWorksSteps = [
  {
    icon: Zap,
    title: "1. Inscription Rapide",
    description: "Devenez partenaire avec un paiement unique de 25.000 FCFA pour un accès à vie. Pas de frais récurrents."
  },
  {
    icon: Package,
    title: "2. Créez votre Catalogue",
    description: "Ajoutez vos produits, vos prix de gros et des visuels de qualité depuis votre tableau de bord fournisseur."
  },
  {
    icon: Users,
    title: "3. Connectez-vous aux Vendeurs",
    description: "Vos produits sont instantanément disponibles pour des milliers de vendeurs qui peuvent les ajouter à leur boutique en un clic."
  },
  {
    icon: Ship,
    title: "4. Gérez les Commandes",
    description: "Recevez les notifications de commande, préparez vos colis et expédiez-les directement aux clients finaux."
  },
  {
    icon: ShieldCheck,
    title: "5. Recevez vos Paiements",
    description: "Votre argent est automatiquement crédité sur votre solde PayLiv après chaque livraison confirmée. Simple, rapide et sécurisé."
  }
];

export const HowItWorksSection = () => (
  <section className="py-20 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Comment ça marche ?</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Devenir fournisseur sur PayLiv est un processus simple en 5 étapes.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {howItWorksSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="text-center"
          >
            <div className="flex justify-center items-center mb-4">
              <div className="bg-primary/10 text-primary p-4 rounded-full">
                <step.icon className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);