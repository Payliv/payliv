import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function SubscriptionStatusBanner() {
  const { profile, isSubscriptionActive } = useProfile();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (!isVisible || isSubscriptionActive || profile?.role === 'superadmin') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "mb-6 p-4 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4",
          "bg-red-500/10 border-red-500/30 text-red-200"
        )}
      >
        <div className="flex items-center gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <p className="font-medium">Votre abonnement est inactif. Pour continuer à utiliser nos services, veuillez vous abonner.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Button
            onClick={() => handleNavigation('/pricing')}
            className={cn("w-full sm:w-auto", "bg-red-500 hover:bg-red-600 text-white")}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            S'abonner maintenant
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}