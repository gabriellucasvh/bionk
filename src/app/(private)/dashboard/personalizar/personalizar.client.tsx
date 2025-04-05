'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import CategoriasTemplates from './CategoriasTemplates'

const Animacoes = [
    { id: 1, name: 'Fade', value: 'fade' },
    { id: 2, name: 'Slide', value: 'slide' },
    { id: 3, name: 'Zoom', value: 'zoom' },
]

const Fontes = [
    { id: 1, name: 'Sans (Padrão)', value: 'sans' },
    { id: 2, name: 'Serif', value: 'serif' },
    { id: 3, name: 'Monoespaçada', value: 'mono' },
    { id: 4, name: 'Poppins', value: 'poppins' },
    { id: 5, name: 'Inter', value: 'inter' },
    { id: 6, name: 'Rubik', value: 'rubik' },
    { id: 7, name: 'Lato', value: 'lato' },
    { id: 8, name: 'Montserrat', value: 'montserrat' },

]
const PersonalizarClient = () => {
    const [imagem, setImagem] = useState<File | null>(null)

    const handleImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setImagem(e.target.files[0])
    }

    const removerImagem = () => setImagem(null)

    return (
        <div className='min-h-screen bg-white text-black font-gsans'>
            <section className='min-h-screen flex flex-col gap-10 px-6 py-16'>

                <section>
                    <h2 className='font-bold text-lg md:text-2xl mb-4'>Templates:</h2>
                    <CategoriasTemplates />
                </section>

                {/* Upload de Imagem */}
                    {/* <div className='flex flex-wrap gap-2'>
                        <label className='font-bold text-lg md:text-2xl mb-4'>Imagem de fundo:</label>
                        <input
                            type='file'
                            accept='image/*'
                            onChange={handleImagem}
                            className='file:px-4 file:py-2 file:rounded file:border-0 file:bg-green-900 file:text-white file:cursor-pointer'
                        />
                        {imagem && (
                            <div className='flex items-center justify-between bg-gray-100 p-4 rounded'>
                                <span className='text-sm'>{imagem.name}</span>
                                <Button variant={'destructive'} onClick={removerImagem} className='text-red-600 font-semibold hover:underline text-sm'>
                                    Remover
                                </Button>
                            </div>
                        )}
                    </div> */}

                    {/* Animações */}
                    {/* <section>
                        <div className='flex flex-wrap gap-3'>
                            <h2 className='font-bold text-lg md:text-2xl mb-4'>Animações:</h2>
                            {Animacoes.map((item) => (
                                <div key={item.id}>
                                    <Button variant={'ghost'} className='border-2 px-6 py-5 rounded-lg font-medium text-sm hover:bg-green-950 hover:text-white hover:border-lime-500 transition-colors' value={item.value}>{item.name}</Button>
                                </div>
                            ))}
                        </div>
                    </section> */}

                    {/* Fontes */}
                    {/* <section>
                        <div className='flex flex-wrap gap-3'>
                            <h2 className='font-bold text-lg md:text-2xl mb-4'>Fonte:</h2>
                            {Fontes.map((item) => (
                                <div className='' key={item.id}>
                                    <Button variant={'ghost'} className='border-2 px-6 py-5 rounded-lg font-medium text-sm hover:bg-green-950 hover:text-white hover:border-lime-500 transition-colors' value={item.value}>{item.name}</Button>
                                </div>
                            ))}
                        </div>
                    </section> */}

                </section>
        </div>
    )
}

export default PersonalizarClient
