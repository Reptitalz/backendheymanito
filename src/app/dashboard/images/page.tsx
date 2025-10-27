
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, ShieldCheck, ShoppingCart, CreditCard, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const managementSections = [
    { id: "clients", href: "/dashboard/clients", label: "Clientes", icon: Users },
    { id: "authorizations", href: "/dashboard/authorizations", label: "Autorizaciones", icon: ShieldCheck },
    { id: "sales", href: "/dashboard/sales", label: "Ventas", icon: ShoppingCart },
    { id: "payments", href: "/dashboard/payments", label: "Pagos", icon: CreditCard },
    { id: "images", href: "/dashboard/images", label: "Imágenes", icon: ImageIcon },
];

const PlaceholderContent = ({ section }: { section: { label: string }}) => (
    <Card>
        <CardHeader>
            <CardTitle>{section.label}</CardTitle>
            <CardDescription>Gestiona {section.label.toLowerCase()} desde aquí.</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
            <div className="text-center">
                <p className="text-muted-foreground">Contenido de {section.label} próximamente.</p>
            </div>
        </CardContent>
    </Card>
);

export default function ImagesPage() {
    const pathname = usePathname();
    const section = managementSections.find(s => s.href === pathname);

    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Gestor de Recursos</h1>
                    <p className="text-sm text-muted-foreground">Administra clientes, ventas, pagos y más desde un solo lugar.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-8 pt-4">
                <aside className="md:col-span-1">
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
