'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import HeaderMobile from '@/components/layout/HeaderMobile';


interface Template {
    id: string;
    name: string;
    image: string;
}

const allTemplates: Template[] = [
    { id: "default", name: "Padrão", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/default.png" },
    { id: "simple", name: "Simples", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/simple.png" },
    { id: "vibrant", name: "Vibrante", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/vibrant.png" },
    { id: "gradient", name: "Gradiente", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/gradient.png" },
    { id: "business", name: "Empresarial", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747031556/bionk/templates/business.png" },
    { id: "corporate", name: "Corporativo", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/corporate.png" },
    { id: "modern", name: "Moderno", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/modern.png" },
    { id: "clean", name: "Clean", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/clean.png" },
    { id: "dark", name: "Dark", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/dark.png" },
    { id: "midnight", name: "Midnight", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/midnight.png" },
    { id: "artistic", name: "Artístico", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/artistic.png" },
    { id: "unique", name: "Único", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/unique.png" },
    { id: "elegant", name: "Elegante", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/elegant.png" },
    { id: "lux", name: "Luxuoso", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/lux.png" },
    { id: "neon", name: "Neon", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/neon.png" },
    { id: "cyber", name: "Cyberpunk", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/cyber.png" },
    { id: "retro", name: "Retrô", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/retro.png" },
    { id: "vintage", name: "Vintage", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/vintage.png" },
    { id: "photo", name: "Fotográfico", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/photo.png" },
    { id: "gallery", name: "Galeria", image: "https://res.cloudinary.com/dlfpjuk2r/image/upload/v1747030264/bionk/templates/gallery.png" },
];

const TemplatesClient = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    return (
        <div className='min-h-screen bg-white text-black font-gsans'>
            <Header />
            <HeaderMobile />
            <section className='min-h-screen flex flex-col items-start md:mt-40 justify-start gap-10 px-6 md:px-20 lg:px-40'>
                <div className='w-full lg:w-1/2 space-y-8 text-left pt-16 md:pt-0'>
                    <h1 className='font-bold text-4xl md:text-6xl'>Escolha o template perfeito para você</h1>
                    <p className='leading-tight text-lg md:text-xl text-gray-800'>Personalize seu Bionk com designs modernos e exclusivos, feitos para destacar sua identidade e atrair mais cliques.</p>
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full py-8'>
                    {allTemplates.map((template) => (
                        <div
                            key={template.id}
                            className='cursor-pointer group'
                            onClick={() => setIsModalOpen(true)}
                        >
                            <div className='overflow-hidden rounded-lg border-2 border-gray-200 group-hover:border-lime-500 transition-all duration-300 aspect-[9/16]'>
                                <Image
                                    src={template.image}
                                    alt={template.name}
                                    width={300}
                                    height={533}
                                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                                    quality={90}
                                    unoptimized
                                />
                            </div>
                            <p className='text-center mt-2 text-sm font-medium text-gray-700 group-hover:text-lime-600 transition-colors duration-300'>{template.name}</p>
                        </div>
                    ))}
                </div>
            </section>
            <Footer />
        </div>
    )
}

export default TemplatesClient