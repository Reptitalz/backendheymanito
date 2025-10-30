
'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, ShieldCheck, ShoppingCart, CreditCard, Image as ImageIcon, FilePlus2, MoreHorizontal, PlusCircle, ChevronsUpDown, Database, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

const clients = [
    { id: "USR-001", name: "Juan Pérez", phone: "+52 1 55 1234 5678", email: "juan.perez@example.com", status: "Contactado", lastContact: "Hace 2 días", tags: ["Lead Caliente"] },
    { id: "USR-002", name: "María García", phone: "+52 1 81 8765 4321", email: "maria.garcia@example.com", status: "No Interesado", lastContact: "Hace 1 semana", tags: [] },
    { id: "USR-003", name: "Carlos Sánchez", phone: "+52 1 33 9876 5432", email: "carlos.sanchez@example.com", status: "Nuevo", lastContact: "N/A", tags: [] },
    { id: "USR-004", name: "Ana Martínez", phone: "+52 1 55 2345 6789", email: "ana.martinez@example.com", status: "Seguimiento", lastContact: "Hace 3 horas", tags: ["VIP", "Proyecto A"] },
    { id: "USR-005", name: "Luis Hernández", phone: "+52 1 81 3456 7890", email: "luis.hernandez@example.com", status: "Contactado", lastContact: "Ayer", tags: ["Lead Frío"] },
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Contactado": return <Badge variant="secondary">Contactado</Badge>;
        case "No Interesado": return <Badge variant="destructive">No Interesado</Badge>;
        case "Nuevo": return <Badge>Nuevo</Badge>;
        case "Seguimiento": return <Badge className="bg-yellow-500 text-white">Seguimiento</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

const ClientsContent = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <CardTitle>Listado de Clientes</CardTitle>
                    <CardDescription>
                        Un listado de todos los clientes en tu base de datos.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                     <Button size="sm" className="h-8 gap-1 text-sm">
                        <PlusCircle className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only">Añadir</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1 text-sm">
                                <FilePlus2 className="h-4 w-4" />
                                <span className="sr-only sm:not-sr-only">Exportar</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Exportar a CSV</DropdownMenuItem>
                            <DropdownMenuItem>Exportar a Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="hidden sm:table-cell">Estado</TableHead>
                        <TableHead className="hidden md:table-cell">Último Contacto</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.map((client) => (
                        <TableRow key={client.id}>
                            <TableCell>
                                <div className="font-medium">{client.name}</div>
                                <div className="text-sm text-muted-foreground md:hidden">
                                    {client.phone}
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                {getStatusBadge(client.status)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{client.lastContact}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                        <DropdownMenuItem>Enviar Mensaje</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            Eliminar Cliente
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

export default function GestorPage() {
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
                        {managementSections.map(section => (
                            <Button
                                key={section.id}
                                variant={pathname === section.href ? "secondary" : "ghost"}
                                className="justify-start gap-3"
                                asChild
                            >
                                <Link href={section.href}>
                                    <section.icon className="h-5 w-5" />
                                    <span>{section.label}</span>
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>
                <main className="md:col-span-3">
                    <ClientsContent />
                </main>
            </div>
        </>
    );
}
