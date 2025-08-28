import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, ChevronDown, LogOut, Settings, HelpCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { cn } from '@/lib/utils';

export default function Header({ setSidebarOpen, isSidebarCollapsed, setIsSidebarCollapsed }) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const userInitials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'PL';

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Navigation Menu</span>
      </Button>
      <div className="flex-1">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg lg:hidden">
          <img
            alt="PayLiv Logo"
            className="h-7 w-auto"
            style={{ filter: 'drop-shadow(0 0 3px rgba(255, 255, 0, 0.4))' }}
            src="https://horizons-cdn.hostinger.com/f45ec920-5a38-4fed-b465-6d4a9876f706/19bbef317b35d943b3084904db8fc50b.png"
          />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-2 ring-card">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 md:w-96">
            <DropdownMenuLabel className="flex justify-between items-center px-3 py-2">
              <span className="font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={markAllAsRead}>
                  Tout marquer comme lu
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3 cursor-pointer",
                      !notification.is_read && "bg-primary/10"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <p className="font-semibold text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.timeAgo}</p>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <Inbox className="h-8 w-8 mb-2" />
                  <p className="text-sm font-medium">Boîte de réception vide</p>
                  <p className="text-xs">Aucune nouvelle notification pour le moment.</p>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'PayLiv'}`} alt={profile?.name || "User"} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.name || 'Utilisateur'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/documentation')}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Centre d'aide</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
