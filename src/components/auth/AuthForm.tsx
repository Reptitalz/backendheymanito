
"use client"

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useAuth } from '@/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

// A better substitute for the Google icon
const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Google</title>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const auth = useAuth();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        'displayName': 'Hey Manito!',
        'prompt': 'select_account',
    });
    auth.tenantId = null; // Ensure we are not using a tenant for this general sign-in
    
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente.',
      });
    } catch (error: any) {
      console.error("Error during Google sign-in:", error);
      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description: error.message || 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.',
      });
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-headline">
          {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
        </CardTitle>
        <CardDescription>
          {mode === 'login' ? 'Inicia sesión para gestionar tus bots.' : 'Regístrate para empezar a crear.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
            <GoogleIcon />
            {mode === 'login' ? 'Iniciar sesión con Google' : 'Registrarse con Google'}
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <>
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="underline">
                Regístrate
              </Link>
            </>
          ) : (
            <>
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="underline">
                Inicia sesión
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
