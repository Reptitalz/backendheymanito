"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Bot, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';

// Simulated User type
interface SimulatedUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export function Header() {
  const [user, setUser] = useState<SimulatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking auth state
    setLoading(true);
    const isDashboard = pathname.startsWith('/dashboard');
    if (isDashboard) {
      const isDemo = pathname.includes('demo');
      if (isDemo) {
        setUser({
          uid: 'guest-123',
          isAnonymous: true,
          displayName: 'Invitado',
          email: 'guest@example.com',
          photoURL: null,
        });
      } else {
        setUser({
          uid: 'user-123',
          isAnonymous: false,
          displayName: 'Demo User',
          email: 'user@example.com',
          photoURL: `https://i.pravatar.cc/150?u=demo-user`,
        });
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [pathname]);

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
    if (user?.isAnonymous) return 'Invitado';
    return user?.displayName;
  }
  
  const getDisplayEmail = () => {
    if (user?.isAnonymous) return 'Explorando como invitado';
    return user?.email;
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-50 py-6 px-4 md:px-8">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white -rotate-6">
          <Bot className="h-8 w-8" />
          <div className="flex flex-col text-xl font-bold font-headline leading-none">
            <span>Manito!</span>
            <span>Hey</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/90">
          <Link href="#features" className="hover:text-white transition-colors">Características</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Precios</Link>
        </nav>
        <div className="flex items-center gap-4">
          {loading ? (
            <Skeleton className="h-10 w-40 rounded-md bg-white/20" />
          ) : user ? (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-white/50">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback>{getInitials(getDisplayName())}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">{getDisplayEmail()}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(user.isAnonymous ? '/dashboarddemo' : '/dashboard')}>
                    <Bot className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden md:inline-flex text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild className="bg-white text-primary hover:bg-gray-200 shadow-md">
                <Link href="/register">Registrarse</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
