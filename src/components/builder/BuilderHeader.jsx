import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Rocket, Eye, View } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function BuilderHeader({ store, saveStore, isSaving, showPreview, setShowPreview }) {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    await saveStore();
    setTimeout(() => {
      toast({
        title: "🚧 Fonctionnalité en cours...",
        description: "Le déploiement personnalisé sera bientôt disponible.",
      });
      setIsDeploying(false);
    }, 1500);
  };

  return (
    <header className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/stores">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </Button>
      <h1 className="text-lg font-semibold truncate px-2">{store?.name || "Éditeur de boutique"}</h1>
      <div className="space-x-2 flex items-center">
        <Button onClick={() => setShowPreview(!showPreview)} size="sm" variant="outline" title={showPreview ? "Cacher l'aperçu" : "Afficher l'aperçu"}>
          <View className="w-4 h-4" />
        </Button>
        <Button onClick={saveStore} disabled={isSaving} size="sm" variant="secondary" title="Sauvegarder">
          <Save className="w-4 h-4" />
        </Button>
        <Button asChild size="sm" variant="outline" title="Voir la boutique en ligne">
          <a href={`/s/${store?.slug}`} target="_blank" rel="noopener noreferrer">
            <Eye className="w-4 h-4" />
          </a>
        </Button>
        <Button onClick={handleDeploy} disabled={isDeploying} size="sm" className="bg-primary text-primary-foreground hover:bg-accent" title="Déployer">
          {isDeploying ? '...' : <Rocket className="w-4 h-4" />}
        </Button>
      </div>
    </header>
  );
}