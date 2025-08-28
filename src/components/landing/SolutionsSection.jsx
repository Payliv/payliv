import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, Truck, ArrowRight } from 'lucide-react';

const SolutionCard = ({ icon: Icon, title, description, link }) => (
  <motion.div 
    className="relative"
    whileHover={{ y: -5 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <Link to={link} className="block glass-effect p-8 rounded-2xl h-full text-left group">
      <div className="w-16 h-16 mb-6 bg-gradient-to-br from-secondary to-primary/50 rounded-full flex items-center justify-center">
        <Icon className="w-8 h-8 text-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <span className="font-semibold text-primary flex items-center group-hover:underline">
        En savoir plus <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  </motion.div>
);

const SolutionsSection = () => {
  return (
    <section id="solutions" className="py-20 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Choisissez le modèle qui vous correspond</h2>
          <p className="mt-4 text-lg text-muted-foreground">Que vous ayez votre propre stock ou que vous préfériez le dropshipping, PayLiv est fait pour vous.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <SolutionCard
            icon={Box}
            title="E-commerce Traditionnel"
            description="Vendez vos propres produits, maîtrisez votre stock et construisez une marque forte avec votre boutique en ligne."
            link="/solutions/ecommerce-traditionnel"
          />
          <SolutionCard
            icon={Truck}
            title="Dropshipping"
            description="Lancez-vous sans stock en vendant les produits de nos fournisseurs partenaires. Idéal pour démarrer rapidement."
            link="/solutions/dropshipping"
          />
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;