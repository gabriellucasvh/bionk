// src/app/(private)/dashboard/personalizar/CategoriasTemplates.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const categories = {
    minimalista: [
        { id: "default", name: "Padrão", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/default.png" },
        { id: "simple", name: "Simples", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/simple.png" },
    ],
    colorido: [
        { id: "vibrant", name: "Vibrante", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/vibrant.png" },
        { id: "gradient", name: "Gradiente", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/gradient.png" },
    ],
    profissional: [
        { id: "business", name: "Empresarial", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747031556/bionk/templates/business.png" },
        { id: "corporate", name: "Corporativo", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/corporate.png" },
    ],
    moderno: [
        { id: "modern", name: "Moderno", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/modern.png" },
        { id: "clean", name: "Clean", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/clean.png" },
    ],
    "dark-mode": [
        { id: "dark", name: "Dark", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/dark.png" },
        { id: "midnight", name: "Midnight", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/midnight.png" },
    ],
    criativo: [
        { id: "artistic", name: "Artístico", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/artistic.png" },
        { id: "unique", name: "Único", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/unique.png" },
    ],
    elegante: [
        { id: "elegant", name: "Elegante", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/elegant.png" },
        { id: "lux", name: "Luxuoso", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/lux.png" },
    ],
    neon: [
        { id: "neon", name: "Neon", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/neon.png" },
        { id: "cyber", name: "Cyberpunk", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/cyber.png" },
    ],
    retro: [
        { id: "retro", name: "Retrô", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/retro.png" },
        { id: "vintage", name: "Vintage", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/vintage.png" },
    ],
    fotografico: [
        { id: "photo", name: "Fotográfico", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/photo.png" },
        { id: "gallery", name: "Galeria", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/gallery.png" },
    ],
};


export default function TemplateSettings() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [currentTemplate, setCurrentTemplate] = useState<{ template: string; templateCategory: string } | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserTemplate = async () => {
            try {
                const response = await fetch('/api/user-template');
                const data = await response.json();
                if (data.template) {
                    setCurrentTemplate({
                        template: data.template,
                        templateCategory: data.templateCategory
                    });
                }
            } catch (error) {
                console.error('Error fetching user template:', error);
            }
        };

        fetchUserTemplate();
    }, []);

    const handleSave = async () => {
        if (!selectedTemplate || !selectedCategory) return;

        setIsSaving(true);
        const startTime = Date.now();

        try {
            const response = await fetch("/api/update-template", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    template: selectedTemplate,
                    templateCategory: selectedCategory,
                }),
            });

            if (response.ok) {
                setCurrentTemplate({
                    template: selectedTemplate,
                    templateCategory: selectedCategory,
                });
                setIsModalOpen(false);
                window.location.reload();
            } else {
                console.error('Error updating template:', await response.text());
            }
        } catch (error) {
            console.error('Error saving template:', error);
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);

            setTimeout(() => {
                setIsSaving(false);
            }, remainingTime);
        }
    };

    const renderContent = () => (
        <>
            <div className="flex flex-wrap gap-2 mb-10">
                {Object.keys(categories).map((category) => (
                    <Button
                        variant="ghost"
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`border-2 px-6 py-3 md:py-5 rounded-lg font-medium text-sm hover:bg-green-950 hover:text-white hover:border-lime-500 transition-colors ${selectedCategory === category ? "bg-green-950 text-white border-lime-500" : ""}`}
                    >
                        {category.replace(/-/g, " ").toUpperCase()}
                    </Button>
                ))}
            </div>

            {selectedCategory && (
                <div className="mt-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-10">
                        <h2 className="text-xl font-semibold">Templates Disponíveis</h2>
                        <Button
                            onClick={handleSave}
                            className="py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 w-full md:w-auto"
                            disabled={!selectedTemplate || isSaving}
                        >
                            {isSaving ? "Salvando..." : "Salvar Template"}
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {categories[selectedCategory as keyof typeof categories]?.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                className={`cursor-pointer p-2 rounded-lg border-2 ${selectedTemplate === template.id ? "border-green-600" : "border-gray-300 hover:border-green-400"}`}
                            >
                                <Image
                                    src={template.image}
                                    alt={template.name}
                                    width={200}
                                    height={120}
                                    className="rounded-lg w-full object-cover aspect-[9/16]"
                                    quality={100}
                                    unoptimized
                                />
                                <p className="text-center mt-2 text-sm">{template.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div>
            {/* Tema atual para telas grandes */}
            {currentTemplate && (
                <div className="mb-6 hidden md:inline-block">
                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                        Tema atual: {currentTemplate.templateCategory.charAt(0).toUpperCase() + currentTemplate.templateCategory.slice(1)} - {
                            categories[currentTemplate.templateCategory as keyof typeof categories]
                                ?.find(t => t.id === currentTemplate.template)?.name || currentTemplate.template
                        }
                    </span>
                </div>
            )}

            {/* Botão para abrir o modal em telas pequenas */} 
            <div className="md:hidden mb-6 relative z-40">
                <Button 
                    onClick={() => setIsModalOpen(true)} 
                    className="py-3 px-10 border-2 bg-green-950 text-white border-lime-500"
                >
                     Templates
                </Button>
            </div>

            {/* Conteúdo para telas grandes */} 
            <div className="hidden md:block">
                {renderContent()}
            </div>

            {/* Modal para telas pequenas */} 
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 md:hidden">
                    <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10"
                        >
                            <X size={20} />
                        </Button>
                        <h2 className="text-2xl font-semibold mb-4 text-center">Escolha seu Template</h2>

                        {/* Tema atual para telas pequenas (dentro do modal) */}
                        {currentTemplate && (
                            <div className="mb-4 text-center md:hidden">
                                <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium">
                                    Tema atual: {currentTemplate.templateCategory.charAt(0).toUpperCase() + currentTemplate.templateCategory.slice(1)} - {
                                        categories[currentTemplate.templateCategory as keyof typeof categories]
                                            ?.find(t => t.id === currentTemplate.template)?.name || currentTemplate.template
                                    }
                                </span>
                            </div>
                        )}
                        {renderContent()}
                    </div>
                </div>
            )}
        </div>
    );
}
