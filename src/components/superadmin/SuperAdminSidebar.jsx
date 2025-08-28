import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Store, Settings, CreditCard, Mail, BarChart,
  Users2, DollarSign, Truck, Plane, BadgePercent, LogOut, MessageSquare,
  Speaker, CalendarClock, FileText, ShoppingCart, Webhook
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const navItems = [
  { href: '/superadmin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/superadmin/users', icon: Users, label: 'Utilisateurs' },
  { href: '/superadmin/stores', icon: Store, label: 'Boutiques' },
  { href: '/superadmin/transactions', icon: ShoppingCart, label: 'Transactions' },
  { href: '/superadmin/payouts', icon: DollarSign, label: 'Retraits' },
  { href: '/superadmin/dropshipping', icon: Truck, label: 'Dropshipping' },
  { href: '/superadmin/affiliates', icon: BadgePercent, label: 'Affiliation' },
  { href: '/superadmin/emails', icon: Mail, label: 'Emails' },
  { href: '/superadmin/advertisements', icon: Speaker, label: 'Publicités' },
  { type: 'divider', label: 'Configuration' },
  { href: '/superadmin/settings', icon: Settings, label: 'Général' },
  { href: '/superadmin/plans', icon: Plane, label: 'Abonnements' },
  { href: '/superadmin/payment-providers', icon: CreditCard, label: 'Fournisseurs Paiement' },
  { href: '/superadmin/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
  { type: 'divider', label: 'Monitoring' },
  { href: '/superadmin/events', icon: CalendarClock, label: 'Événements' },
  { href: '/superadmin/payout-logs', icon: FileText, label: 'Logs Retraits' },
  { href: '/superadmin/webhooks', icon: Webhook, label: 'Webhooks' },
];

const NavLink = ({ item, isCollapsed, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;

  if (item.type === 'divider') {
    return isCollapsed ? <hr className="my-3 border-border" /> : <div className="px-4 my-2 text-xs font-semibold text-foreground uppercase tracking-wider">{item.label}</div>;
  }

  const linkContent = (
    <div className={cn(
      "flex items-center w-full text-sm font-medium rounded-md transition-colors duration-150",
      "hover:bg-primary/10 hover:text-foreground",
      isActive ? "bg-primary/10 text-foreground" : "text-foreground",
      isCollapsed ? "justify-center p-3" : "p-3"
    )}>
      <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
      {!isCollapsed && <span>{item.label}</span>}
    </div>
  );

  return isCollapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to={item.href} onClick={onClick}>{linkContent}</Link>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{item.label}</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    <Link to={item.href} onClick={onClick}>{linkContent}</Link>
  );
};

const SidebarContent = ({ isCollapsed, onLinkClick }) => (
  <div className="flex h-full max-h-screen flex-col gap-2 bg-card">
    <div className={cn("flex items-center h-16 border-b", isCollapsed ? "justify-center" : "px-4")}>
      <Link to="/superadmin" className="flex items-center gap-2 font-semibold">
        <img src="https://horizons-cdn.hostinger.com/f45ec920-5a38-4fed-b465-6d4a9876f706/19bbef317b35d943b3084904db8fc50b.png" alt="PayLiv Logo" className={cn("transition-all", isCollapsed ? "h-8 w-8" : "h-8 w-auto")} />
        {!isCollapsed && <span className="text-xl font-bold tracking-tight">PayLiv</span>}
      </Link>
    </div>
    <nav className={cn("flex-1 overflow-y-auto overflow-x-hidden", isCollapsed ? "p-2" : "p-4")}>
      <div className="grid items-start text-sm font-medium gap-1">
          {navItems.map((item, index) => (
          <NavLink key={index} item={item} isCollapsed={isCollapsed} onClick={onLinkClick} />
          ))}
      </div>
    </nav>
  </div>
);

const SuperAdminSidebar = ({ sidebarOpen, setSidebarOpen, isCollapsed }) => {
  return (
    <>
      <aside className="hidden lg:block border-r bg-card">
          <SidebarContent isCollapsed={isCollapsed} />
      </aside>
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72 border-r">
             <SidebarContent isCollapsed={false} onLinkClick={() => setSidebarOpen(false)} />
          </SheetContent>
      </Sheet>
    </>
  );
};

export default SuperAdminSidebar;