import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone } from 'lucide-react';
import { AfricaFlags } from '@/components/AfricaFlags';
import MobileMoneyLogos from '@/components/MobileMoneyLogos';

const PaymentInfoSection = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Smartphone className="w-10 h-10 text-primary" />
            <CreditCard className="w-10 h-10 text-muted-foreground/50 relative">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: [1, 1.2, 1], rotate: [-10, 10, -10, 0] }} 
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }} 
                className="absolute inset-0 bg-red-500/80 mix-blend-screen" 
                style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 15%, 15% 100%)' }} 
              />
            </CreditCard>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Payez par Mobile Money, sans carte bancaire</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Activez votre abonnement en toute sécurité avec les moyens de paiement que vous utilisez déjà.</p>
          <div className="mt-8">
            <MobileMoneyLogos />
          </div>
        </div>

        <div className="text-center mt-20">
           <h3 className="text-2xl font-bold text-foreground mb-2">Disponible dans toute l'Afrique francophone</h3>
           <p className="text-md text-muted-foreground mb-8">Nous couvrons les pays de l'UEMOA, de la CEMAC et au-delà.</p>
           <AfricaFlags />
        </div>
      </div>
    </section>
  );
};

export default PaymentInfoSection;