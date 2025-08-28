import React from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { Palette, Package, Settings, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const SidebarLink = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => cn(
      "flex items-center p-3 text-sm font-medium rounded-lg transition-colors",
      isActive 
        ? "bg-primary/10 text-primary font-semibold" 
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
    )}
  >
    {React.cloneElement(icon, { className: "w-5 h-5 mr-3" })}
    <span>{label}</span>
  </NavLink>
);

const StoreManagerSidebar = ({ store, mobileMenuOpen, setMobileMenuOpen }) => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const links = [
    { to: `/store/${storeId}/design`, icon: <Palette />, label: 'Design' },
    { to: `/store/${storeId}/products`, icon: <Package />, label: 'Produits' },
    { to: `/store/${storeId}/settings`, icon: <Settings />, label: 'Paramètres' },
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 lg:hidden",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        "w-64 bg-card border-r border-border h-full"
      )}>
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold truncate">{store?.name || 'Boutique'}</h2>
          <a 
            href={`/s/${store?.slug}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center"
          >
            Voir la boutique <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {links.map(link => <SidebarLink key={link.to} {...link} onClick={() => setMobileMenuOpen(false)} />)}
        </nav>
        <div className="p-4 border-t border-border mt-auto">
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Toutes les boutiques
          </Button>
        </div>
      </aside>
    </>
  );
};

export default StoreManagerSidebar;