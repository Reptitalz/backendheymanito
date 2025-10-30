
"use client"
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bot, Home, LogOut, Users, BrainCircuit, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/memory", label: "Memory", icon: Database },
];

const MobileBottomNav = () => {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm md:hidden z-50">
            <nav className="grid grid-cols-2 items-center justify-around h-16">
                {navLinks.map(link => {
                    const isActive = pathname === link.href;
                    return (
                        <Link key={`${link.href}-mobile`} href={link.href} className={cn('flex flex-col items-center justify-center gap-1 transition-colors h-full', isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary')}>
                            <link.icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{link.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
};


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/admin') {
      router.push('/admin');
    }
    // Allow access to /admin login page even if there is a user
    // but redirect to dashboard if they are already logged in and try to access it
    if (!isUserLoading && user && user.email === 'admin@heymanito.com' && pathname === '/admin') {
      router.push('/admin/dashboard');
    }
  }, [user, isUserLoading, router, pathname]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/admin');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };
  
  const getDisplayName = () => {
    return user?.displayName;
  };
  
  const getDisplayEmail = () => {
     return user?.email;
  };
  
  // If we are on the login page, just render the children without the layout
  if (pathname === '/admin') {
    return <>{children}</>;
  }

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

  if (isUserLoading || !user) {
    return loadingSkeleton;
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
              {navLinks.map(link => (
                 <Link key={`${link.href}-${link.label}`} href={link.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${pathname.startsWith(link.href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>
                    <link.icon className="h-4 w-4" />
                    {link.label}
                 </Link>
              ))}
            </nav>
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
                <Users className="mr-2 h-4 w-4" />
                <span>Client View</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40 pb-20 md:pb-6">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
