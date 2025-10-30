
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== 'reptitalz@heymanito.com') {
      setError('Acceso denegado. Este correo no tiene permisos de administrador.');
      return;
    }
    
    if (password !== 'Susan@12') {
        setError('Contraseña incorrecta.');
        return;
    }

    try {
        // Since we are validating the password manually, we can sign in with the expected credentials
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/admin/dashboard');
    } catch (err: any) {
        if (err.code === 'auth/user-not-found') {
            setError('El usuario administrador no existe. Contacta al soporte.');
        } else if (err.code === 'auth/wrong-password') {
            setError('Credenciales inválidas. Inténtalo de nuevo.');
        } else {
            setError('Ocurrió un error inesperado durante el inicio de sesión.');
        }
        console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <div className="absolute top-8">
        <Link href="/" className="flex items-center gap-2 text-foreground -rotate-6">
          <Bot className="h-8 w-8 text-primary" />
          <div className="flex flex-col text-xl font-bold font-headline leading-none">
            <span>Hey</span>
            <span>Manito!</span>
          </div>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Acceso de Administrador</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al panel de control.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="reptitalz@heymanito.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
