import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, Rocket, Loader2, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const StoreManagerHeader = ({ store, onPublish, isPublishing, setMobileMenuOpen }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'published':
        return { text: 'En ligne', icon: <CheckCircle className="w-4 h-4 mr-2" />, className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' };
      case 'suspended':
        return { text: 'Suspendue', icon: <Zap className="w-4 h-4 mr-2" />, className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' };
      default:
        return { text: 'Brouillon', icon: <Zap className="w-4 h-4 mr-2" />, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' };
    }
  };

  const statusInfo = getStatusInfo(store.status);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold truncate">{store.name}</h1>
        <Badge variant="outline" className={cn(statusInfo.className, 'hidden sm:inline-flex')}>
          {statusInfo.icon}
          {statusInfo.text}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          onClick={onPublish} 
          disabled={isPublishing || store.status === 'published'}
          className={cn(
            store.status !== 'published' && "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300"
          )}
        >
          {isPublishing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : store.status === 'published' ? (
            <CheckCircle className="mr-2 h-4 w-4" />
          ) : (
            <Rocket className="mr-2 h-4 w-4" />
          )}
          <span className="hidden sm:inline">{isPublishing ? 'Publication...' : store.status === 'published' ? 'En ligne' : 'Mettre en Ligne'}</span>
          <span className="sm:hidden">{isPublishing ? '...' : store.status === 'published' ? <CheckCircle className="h-4 w-4"/> : <Rocket className="h-4 w-4"/>}</span>
        </Button>
      </div>
    </header>
  );
};

export default StoreManagerHeader;