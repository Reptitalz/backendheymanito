"use client"
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bot, Home, LogOut, Menu, Package, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Simulated User type
interface SimulatedUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimulatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isDemo = pathname === '/dashboarddemo';

  useEffect(() => {
    // Simulate auth state change
    setLoading(true);
    // This logic determines if we should be in a "logged in" or "guest" state
    // For this simulation, any dashboard access is considered "logged in" in some capacity.
    // The demo route specifically handles the guest/demo experience.
    
    if (isDemo) {
      // Simulate guest user
      setUser({
        uid: 'guest-123',
        isAnonymous: true,
        displayName: 'Invitado',
        email: 'guest@example.com',
        photoURL: null,
      });
      toast({
        title: "Modo Demostración",
        description: "Estás viendo una versión de demostración. Inicia sesión para guardar tu trabajo.",
      });
    } else {
       // Simulate a logged-in user for the main dashboard
       setUser({
        uid: 'user-123',
        isAnonymous: false,
        displayName: 'Demo User',
        email: 'user@example.com',
        photoURL: `https://i.pravatar.cc/150?u=demo-user`,
      });
    }
    
    setLoading(false);

  }, [pathname, toast, isDemo, router]);

  const handleSignOut = async () => {
    setUser(null);
    router.push('/');
  };

  const getInitials = (name?: string | null) => {
    if (user?.isAnonymous) return 'G';
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    return user?.displayName;
  };
  
  const getDisplayEmail = () => {
     if (user?.isAnonymous) return 'Explorando como invitado';
     return user?.email;
  };

  const loadingSkeleton = (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Skeleton className="h-6 w-32" />
          </nav>
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial">
              <Skeleton className="h-8 w-full md:w-64" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Skeleton className="h-[70vh] w-full" />
        </main>
      </div>
  );

  if (loading || !user) {
    return loadingSkeleton;
  }
  
  const navLinks = [
    { href: isDemo ? "/dashboarddemo" : "/dashboard", label: "Dashboard", icon: Home, badge: 0 },
    { href: "#", label: "Asistentes", icon: Bot, badge: isDemo ? 4 : 3 },
    { href: "#", label: "Clientes", icon: Users, badge: 0 },
    { href: "#", label: "Créditos", icon: Package, badge: 0 },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
              <Bot className="h-6 w-6 text-primary" />
              <span>Hey Manito!</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map(link => (
                 <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname === link.href ? 'bg-accent text-primary-foreground hover:text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    <link.icon className="h-4 w-4" />
                    {link.label}
                    {link.badge > 0 && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{link.badge}</Badge>}
                 </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Comprar Créditos</CardTitle>
                <CardDescription>
                  1 crédito equivale a 1000 mensajes. ¡Recarga ahora!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Comprar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="#" className="flex items-center gap-2 text-lg font-semibold font-headline mb-4">
                  <Bot className="h-6 w-6 text-primary" />
                  <span>Hey Manito!</span>
                </Link>
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${pathname === link.href ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      <link.icon className="h-5 w-5" />
                      {link.label}
                      {link.badge > 0 && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{link.badge}</Badge>}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Comprar Créditos</CardTitle>
                    <CardDescription>
                      1 crédito equivale a 1000 mensajes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">Comprar</Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            {/* Can be used for search */}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                  <AvatarFallback>{getInitials(getDisplayName())}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{getDisplayName()}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ajustes</DropdownMenuItem>
              <DropdownMenuItem>Soporte</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40">
          {children}
        </main>
      </div>
    </div>
  );
}
