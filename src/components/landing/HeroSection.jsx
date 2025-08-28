import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Box, CreditCard, ShoppingBag } from 'lucide-react';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const featureVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    }
  };

  return (
    <main className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slow animation-delay-4000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[90vh] lg:min-h-screen pt-32 pb-16 lg:pt-24">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center lg:text-left">
            <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary">
              E-commerce, Dropshipping & Produits digitaux en Afrique.
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-muted-foreground">
                Créez votre boutique en ligne, vendez en dropshipping ou via la marketplace. PayLiv gère tout.
            </motion.p>
            
            <motion.div 
                variants={containerVariants}
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto lg:mx-0"
            >
                <motion.div variants={featureVariants} className="bg-card/50 p-4 rounded-lg border border-border/20 flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-md">
                        <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Paiement en Ligne</h3>
                        <p className="text-sm text-muted-foreground">Automatisé pour vos produits digitaux.</p>
                    </div>
                </motion.div>
                <motion.div variants={featureVariants} className="bg-card/50 p-4 rounded-lg border border-border/20 flex items-center gap-4">
                     <div className="bg-primary/10 p-3 rounded-md">
                        <Box className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Paiement à la Livraison</h3>
                        <p className="text-sm text-muted-foreground">Géré par vous pour les produits physiques.</p>
                    </div>
                </motion.div>
            </motion.div>

            <motion.p variants={itemVariants} className="mt-8 max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-muted-foreground">
                Une plateforme tout-en-un, pensée pour l’Afrique. Le business en ligne, enfin simplifié.
            </motion.p>
            
            <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-accent text-lg px-8 py-6 shadow-lg shadow-primary/20 w-full sm:w-auto">
                <Link to="/signup">
                  Lancer ma boutique
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                <Link to="/pricing">
                  Découvrir nos offres
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
            className="relative"
          >
            <div className="relative aspect-square animate-float">
              <img  className="absolute inset-0 w-full h-full object-contain" alt="Entrepreneuse souriante présentant un sac à main dans sa boutique" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/e78c097bd9dafd17c9d988a5a663a672.jpg" />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;