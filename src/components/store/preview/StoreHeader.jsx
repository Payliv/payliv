import React from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingBag, Download } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const StoreHeader = ({ store, searchTerm, onSearchChange }) => {
  const { user } = useAuth();

  if (!store) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link to={`/s/${store.slug}`} className="flex items-center gap-3">
            {store.logo && (
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img src={store.logo} alt={`${store.name} logo`} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight hidden sm:block">{store.name}</h1>
              {store.description && (
                <p className="text-sm text-muted-foreground hidden sm:block truncate max-w-[200px]">{store.description}</p>
              )}
            </div>
          </Link>
        </div>

        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher dans la boutique..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 h-10 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/my-purchases" aria-label="Mes achats">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
             <Link to="/telechargement" aria-label="Retrouver mes achats">
              <Button variant="ghost" size="icon">
                <Download className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default StoreHeader;