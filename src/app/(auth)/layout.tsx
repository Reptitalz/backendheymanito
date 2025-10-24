import Link from 'next/link';
import { Bot } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
       <div className="absolute top-8">
        <Link href="/" className="flex items-center gap-2 text-foreground -rotate-6">
          <Bot className="h-8 w-8 text-primary" />
          <div className="flex flex-col text-xl font-bold font-headline leading-none">
            <span>Manito!</span>
            <span>Hey</span>
          </div>
        </Link>
      </div>
      {children}
    </div>
  );
}
