import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import {
  LayoutDashboard, ShoppingCart, Settings, DollarSign, Users, Store,
  Package, BadgePercent, LifeBuoy, BarChart, Users2, Truck
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";


const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, text: 'Tableau de bord' },
  { to: '/orders', icon: ShoppingCart, text: 'Commandes' },
  { to: '/stores', icon: Store, text: 'Mes Boutiques' },
  { to: '/customers', icon: Users, text: 'Clients' },
  { to: '/stats', icon: BarChart, text: 'Statistiques' },
  { to: '/finances', icon: DollarSign, text: 'Finances' },
  {
    text: 'Marketing',
    icon: BadgePercent,
    subLinks: [
      { to: '/dropshipping', icon: Truck, text: 'Dropshipping' },
      { to: '/affiliation', icon: BadgePercent, text: 'Affiliation' },
    ],
  },
  { to: '/settings', icon: Settings, text: 'Paramètres' },
];

const partnerLinks = [
  {
    text: 'Espace Partenaire',
    icon: Users2,
    subLinks: [
      { to: '/partner/products', icon: Package, text: 'Mes Produits' },
      { to: '/partner/orders', icon: ShoppingCart, text: 'Commandes Reçues' },
      { to: '/partner/finance', icon: DollarSign, text: 'Finance Partenaire' },
    ]
  }
];

const SidebarLink = ({ to, icon: Icon, text, isCollapsed, setSidebarOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const linkContent = (
    <NavLink
      to={to}
      onClick={() => setSidebarOpen && setSidebarOpen(false)}
      className={({ isActive: navIsActive }) => cn(
        "flex items-center w-full text-sm font-medium rounded-md transition-colors duration-150",
        "hover:bg-primary/10 hover:text-foreground",
        navIsActive ? "bg-primary/10 text-foreground" : "text-foreground",
        isCollapsed ? "justify-center p-3" : "p-3"
      )}
    >
      <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
      {!isCollapsed && <span>{text}</span>}
    </NavLink>
  );

  return isCollapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
      <TooltipContent side="right">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    linkContent
  );
};


export default function Sidebar({ sidebarOpen, setSidebarOpen, isSidebarCollapsed }) {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateStore = () => {
    if (profile?.can_create_stores) {
      navigate('/stores');
    } else {
      toast({
        title: "Limite de boutique atteinte",
        description: "Vous ne pouvez créer qu'une seule boutique avec le plan gratuit. Passez à un plan supérieur pour en créer plus.",
        variant: "destructive",
      });
    }
  };

  const isPartner = profile?.role === 'partner';
  const dashboardLink = profile?.role === 'superadmin' ? '/superadmin' : '/dashboard';

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      isSidebarCollapsed && "lg:w-20"
    )}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className={cn("flex items-center h-16 border-b", isSidebarCollapsed ? "justify-center" : "px-4")}>
          <Link to={dashboardLink} className="flex items-center gap-2 font-semibold" onClick={() => setSidebarOpen(false)}>
            <img src="https://horizons-cdn.hostinger.com/f45ec920-5a38-4fed-b465-6d4a9876f706/19bbef317b35d943b3084904db8fc50b.png" alt="PayLiv Logo" className={cn("transition-all", isSidebarCollapsed ? "h-8 w-8" : "h-8 w-auto")} />
            {!isSidebarCollapsed && <span className="text-xl font-bold tracking-tight">PayLiv</span>}
          </Link>
        </div>
        <div className={cn("flex-1 overflow-y-auto overflow-x-hidden", isSidebarCollapsed ? "p-2" : "p-4")}>
          <nav className="grid items-start text-sm font-medium gap-1">
            {!isSidebarCollapsed ? (
              <Accordion type="multiple" className="w-full">
                {navLinks.map((link, index) =>
                  link.subLinks ? (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="flex items-center w-full text-sm font-medium rounded-md p-3 hover:bg-primary/10 hover:no-underline transition-colors duration-150">
                        <link.icon className="h-5 w-5 mr-3" />
                        <span>{link.text}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pl-8 space-y-1">
                        {link.subLinks.map((subLink, subIndex) => (
                          <SidebarLink key={subIndex} {...subLink} isCollapsed={isSidebarCollapsed} setSidebarOpen={setSidebarOpen} />
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ) : (
                    <SidebarLink key={index} {...link} isCollapsed={isSidebarCollapsed} setSidebarOpen={setSidebarOpen} />
                  )
                )}
                {isPartner && partnerLinks.map((link, index) =>
                  <AccordionItem value={`partner-item-${index}`} key={index}>
                    <AccordionTrigger className="flex items-center w-full text-sm font-medium rounded-md p-3 hover:bg-primary/10 hover:no-underline transition-colors duration-150">
                      <link.icon className="h-5 w-5 mr-3" />
                      <span>{link.text}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 space-y-1">
                      {link.subLinks.map((subLink, subIndex) => (
                        <SidebarLink key={subIndex} {...subLink} isCollapsed={isSidebarCollapsed} setSidebarOpen={setSidebarOpen} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            ) : (
              <>
                {navLinks.map((link, index) => !link.subLinks && <SidebarLink key={index} {...link} isCollapsed={isSidebarCollapsed} setSidebarOpen={setSidebarOpen} />)}
                {isPartner && <SidebarLink {...partnerLinks[0].subLinks[0]} isCollapsed={isSidebarCollapsed} setSidebarOpen={setSidebarOpen} />}
              </>
            )}
          </nav>
        </div>
        <div className={cn("mt-auto", isSidebarCollapsed ? "p-2" : "p-4")}>
          <div className="border-t pt-4">
            <SidebarLink to="/documentation" icon={LifeBuoy} text="Centre d'aide" isCollapsed={isSidebarCollapsed} setSidebarOpen={setSidebarOpen} />
          </div>
        </div>
      </div>
    </aside>
  );
}