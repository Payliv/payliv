import React from 'react';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NetworkStatusIndicator = () => {
  return (
    <div className="bg-destructive text-destructive-foreground p-3 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
      <WifiOff className="w-6 h-6 flex-shrink-0" />
      <div className="flex-grow">
        <p className="font-bold">Erreur de connexion</p>
        <p className="text-sm">Impossible de communiquer avec le serveur. Veuillez vérifier votre connexion internet.</p>
      </div>
      <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Réessayer</Button>
    </div>
  );
};

export default NetworkStatusIndicator;
