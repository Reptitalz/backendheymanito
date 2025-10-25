
'use client'

import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Check, Fingerprint, Milestone, Sparkles, Wand2, X, Info, Image as ImageIcon, Upload, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PhoneInput } from "@/components/ui/phone-input";

const steps = [
    { name: "Nombre del Asistente", icon: Wand2 },
    { name: "Imagen de Perfil", icon: ImageIcon },
    { name: "Número de Teléfono", icon: Phone },
    { name: "Personalidad", icon: Fingerprint },
    { name: "Conocimiento", icon: Milestone },
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

    const isNameValid = useMemo(() => assistantName.length > 2 && validationErrors.length === 0, [assistantName, validationErrors]);

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

    const isStepComplete = (stepIndex: number) => {
        if (stepIndex === 0) return isNameValid;
        if (stepIndex === 1) return assistantImage !== null;
        if (stepIndex === 2) return phoneNumber.length > 8; // Simple validation for now
        return false;
    }


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
                    {currentStep === 0 && (
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

                                <div className="flex justify-end">
                                     <Button 
                                        size="lg" 
                                        className="btn-shiny animated-gradient text-white font-bold"
                                        disabled={!isNameValid}
                                        onClick={() => setCurrentStep(1)}
                                     >
                                        <span className="btn-shiny-content flex items-center">
                                            Siguiente Paso
                                            <ArrowLeft className="ml-2 h-4 w-4 transform rotate-180" />
                                        </span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {currentStep === 1 && (
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

                                <div className="flex justify-between">
                                    <Button variant="outline" onClick={() => setCurrentStep(0)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Anterior
                                    </Button>
                                     <Button 
                                        size="lg" 
                                        className="btn-shiny animated-gradient text-white font-bold"
                                        disabled={!isStepComplete(1)}
                                        onClick={() => setCurrentStep(2)}
                                     >
                                        <span className="btn-shiny-content flex items-center">
                                            Siguiente Paso
                                            <ArrowLeft className="ml-2 h-4 w-4 transform rotate-180" />
                                        </span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {currentStep === 2 && (
                       <Card>
                            <CardHeader>
                                <CardTitle>Paso 3: Número de Teléfono</CardTitle>
                                <CardDescription>Define el número de teléfono que usará tu asistente.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                 <div className="space-y-2">
                                    <Label htmlFor="phone-number">Número de Teléfono</Label>
                                     <PhoneInput
                                        value={phoneNumber}
                                        onChange={(phone) => setPhoneNumber(phone)}
                                        defaultCountry="MX"
                                      />
                                </div>
                                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground flex items-start gap-2">
                                    <Info className="h-5 w-5 shrink-0 mt-0.5" />
                                    <span>
                                        Importante: El número de teléfono que utilices no debe tener una cuenta de WhatsApp o WhatsApp Business vinculada.
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Anterior
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="btn-shiny animated-gradient text-white font-bold"
                                        disabled={!isStepComplete(2)}
                                        onClick={() => setCurrentStep(3)}
                                    >
                                        <span className="btn-shiny-content flex items-center">
                                            Siguiente Paso
                                            <ArrowLeft className="ml-2 h-4 w-4 transform rotate-180" />
                                        </span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                     {currentStep === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Paso 4: Personalidad</CardTitle>
                                <CardDescription>Define cómo se comportará tu asistente.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Aquí configurarás la personalidad de tu bot.</p>
                                 <div className="flex justify-between mt-6">
                                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Anterior
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="btn-shiny animated-gradient text-white font-bold"
                                        onClick={() => setCurrentStep(4)}
                                    >
                                        <span className="btn-shiny-content flex items-center">
                                            Siguiente Paso
                                            <ArrowLeft className="ml-2 h-4 w-4 transform rotate-180" />
                                        </span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}

    

    

    