
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
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, Timestamp } from "firebase/firestore";
import { Skeleton } from '@/components/ui/skeleton';

const managementSections = [
    { id: "clients", href: "/dashboard/clients", label: "Clientes", icon: Users },
    { id: "processes", href: "/dashboard/processes", label: "Procesos", icon: BrainCircuit },
    { id: "authorizations", href: "/dashboard/authorizations", label: "Autorizaciones", icon: ShieldCheck },
    { id: "sales", href: "/dashboard/sales", label: "Ventas", icon: ShoppingCart },
    { id: "payments", href: "/dashboard/payments", label: "Pagos", icon: CreditCard },
    { id: "images", href: "/dashboard/images", label: "Imágenes", icon: ImageIcon },
    { id: "database", href: "/dashboard/database", label: "Base de Datos", icon: Database },
];

interface Client {
    id: string;
    name: string;
    phone: string;
    email: string;
    status: 'Nuevo' | 'Contactado' | 'Seguimiento' | 'No Interesado';
    lastContact: Timestamp | null;
    tags: string[];
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "Contactado": return <Badge variant="secondary">Contactado</Badge>;
        case "No Interesado": return <Badge variant="destructive">No Interesado</Badge>;
        case "Nuevo": return <Badge>Nuevo</Badge>;
        case "Seguimiento": return <Badge className="bg-yellow-500 text-white">Seguimiento</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

const formatLastContact = (timestamp: Timestamp | null) => {
    if (!timestamp) return "N/A";
    // This is a simplified version. For production, use a library like date-fns.
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
}

const ClientsContent = () => {
    const { user } = useUser();
    const firestore = useFirestore();

    const clientsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'clients');
    }, [user, firestore]);

    const { data: clients, isLoading, error } = useCollection<Client>(clientsQuery);

    if (isLoading) {
        return <Skeleton className="h-96 w-full" />;
    }
    
    if (error) {
        return <Card><CardContent><p className="text-destructive p-4">Error al cargar los clientes.</p></CardContent></Card>;
    }

    return (
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
                        {clients && clients.length > 0 ? clients.map((client) => (
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
                                <TableCell className="hidden md:table-cell">{formatLastContact(client.lastContact)}</TableCell>
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
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No se encontraron clientes.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

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
                    <SheetContent side="bottom" className="h-[90%] flex flex-col">
                        <SheetHeader>
                            <SheetTitle>Navegar a</SheetTitle>
                        </SheetHeader>
                        <div className="py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto">
                            {managementSections.map((navSection) => (
                                <Link key={navSection.id} href={navSection.href}>
                                    <Card className={cn(
                                        "flex flex-col items-center justify-center p-4 h-32 text-center",
                                        pathname === navSection.href ? "border-primary ring-2 ring-primary" : ""
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
