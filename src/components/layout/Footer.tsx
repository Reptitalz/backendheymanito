import { Bot } from 'lucide-react'
import Link from 'next/link'
import { SystemStatus } from './SystemStatus';

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto py-12 px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 -rotate-6">
            <Bot className="h-8 w-8 text-primary" />
            <div className="flex flex-col text-xl font-bold text-white font-headline leading-none">
              <span>Hey</span>
              <span>Manito!</span>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="#how-it-works" className="hover:text-white transition-colors">Características</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Precios</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
          </nav>
          <div className="text-sm text-center md:text-right">
            &copy; {currentYear} Hey Manito!. Todos los derechos reservados.
          </div>
        </div>
      </div>
      <SystemStatus />
    </footer>
  )
}
