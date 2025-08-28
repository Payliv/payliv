import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const AffiliateSection = () => {
  return (
    <section id="affiliation" className="py-20 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, amount: 0.5 }} 
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Devenez Partenaire et Gagnez des Revenus</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Rejoignez notre programme d'affiliation, recommandez PayLiv à votre audience et touchez des commissions sur chaque nouvel abonné.</p>
          <Button asChild size="lg" className="mt-8 bg-gradient-to-r from-secondary to-primary text-primary-foreground hover:opacity-90 text-lg px-8 py-6 shadow-lg">
            <Link to="/affiliation">
              Découvrir le programme d'affiliation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default AffiliateSection;