
'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, ShieldCheck, ShoppingCart, CreditCard, Image as ImageIcon, ChevronsUpDown, Database, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import MonitorContent from '@/app/admin/monitor/page';

const managementSections = [
    { id: "clients", href: "/dashboard/gestor/clients", label: "Clientes", icon: Users, isImplemented: false },
    { id: "processes", href: "/dashboard/gestor/processes", label: "Procesos", icon: BrainCircuit, isImplemented: true },
    { id: "authorizations", href: "/dashboard/gestor/authorizations", label: "Autorizaciones", icon: ShieldCheck, isImplemented: false },
    { id: "sales", href: "/dashboard/gestor/sales", label: "Ventas", icon: ShoppingCart, isImplemented: false },
    { id: "payments", href: "/dashboard/gestor/payments", label: "Pagos", icon: CreditCard, isImplemented: false },
    { id: "images", href: "/dashboard/gestor/images", label: "Imágenes", icon: ImageIcon, isImplemented: false },
    { id: "database", href: "/dashboard/gestor/database", label: "Base de Datos", icon: Database, isImplemented: false },
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

export default function GestorPage() {
    const pathname = usePathname();
    const router = useRouter();

    // Find the currently active section based on the URL path
    const activeSection = managementSections.find(s => pathname.startsWith(s.href));

    // If no section is matched (i.e., we are at /dashboard/gestor), default to the first one
    const sectionToDisplay = activeSection || managementSections[0];

    const renderContent = () => {
        if (!sectionToDisplay) return null;

        if (sectionToDisplay.id === "processes" && sectionToDisplay.isImplemented) {
            return <MonitorContent />;
        }
        
        return <PlaceholderContent section={sectionToDisplay} />;
    }

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
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <span>{sectionToDisplay?.label || "Seleccionar sección"}</span>
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90%] flex flex-col">
                        <SheetHeader>
                            <SheetTitle>Navegar a</SheetTitle>
                        </SheetHeader>
                        <div className="py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto">
                            {managementSections.map((navSection) => (
                                <Link key={navSection.id} href={navSection.href}>
                                    <Card className={cn(
                                        "flex flex-col items-center justify-center p-4 h-32 text-center",
                                        pathname.startsWith(navSection.href) ? "border-primary ring-2 ring-primary" : ""
                                    )}>
                                        <navSection.icon className="h-8 w-8 text-primary mb-2" />
                                        <p className="text-sm font-semibold">{navSection.label}</p>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>


            <div className="grid md:grid-cols-4 gap-8 pt-4">
                <aside className="hidden md:flex md:col-span-1 flex-col">
                     <nav className="flex flex-col gap-1">
                        {managementSections.map(navSection => (
                            <Button
                                key={navSection.id}
                                variant={pathname.startsWith(navSection.href) ? "default" : "ghost"}
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
                    {renderContent()}
                </main>
            </div>
        </>
    );
}
