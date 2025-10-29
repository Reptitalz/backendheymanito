
"use client"
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bot, Home, LogOut, Menu, Users, BrainCircuit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Simulated User type
interface SimulatedUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

const navLinks = [
  { href: "/admin/dashboard", label: "Admin Dashboard", icon: Home },
  { href: "/admin/monitor", label: "Monitor", icon: BrainCircuit },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimulatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate auth state change
    setLoading(true);
    // For admin, we assume a logged-in state if not on the main admin login page
    if (pathname !== '/admin') {
      setUser({
        uid: 'admin-user-123',
        isAnonymous: false,
        displayName: 'Admin User',
        email: 'admin@example.com',
        photoURL: `https://i.pravatar.cc/150?u=admin-user`,
      });
    } else {
        setUser(null); // No user on login page
    }
    setLoading(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setUser(null);
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

  if (loading || !user) {
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
               <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Users className="h-4 w-4" />
                <span>Client View</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 bg-background z-40 md:justify-end">
          <Sheet>
              <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                  </Button>
              </SheetTrigger>
              <SheetContent side="left">
                  <SheetHeader>
                      <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                  </SheetHeader>
                  <nav className="grid gap-6 text-lg font-medium">
                      <Link href="/" className="flex items-center gap-2 text-lg font-semibold font-headline mb-4 -rotate-6">
                           <Bot className="h-6 w-6 text-primary" />
                            <div className="flex flex-col text-lg leading-none">
                              <span>Hey</span>
                              <span className='text-base'>Manito!</span>
                            </div>
                      </Link>
                      {navLinks.map(link => (
                          <Link key={link.href} href={link.href} className={`flex items-center gap-4 px-2.5 ${pathname.startsWith(link.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                              <link.icon className="h-5 w-5" />
                              {link.label}
                          </Link>
                      ))}
                       <Link href="/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                          <Users className="h-5 w-5" />
                          Client View
                       </Link>
                  </nav>
              </SheetContent>
          </Sheet>
          
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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-secondary/40">
          {children}
        </main>
      </div>
    </div>
  );
}
