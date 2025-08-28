import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { LayoutDashboard, LogOut, ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAYLIV_LOGO_URL = 'https://storage.googleapis.com/hostinger-horizons-assets-prod/f45ec920-5a38-4fed-b465-6d4a9876f706/de76d88e7eda758e55e3b51aa774b826.png';

const navLinks = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/solutions/dropshipping", label: "Dropshipping" },
  { to: "/pricing", label: "Tarifs" },
  { to: "/affiliation", label: "Affiliation" },
];

const PublicHeader = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    cn(
      "text-sm font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-muted-foreground"
    );
  
  const mobileNavLinkClass = ({ isActive }) =>
    cn(
      "text-lg font-medium transition-colors hover:text-primary",
      isActive ? "text-primary" : "text-foreground"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img src={PAYLIV_LOGO_URL} alt="PayLiv Logo" className="h-6 w-auto" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm lg:flex">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>{link.label}</NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <UserDropdown profile={profile} user={user} signOut={signOut} />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Créer un compte</Link>
                </Button>
              </>
            )}
          </div>
          
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <Link to="/" className="mr-6 flex items-center space-x-2 mb-8" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src={PAYLIV_LOGO_URL} alt="PayLiv Logo" className="h-6 w-auto" />
                </Link>
                <div className="flex flex-col h-full">
                  <nav className="flex flex-col gap-6 text-lg font-medium">
                    {navLinks.map(link => (
                      <NavLink key={link.to} to={link.to} className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>{link.label}</NavLink>
                    ))}
                  </nav>
                  <div className="mt-auto pb-8">
                    {user ? (
                       <div className="flex flex-col gap-4">
                         <Button asChild variant="outline" onClick={() => setIsMobileMenuOpen(false)}><Link to="/dashboard">Tableau de bord</Link></Button>
                         <Button variant="destructive" onClick={() => { signOut(); setIsMobileMenuOpen(false); }}>Se déconnecter</Button>
                       </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <Button asChild variant="outline" onClick={() => setIsMobileMenuOpen(false)}><Link to="/login">Se connecter</Link></Button>
                        <Button asChild onClick={() => setIsMobileMenuOpen(false)}><Link to="/signup">Créer un compte</Link></Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

const UserDropdown = ({ profile, user, signOut }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || user.email} />
          <AvatarFallback>{profile?.name ? profile.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="end" forceMount>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{profile?.name}</p>
          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link to="/dashboard">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Tableau de bord</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/my-purchases">
          <ShoppingBag className="mr-2 h-4 w-4" />
          <span>Mes Achats</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={signOut}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Se déconnecter</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default PublicHeader;