
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, PhoneCall, PhoneOutgoing, MessageSquare, UserCheck, CreditCard, Receipt, Sheet, Edit, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const allAssistants = [
    { id: "asst_1", name: "Asistente de Ventas", status: "Activo", messagesUsed: 250, lastUpdate: "Hace 2 horas", waId: "123456789", verified: true, skills: ["send-messages", "payment-auth", "billing"] },
    { id: "asst_2", name: "Soporte Técnico Nivel 1", status: "Inactivo", messagesUsed: 520, lastUpdate: "Ayer", waId: "987654321", verified: false, skills: ["receive-calls", "recognize-owner"] },
    { id: "asst_3", name: "Recordatorios de Citas", status: "Activo", messagesUsed: 890, lastUpdate: "Hace 5 minutos", waId: "112233445", verified: true, skills: ["send-messages"] },
    { id: "asst_4", name: "Bot de Bienvenida", status: "Activo", messagesUsed: 150, lastUpdate: "Hace 3 días", waId: "223344556", verified: false, skills: ["send-messages", "recognize-owner"] },
    { id: "asst_5", name: "Encuestas de Satisfacción", status: "Pausado", messagesUsed: 300, lastUpdate: "La semana pasada", waId: "334455667", verified: false, skills: ["send-messages"] },
    { id: "asst_6", name: "Gestor de Pedidos", status: "Activo", messagesUsed: 750, lastUpdate: "Hoy", waId: "445566778", verified: true, skills: ["payment-auth", "google-sheet"] },
];

const skillOptions = [
    { id: "receive-calls", label: "Recibir llamadas", icon: PhoneCall },
    { id: "make-calls", label: "Hacer llamadas", icon: PhoneOutgoing },
    { id: "send-messages", label: "Enviar mensajes a clientes", icon: MessageSquare },
    { id: "recognize-owner", label: "Reconocer al dueño", icon: UserCheck },
    { id: "payment-auth", label: "Autorizaciones de pagos", icon: CreditCard },
    { id: "billing", label: "Cobranza", icon: Receipt },
    { id: "google-sheet", label: "Inventario de Google Sheet", icon: Sheet },
];

export default function AssistantSkillsPage() {
    const params = useParams();
    const assistantId = params.id;
    const assistant = allAssistants.find(a => a.id === assistantId);

    const [isEditing, setIsEditing] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState(assistant?.skills || []);

    const handleSkillToggle = (skillId: string) => {
        setSelectedSkills(prev => {
            if (prev.includes(skillId)) {
                return prev.filter(s => s !== skillId);
            }
            // For now, let's keep the limit from create page logic, can be adjusted
            // if (prev.length < 3) { 
                return [...prev, skillId];
            // }
            // return prev;
        });
    };

    const handleSave = () => {
        // Here you would typically save the new skills to your backend
        console.log("Saving new skills:", selectedSkills);
        // For now, we'll just update the assistant object in the mock data
        if (assistant) {
            assistant.skills = selectedSkills;
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setSelectedSkills(assistant?.skills || []);
        setIsEditing(false);
    };


    if (!assistant) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Asistente no encontrado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>No se pudo encontrar un asistente con el ID proporcionado.</p>
                        <Button asChild className="mt-4">
                            <Link href="/dashboard/asistentes">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver a Asistentes
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const enabledSkills = skillOptions.filter(skill => assistant.skills.includes(skill.id));

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/asistentes">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Volver a asistentes</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">Habilidades de: {assistant.name}</h1>
                    <p className="text-muted-foreground text-sm">
                        {isEditing ? "Selecciona o modifica las habilidades de tu asistente." : "Estas son las habilidades activas para este asistente."}
                    </p>
                </div>
            </header>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>{isEditing ? "Editar Habilidades" : "Habilidades Activas"}</CardTitle>
                            <CardDescription>
                                {isEditing
                                    ? `Seleccionadas: ${selectedSkills.length} de ${skillOptions.length}`
                                    : `Este bot tiene ${enabledSkills.length} ${enabledSkills.length === 1 ? 'habilidad' : 'habilidades'} activas.`
                                }
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                         <div className="space-y-4">
                            {skillOptions.map((skill) => (
                                <div key={skill.id} className="flex items-center space-x-3 bg-muted/50 p-3 rounded-md">
                                    <Checkbox
                                        id={`edit-${skill.id}`}
                                        checked={selectedSkills.includes(skill.id)}
                                        onCheckedChange={() => handleSkillToggle(skill.id)}
                                    />
                                    <div className="flex items-center gap-3 flex-1">
                                        <skill.icon className="h-5 w-5 text-primary" />
                                        <Label htmlFor={`edit-${skill.id}`} className="font-medium cursor-pointer">
                                            {skill.label}
                                        </Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        enabledSkills.length > 0 ? (
                            <div className="space-y-3">
                                {enabledSkills.map(skill => (
                                    <div key={skill.id} className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg">
                                        <skill.icon className="h-6 w-6 text-primary" />
                                        <p className="font-medium">{skill.label}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Este asistente no tiene habilidades activas.</p>
                        )
                    )}
                </CardContent>
                {isEditing ? (
                    <CardFooter className="justify-end gap-2">
                        <Button variant="ghost" onClick={handleCancel}>
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                        </Button>
                    </CardFooter>
                ) : (
                    <CardFooter className="justify-center">
                        <Button size="lg" className="btn-shiny animated-gradient text-white font-bold w-full md:w-auto" onClick={() => setIsEditing(true)}>
                            <span className="btn-shiny-content flex items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                Cambiar Habilidades
                            </span>
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
