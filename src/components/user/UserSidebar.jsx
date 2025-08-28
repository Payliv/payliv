import React from 'react';
import { NavLink, useMatch, useParams } from 'react-router-dom';
import { Home, Store, ShoppingBag, Settings, BarChart3, LifeBuoy, ShieldCheck, DollarSign, GitFork, ArrowLeft, Palette, Package, Settings2 } from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

const NavItem = ({ to, icon: Icon, label, isCollapsed }) => (
  <li>
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink
          to={to}
          end={['/stores', '/dashboard'].includes(to)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-foreground" // Changed text-primary-foreground to text-foreground
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span className={cn("truncate", isCollapsed && "lg:hidden")}>{label}</span>
        </NavLink>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  </li>
);

const UserSidebar = ({ isCollapsed }) => {
  const { profile } = useProfile();
  const storeMatch = useMatch('/store/:storeId/*');
  const params = useParams();
  const storeId = storeMatch ? params.storeId : null;

  if (storeId) {
    const storeNavItems = [
      { to: `/stores`, icon: ArrowLeft, label: "Toutes les boutiques" },
      { to: `/store/${storeId}/dashboard`, icon: Home, label: "Tableau de bord" },
      { to: `/store/${storeId}/products`, icon: Package, label: "Produits" },
      { to: `/store/${storeId}/design`, icon: Palette, label: "Design" },
      { to: `/store/${storeId}/finance`, icon: DollarSign, label: "Finances" },
      { to: `/store/${storeId}/settings`, icon: Settings2, label: "Paramètres" },
    ];

    return (
      <ul className="space-y-2">
        {storeNavItems.map((item) => (
          <NavItem key={item.to} {...item} isCollapsed={isCollapsed} />
        ))}
      </ul>
    );
  }

  const storesLabel = profile?.role === 'partner' ? "Ma Boutique" : "Mes Boutiques";

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Tableau de Bord" },
    { to: "/stores", icon: Store, label: storesLabel },
    { to: "/orders", icon: ShoppingBag, label: "Mes Commandes" },
    { to: "/partner/finance", icon: DollarSign, label: "Finances" },
    { to: "/dropshipping", icon: GitFork, label: "Dropshipping" },
    { to: "/affiliate", icon: BarChart3, label: "Affiliation" },
    { to: "/settings", icon: Settings, label: "Paramètres" },
    { to: "/help", icon: LifeBuoy, label: "Aide & Support" }
  ];
  
  if (profile?.role === 'superadmin') {
    navItems.push({ to: "/superadmin", icon: ShieldCheck, label: "Super Admin" });
  }

  return (
    <ul className="space-y-2">
      {navItems.map((item) => (
        <NavItem key={item.to} {...item} isCollapsed={isCollapsed} />
      ))}
    </ul>
  );
};

export default UserSidebar;