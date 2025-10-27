
'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, ShieldCheck, ShoppingCart, CreditCard, Image as ImageIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';

const managementSections = [
    { id: "clients", href: "/dashboard/clients", label: "Clientes", icon: Users },
    { id: "authorizations", href: "/dashboard/authorizations", label: "Autorizaciones", icon: ShieldCheck },
    { id: "sales", href: "/dashboard/sales", label: "Ventas", icon: ShoppingCart },
    { id: "payments", href: "/dashboard/payments", label: "Pagos", icon: CreditCard },
    { id: "images", href: "/dashboard/images", label: "Imágenes", icon: ImageIcon },
];

const PlaceholderContent = ({ section }: { section: { label: string, icon: React.ElementType }}) => (
     <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>{section.label}</CardTitle>
                <section.icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardDescription>Gestiona {section.label.toLowerCase()} desde aquí.</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
            <div className="text-center">
                <p className="text-muted-foreground">Contenido de {section.label} próximamente.</p>
            </div>
        </CardContent>
    </Card>
);

export default function PaymentsPage() {
    const pathname = usePathname();
    const router = useRouter();
    const section = managementSections.find(s => s.href === pathname);
    
    const handleNavigation = (value: string) => {
        router.push(value);
    };

    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Gestor de Recursos</h1>
                    <p className="text-sm text-muted-foreground">Administra clientes, ventas, pagos y más desde un solo lugar.</p>
                </div>
            </div>
            
            {/* Mobile navigation */}
            <div className="md:hidden pt-4">
                <Select value={pathname} onValueChange={handleNavigation}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar sección" />
                    </SelectTrigger>
                    <SelectContent>
                        {managementSections.map(navSection => (
                            <SelectItem key={`mobile-${navSection.id}`} value={navSection.href}>
                                <div className="flex items-center gap-2">
                                    <navSection.icon className="h-4 w-4" />
                                    <span>{navSection.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid md:grid-cols-4 gap-8 pt-4">
                <aside className="hidden md:flex md:col-span-1 flex-col">
                     <nav className="flex flex-col gap-1">
                        {managementSections.map(navSection => (
                            <Button
                                key={navSection.id}
                                variant={pathname === navSection.href ? "secondary" : "ghost"}
                                className="justify-start gap-3"
                                asChild
                            >
                                <Link href={navSection.href}>
                                    <navSection.icon className="h-5 w-5" />
                                    <span>{navSection.label}</span>
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>
                <main className="md:col-span-3">
                    {section && <PlaceholderContent section={section} />}
                </main>
            </div>
        </>
    );
}
