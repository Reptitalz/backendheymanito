
"use client"
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bot, Home, LogOut, Menu, Package, Users, CreditCard, Target, Shield, BrainCircuit } from "lucide-react";
import { useSwipeable } from 'react-swipeable';
import { signOut } from 'firebase/auth';
import { collection } from 'firebase/firestore';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';


const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/asistentes", label: "Asistentes", icon: Bot },
  { href: "/dashboard/clients", label: "Gestor", icon: Target },
  { href: "/dashboard/credits", label: "Créditos", icon: CreditCard },
];

const MobileBottomNav = ({ isSpecialPage, assistantCount }: { isSpecialPage: boolean, assistantCount: number }) => {
    const pathname = usePathname();

    if (isSpecialPage) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm md:hidden z-50">
            <nav className={cn(
                'grid grid-cols-4 items-center justify-around h-16'
            )}>
                {navLinks.map(link => {
                    const isActive = pathname.startsWith(link.href);
                    const isAssistantsLink = link.href === '/dashboard/asistentes';
                    return (
                        <Link key={`${link.href}-${link.label}-mobile`} href={link.href} className={cn('relative flex flex-col items-center justify-center gap-1 transition-colors h-full', isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary')}>
                            <link.icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{link.label}</span>
                             {isAssistantsLink && assistantCount > 0 && (
                                <Badge className="absolute top-2 right-4 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {assistantCount}
                                </Badge>
                            )}
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const assistantsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'assistants');
  }, [user, firestore]);

  const { data: assistants, isLoading: areAssistantsLoading } = useCollection(assistantsQuery);
  const assistantCount = assistants?.length || 0;


  const isSpecialPage = pathname === '/dashboard/asistentes/crear' || pathname.includes('/habilidades') || pathname.includes('/conectar') || pathname.includes('/creando');

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe(1),
    onSwipedRight: () => handleSwipe(-1),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const handleSwipe = (direction: number) => {
    if (isSpecialPage) return; // Disable swipe on create page
    const currentPath = pathname;
    const relevantLinks = navLinks.map(l => l.href);
    const currentIndex = relevantLinks.indexOf(currentPath);

    if (currentIndex !== -1) {
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < relevantLinks.length) {
            router.push(relevantLinks[nextIndex]);
        }
    }
  };
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    try {
      if (!auth) return;
      await signOut(auth);
      router.push('/');
      toast({
        title: 'Has cerrado sesión',
        description: 'Vuelve pronto.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cerrar la sesión.',
      });
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    return user?.displayName;
  };
  
  const getDisplayEmail = () => {
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

  if (isUserLoading || !user || areAssistantsLoading) {
    return loadingSkeleton;
  }
  
  const desktopNavLinks = navLinks.map(link => ({
    ...link,
    href: link.href,
    badge: (link.href === '/dashboard/asistentes' ? assistantCount : 0),
  }));

  if (isSpecialPage) {
    // For pages like 'create', 'habilidades', or 'conectar', we render a simpler layout
    // without the main sidebar and header.
    const containerClasses = cn(
        "flex flex-col min-h-screen",
        pathname.includes('/conectar') ? "items-center justify-center bg-muted/40" : "bg-secondary/40",
        pathname.includes('/creando') && "fixed inset-0 z-50 w-full overflow-hidden bg-gray-900"
    );

    const mainClasses = cn(
        "flex flex-1 flex-col",
        !pathname.includes('/conectar') && !pathname.includes('/creando') && "gap-4 p-4 lg:gap-6 lg:p-6",
        pathname.includes('/creando') && "items-center justify-center text-center text-white"
    );

    return (
        <div className={containerClasses}>
             <main className={mainClasses}>
                {children}
             </main>
        </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline -rotate-6">
              <Bot className="h-6 w-6 text-primary" />
              <div className="flex flex-col text-lg leading-none">
                <span>Hey</span>
                <span className='text-base'>Manito!</span>
              </div>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {desktopNavLinks.map(link => {
                const isActive = link.href === '/dashboard'
                    ? pathname === link.href
                    : pathname.startsWith(link.href);
                 return(
                 <Link key={`${link.href}-${link.label}`} href={link.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>
                    <link.icon className="h-4 w-4" />
                    {link.label}
                    {link.badge > 0 && <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{link.badge}</Badge>}
                 </Link>
                 )
              })}
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
                <Button size="sm" className="w-full" asChild>
                  <Link href="/dashboard/credits">Comprar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 bg-background z-40 md:justify-end">
          <Link href="/" className="flex items-center gap-2 font-semibold font-headline md:hidden -rotate-6">
            <Bot className="h-6 w-6 text-primary" />
            <div className="flex flex-col text-base leading-none">
              <span>Hey</span>
              <span className='text-sm'>Manito!</span>
            </div>
          </Link>
          <div className="w-full flex-1 md:hidden">
            {/* Can be used for mobile header content */}
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
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                <Bot className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main {...swipeHandlers} className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40 pb-20 md:pb-6">
          {children}
        </main>
        <MobileBottomNav isSpecialPage={isSpecialPage} assistantCount={assistantCount} />
      </div>
    </div>
  );
}
