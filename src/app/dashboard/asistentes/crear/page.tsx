
'use client'

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Fingerprint, Milestone, Sparkles, Wand2, X, Info, Image as ImageIcon, Briefcase, User, Heart, Bot as BotIcon, Phone, PhoneCall, PhoneOutgoing, MessageSquare, UserCheck, CreditCard, Receipt, Sheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PhoneInput } from "@/components/ui/phone-input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

const baseSteps = [
    { name: "Nombre del Asistente", icon: Wand2 },
    { name: "Imagen de Perfil", icon: ImageIcon },
    { name: "Notificaciones (Opcional)", icon: Phone },
    { name: "Personalidad", icon: Fingerprint },
];

const customPromptStep = { name: "Comportamiento", icon: FileText };
const skillsStep = { name: "Habilidades", icon: Milestone };


const personalityOptions = [
    { id: "sales", title: "Vendedor", description: "Enfocado en ventas y promociones.", icon: Briefcase },
    { id: "support", title: "Agente de Soporte", description: "Ayuda y resuelve dudas de clientes.", icon: Heart },
    { id: "personal", title: "Asistente Personal", description: "Organiza y gestiona tareas personales.", icon: User },
    { id: "custom", title: "Yo Mismo / Personalizado", description: "Configuración manual y avanzada.", icon: BotIcon },
]

const skillOptions = [
    { id: "receive-calls", label: "Recibir llamadas", icon: PhoneCall },
    { id: "make-calls", label: "Hacer llamadas", icon: PhoneOutgoing },
    { id: "send-messages", label: "Enviar mensajes a clientes", icon: MessageSquare },
    { id: "recognize-owner", label: "Reconocer al dueño", icon: UserCheck },
    { id: "payment-auth", label: "Autorizaciones de pagos", icon: CreditCard },
    { id: "billing", label: "Cobranza", icon: Receipt },
    { id: "google-sheet", label: "Inventario de Google Sheet", icon: Sheet },
];


const restrictedWords = ["whatsapp", "meta", "facebook", "oficial", "verified"];

const validateName = (name: string): string[] => {
    const errors: string[] = [];
    if (name.length < 3) {
        errors.push("El nombre debe tener al menos 3 caracteres.");
    }
    if (name.length > 50) {
        errors.push("El nombre no puede exceder los 50 caracteres.");
    }
    if (restrictedWords.some(word => name.toLowerCase().includes(word))) {
        errors.push(`No puede contener palabras restringidas como: ${restrictedWords.join(", ")}.`);
    }
    if (/[^a-zA-Z0-9\sÁÉÍÓÚáéíóúñÑüÜ]/.test(name)) {
        errors.push("No se permiten símbolos ni emojis.");
    }
    if (name.toUpperCase() === name && name.length > 2) {
        errors.push("Evita usar solo mayúsculas.");
    }
    return errors;
};

export default function CreateAssistantPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [assistantName, setAssistantName] = useState("");
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [assistantImage, setAssistantImage] = useState<string | null>(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
    const [customPrompt, setCustomPrompt] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const router = useRouter();

    const isNameValid = useMemo(() => assistantName.length > 2 && validationErrors.length === 0, [assistantName, validationErrors]);

    const steps = useMemo(() => {
        const newSteps = [...baseSteps];
        if (selectedPersonality === 'custom') {
            newSteps.push(customPromptStep);
        }
        newSteps.push(skillsStep);
        return newSteps;
    }, [selectedPersonality]);

    useEffect(() => {
        if (assistantName) {
            setValidationErrors(validateName(assistantName));
        } else {
            setValidationErrors([]);
        }
    }, [assistantName]);

    const handleSuggestName = () => {
        const suggestions = ["Soporte Ventas Pro", "Atención al Cliente Digital", "Asesor Inmobiliario 24/7"];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        setAssistantName(randomSuggestion);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAssistantImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSkillToggle = (skillId: string) => {
        setSelectedSkills(prev => {
            if (prev.includes(skillId)) {
                return prev.filter(s => s !== skillId);
            }
            if (prev.length < 3) {
                return [...prev, skillId];
            }
            return prev;
        });
    };

    const isStepComplete = (stepIndex: number) => {
        const step = steps[stepIndex];
        switch (step.name) {
            case "Nombre del Asistente":
                return isNameValid;
            case "Imagen de Perfil":
                return assistantImage !== null;
            case "Notificaciones (Opcional)":
                return true;
            case "Personalidad":
                return selectedPersonality !== null;
            case "Comportamiento":
                return customPrompt.length > 10; // Require some minimum length for the prompt
            case "Habilidades":
                return selectedSkills.length > 0;
            default:
                return false;
        }
    }
    
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
             // Final action
             console.log("Redirecting to creation page...");
             router.push('/dashboard/asistentes/creando');
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }
    
    const CurrentStepComponent = useCallback(() => {
        const step = steps[currentStep];
        switch(step.name) {
            case "Nombre del Asistente":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Paso 1: Define el nombre de tu asistente</CardTitle>
                            <CardDescription>Este será el nombre público de tu bot en WhatsApp. Asegúrate de seguir las políticas de Meta.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="assistant-name">Nombre del Asistente (Display Name)</Label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Input 
                                      id="assistant-name" 
                                      placeholder="Ej: Soporte Hey Manito" 
                                      value={assistantName}
                                      onChange={(e) => setAssistantName(e.target.value)}
                                      className={cn(
                                        validationErrors.length > 0 ? "border-destructive focus-visible:ring-destructive" :
                                        assistantName && isNameValid && "border-green-500 focus-visible:ring-green-500"
                                      )}
                                    />
                                    <Button variant="outline" onClick={handleSuggestName}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Sugerir nombre
                                    </Button>
                                </div>
                                {validationErrors.length > 0 && (
                                    <div className="p-3 bg-destructive/10 border-l-4 border-destructive text-destructive-foreground mt-2 rounded-r-md">
                                        <h4 className="font-semibold flex items-center gap-2 mb-1"><X className="h-5 w-5"/> Nombre no válido</h4>
                                        <ul className="text-sm list-disc pl-5">
                                           {validationErrors.map((error, i) => <li key={i}>{error}</li>)}
                                        </ul>
                                    </div>
                                )}
                                 {isNameValid && (
                                    <div className="p-3 bg-green-500/10 border-l-4 border-green-500 text-green-700 mt-2 rounded-r-md">
                                        <h4 className="font-semibold flex items-center gap-2"><Check className="h-5 w-5"/> ¡Nombre válido!</h4>
                                        <p className="text-sm">Este nombre cumple con las políticas de Meta.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground flex items-start gap-2">
                                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                                <span>
                                    Meta revisa que el nombre visible (Display Name) cumpla con sus políticas de marca y autenticidad. El nombre debe representar claramente a tu empresa.
                                </span>
                            </div>

                        </CardContent>
                    </Card>
                );
            case "Imagen de Perfil":
                return (
                     <Card>
                        <CardHeader>
                            <CardTitle>Paso 2: Imagen de Perfil</CardTitle>
                            <CardDescription>Sube una imagen de perfil para tu asistente. Debe ser cuadrada y de al menos 640x640px.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-40 h-40 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                                    {assistantImage ? (
                                        <Image src={assistantImage} alt="Avatar del asistente" width={160} height={160} className="object-cover w-full h-full" />
                                    ) : (
                                        <ImageIcon className="w-20 h-20 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="w-full max-w-sm">
                                    <Label htmlFor="picture" className="sr-only">Elegir archivo</Label>
                                    <Input id="picture" type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                                </div>
                            </div>
                            
                            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground flex items-start gap-2">
                                <Info className="h-5 w-5 shrink-0 mt-0.5" />
                                <span>
                                    La imagen de perfil es clave para la identidad de tu marca en WhatsApp. Asegúrate de que sea clara y representativa.
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                );
             case "Notificaciones (Opcional)":
                return (
                    <Card>
                         <CardHeader>
                             <CardTitle>Paso 3: Notificaciones al Propietario (Opcional)</CardTitle>
                             <CardDescription>Ingresa tu número de teléfono si deseas recibir notificaciones importantes del asistente, como errores críticos o solicitudes que requieran tu atención.</CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-6">
                              <div className="space-y-2">
                                 <Label htmlFor="phone-number">Tu Número de Teléfono</Label>
                                  <PhoneInput
                                     value={phoneNumber}
                                     onChange={(phone) => setPhoneNumber(phone)}
                                     defaultCountry="MX"
                                   />
                             </div>
                             <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground flex items-start gap-2">
                                 <Info className="h-5 w-5 shrink-0 mt-0.5" />
                                 <span>
                                     Este paso es completamente opcional. Si no ingresas un número, simplemente no recibirás alertas por WhatsApp.
                                 </span>
                             </div>
                         </CardContent>
                     </Card>
                );
             case "Personalidad":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Paso 4: Personalidad</CardTitle>
                            <CardDescription>¿Cuál es el rol principal de tu asistente? Esto nos ayudará a pre-configurarlo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {personalityOptions.map((option) => (
                                    <Card 
                                        key={option.id}
                                        className={cn(
                                            "cursor-pointer hover:border-primary transition-colors flex flex-col justify-center items-center text-center p-4",
                                            selectedPersonality === option.id && "border-primary ring-2 ring-primary"
                                        )}
                                        onClick={() => setSelectedPersonality(option.id)}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <option.icon className="h-8 w-8 text-primary" />
                                            <p className="font-semibold text-base">{option.title}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            case "Comportamiento":
                return (
                     <Card>
                        <CardHeader>
                            <CardTitle>Paso 5: Comportamiento Personalizado</CardTitle>
                            <CardDescription>Define el prompt que guiará la personalidad y el comportamiento de tu asistente. Sé lo más detallado posible.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="custom-prompt">Prompt del Sistema</Label>
                                <Textarea
                                    id="custom-prompt"
                                    placeholder="Ej: Eres un asistente virtual amigable y servicial llamado Manito. Tu objetivo principal es ayudar a los usuarios con sus preguntas sobre nuestros productos. Siempre responde en un tono positivo y nunca reveles que eres un bot."
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    rows={8}
                                />
                                {customPrompt.length > 0 && customPrompt.length <= 10 && (
                                    <p className="text-sm text-muted-foreground">Sigue escribiendo, un buen prompt tiene más detalle.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            case "Habilidades":
                return (
                     <Card>
                        <CardHeader>
                            <CardTitle>Paso {steps.findIndex(s => s.name === "Habilidades") + 1}: Habilidades del Asistente</CardTitle>
                            <CardDescription>Selecciona hasta 3 habilidades clave para tu bot. Esto definirá sus capacidades principales.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {skillOptions.map((skill) => (
                                    <div key={skill.id} className="flex items-center space-x-3 bg-muted/50 p-3 rounded-md">
                                        <Checkbox
                                            id={skill.id}
                                            checked={selectedSkills.includes(skill.id)}
                                            onCheckedChange={() => handleSkillToggle(skill.id)}
                                            disabled={!selectedSkills.includes(skill.id) && selectedSkills.length >= 3}
                                        />
                                        <div className="flex items-center gap-3 flex-1">
                                            <skill.icon className="h-5 w-5 text-primary" />
                                            <Label htmlFor={skill.id} className="font-medium cursor-pointer">
                                                {skill.label}
                                            </Label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
        }
    }, [
        currentStep, steps, assistantName, validationErrors, isNameValid, 
        assistantImage, phoneNumber, selectedPersonality, customPrompt, selectedSkills
    ]);


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
                    <h1 className="text-2xl font-bold tracking-tight font-headline">Crear Nuevo Asistente</h1>
                    <p className="text-muted-foreground text-sm">Sigue los pasos para configurar tu nuevo bot.</p>
                </div>
            </header>
            
            <div className="grid md:grid-cols-4 gap-8 flex-1">
                <aside className="hidden md:flex flex-col gap-2">
                    <nav className="flex flex-col gap-1">
                        {steps.map((step, index) => (
                            <Button
                                key={step.name}
                                variant={currentStep === index ? "secondary" : "ghost"}
                                className="justify-start gap-3"
                                onClick={() => setCurrentStep(index)}
                                disabled={index > 0 && !isStepComplete(index - 1)}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep > index || isStepComplete(index) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {currentStep > index || isStepComplete(index) ? <Check className="h-4 w-4"/> : index + 1}
                                </div>
                                <step.icon className="h-4 w-4" />
                                <span>{step.name}</span>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <main className="md:col-span-3">
                    <div className="relative">
                        <CurrentStepComponent />
                        <Card className="mt-4">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center">
                                    <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Anterior
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="btn-shiny animated-gradient text-white font-bold"
                                        onClick={handleNext}
                                        disabled={!isStepComplete(currentStep)}
                                    >
                                        <span className="btn-shiny-content flex items-center">
                                            {currentStep === steps.length - 1 ? 'Finalizar Creación' : 'Siguiente Paso'}
                                            {currentStep === steps.length - 1 ? <Check className="ml-2 h-4 w-4" /> : <ArrowLeft className="ml-2 h-4 w-4 transform rotate-180" />}
                                        </span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
