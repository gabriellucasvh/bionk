import Footer from '@/components/Footer'
import Header from '@/components/Header'
import React from 'react'

const DescubraClient = () => {
    return (
        <div className='min-h-screen'>
            <Header />
            <div className='bg-green-800 text-white mx-auto min-h-screen flex flex-col items-start justify-center'>
                <h1 className='font-bold text-8xl font-gsans'>A melhor ferramenta de link in bio para todas as suas redes sociais</h1>
                <p className='font- text-2xl font-gsans'>Reúna tudo aquilo que é essencial em um só lugar e facilite o acesso ao seu conteúdo com estilo e praticidade."</p>
            </div>
            <Footer />
        </div>
    )
}

export default DescubraClient