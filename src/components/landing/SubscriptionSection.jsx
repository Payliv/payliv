import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, Star, Loader2, Zap } from 'lucide-react';

const PricingCard = ({ plan, index, onChoosePlan }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay: index * 0.15 }} 
    className={`relative glass-effect rounded-2xl p-8 flex flex-col ${plan.is_popular ? 'border-2 border-primary shadow-lg shadow-primary/20' : 'border border-border'}`}
  >
    {plan.is_popular && (
      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
        <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center space-x-2">
          <Star className="w-4 h-4" />
          <span>Populaire</span>
        </div>
      </div>
    )}

    <div className="flex-grow">
      <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
      <div className="mb-8">
        <span className="text-5xl font-extrabold text-foreground">{plan.price}</span>
        <span className="text-lg text-muted-foreground ml-1">{plan.currency}</span>
        <span className="text-muted-foreground">/ {plan.frequency === 'monthly' ? 'mois' : 'an'}</span>
      </div>

      <ul className="space-y-4">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>

    <Button 
      onClick={() => onChoosePlan(plan)} 
      className={`w-full mt-10 py-6 text-lg font-bold transition-all ${plan.is_popular ? 'bg-primary text-primary-foreground hover:bg-accent' : 'bg-muted/40 text-foreground hover:bg-muted/80'}`}
    >
      <Zap className="w-5 h-5 mr-2" />
      Choisir {plan.name}
    </Button>
  </motion.div>
);

const SubscriptionSection = ({ plans, loading, onChoosePlan }) => {
  return (
    <section className="py-20 bg-background/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Des Abonnements simples et transparents</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Les abonnements sont uniquement requis pour les boutiques de produits physiques utilisant le paiement à la livraison.
            <br />
            <span className="font-semibold text-primary">Les boutiques pour produits digitaux sont entièrement gratuites !*</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">*Des frais de transaction s'appliquent sur les ventes.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <PricingCard key={plan.id} plan={plan} index={index} onChoosePlan={onChoosePlan} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SubscriptionSection;