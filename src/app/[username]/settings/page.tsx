// src/app/[username]/settings/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

const categories = {
    minimalista: [
        { id: "default", name: "Padrão", image: "/person.png" },
        { id: "simple", name: "Simples", image: "/person.png" },
    ],
    colorido: [
        { id: "vibrant", name: "Vibrante", image: "/person.png" },
        { id: "gradient", name: "Gradiente", image: "/person.png" },
    ],
    profissional: [
        { id: "business", name: "Empresarial", image: "/person.png" },
        { id: "corporate", name: "Corporativo", image: "/person.png" },
    ],
    moderno: [
        { id: "modern", name: "Moderno", image: "/person.png" },
        { id: "clean", name: "Clean", image: "/person.png" },
    ],
    "dark-mode": [
        { id: "dark", name: "Dark", image: "/person.png" },
        { id: "midnight", name: "Midnight", image: "/person.png" },
    ],
    criativo: [
        { id: "artistic", name: "Artístico", image: "/person.png" },
        { id: "unique", name: "Único", image: "/person.png" },
    ],
    elegante: [
        { id: "elegant", name: "Elegante", image: "/person.png" },
        { id: "lux", name: "Luxuoso", image: "/person.png" },
    ],
    neon: [
        { id: "neon", name: "Neon", image: "/person.png" },
        { id: "cyber", name: "Cyberpunk", image: "/person.png" },
    ],
    retro: [
        { id: "retro", name: "Retrô", image: "/person.png" },
        { id: "vintage", name: "Vintage", image: "/person.png" },
    ],
    fotografico: [
        { id: "photo", name: "Fotográfico", image: "/person.png" },
        { id: "gallery", name: "Galeria", image: "/person.png" },
    ],
};

export default function TemplateSettings() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const handleSave = async () => {
        if (!selectedTemplate) return;

        await fetch("/api/update-template", {
            method: "POST",
            body: JSON.stringify({
                template: selectedTemplate,
                templateCategory: selectedCategory,
            }),
        });

        alert("Template atualizado com sucesso!");
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-2xl font-bold text-center mb-4">Escolha um Template</h1>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.keys(categories).map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`p-3 rounded-lg text-center ${selectedCategory === category ? "bg-blue-500" : "bg-gray-700"
                            }`}
                    >
                        {category.replace("-", " ").toUpperCase()}
                    </button>
                ))}
            </div>

            {selectedCategory && (
                <div className="mt-4">
                    <h2 className="text-xl font-semibold mb-3">Templates Disponíveis</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedCategory &&
                            categories[selectedCategory as keyof typeof categories]?.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template.id)}
                                    className={`cursor-pointer p-2 rounded-lg border-2 ${selectedTemplate === template.id ? "border-blue-500" : "border-gray-700"
                                        }`}
                                >
                                    <Image
                                        src={template.image}
                                        alt={template.name}
                                        width={200}
                                        height={120}
                                        className="rounded-lg"
                                    />
                                    <p className="text-center mt-2">{template.name}</p>
                                </div>
                            ))
                        }

                    </div>

                    <button
                        onClick={handleSave}
                        className="mt-6 w-full bg-green-500 py-2 rounded-lg text-lg"
                        disabled={!selectedTemplate}
                    >
                        Salvar Template
                    </button>
                </div>
            )}
        </div>
    );
}
