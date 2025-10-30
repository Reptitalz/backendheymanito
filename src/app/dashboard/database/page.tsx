
'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, ShieldCheck, ShoppingCart, CreditCard, Image as ImageIcon, ChevronsUpDown, Database, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { cn } from '@/lib/utils';

const managementSections = [
    { id: "clients", href: "/dashboard/clients", label: "Clientes", icon: Users },
    { id: "processes", href: "/dashboard/processes", label: "Procesos", icon: BrainCircuit },
    { id: "authorizations", href: "/dashboard/authorizations", label: "Autorizaciones", icon: ShieldCheck },
    { id: "sales", href: "/dashboard/sales", label: "Ventas", icon: ShoppingCart },
    { id: "payments", href: "/dashboard/payments", label: "Pagos", icon: CreditCard },
    { id: "images", href: "/dashboard/images", label: "Imágenes", icon: ImageIcon },
    { id: "database", href: "/dashboard/database", label: "Base de Datos", icon: Database },
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

export default function DatabasePage() {
    const pathname = usePathname();
    const router = useRouter();
    const section = managementSections.find(s => s.href === pathname);
    
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
                            <span>{section?.label || "Seleccionar sección"}</span>
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90%]">
                        <SheetHeader>
                            <SheetTitle>Navegar a</SheetTitle>
                        </SheetHeader>
                        <div className="py-4">
                            <Carousel
                                opts={{
                                    align: "start",
                                    dragFree: true,
                                }}
                                className="w-full"
                            >
                                <CarouselContent>
                                    {managementSections.map((navSection, index) => (
                                        <CarouselItem key={index} className="basis-1/2 sm:basis-1/3">
                                            <div className="p-1">
                                                <Link href={navSection.href}>
                                                    <Card className={cn(
                                                        "flex flex-col items-center justify-center p-4 h-40",
                                                        pathname === navSection.href ? "border-primary ring-2 ring-primary" : ""
                                                    )}>
                                                        <navSection.icon className="h-8 w-8 text-primary mb-2" />
                                                        <p className="text-sm font-semibold text-center">{navSection.label}</p>
                                                    </Card>
                                                </Link>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
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
