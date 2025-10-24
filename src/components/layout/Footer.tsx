import { Bot } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto py-12 px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 -rotate-6">
            <Bot className="h-8 w-8 text-primary" />
            <div className="flex flex-col text-xl font-bold text-white font-headline leading-none">
              <span>Manito!</span>
              <span>Hey</span>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="#features" className="hover:text-white transition-colors">Características</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Precios</Link>
            <Link href="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link>
            <Link href="/register" className="hover:text-white transition-colors">Registrarse</Link>
          </nav>
          <div className="text-sm text-center md:text-right">
            &copy; {currentYear} Hey Manito!. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
}
