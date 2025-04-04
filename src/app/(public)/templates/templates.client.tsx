import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import HeaderMobile from '@/components/layout/HeaderMobile';
import Link from 'next/link';

const Categorias = [
    {
        id: 1,
        name: 'Minimalista',
        href: '#'
    },
    {
        id: 2,
        name: 'Colorido',
        href: '#'
    },
    {
        id: 3,
        name: 'Profissional',
        href: '#'
    },
    {
        id: 4,
        name: 'Moderno',
        href: '#'
    },
    {
        id: 5,
        name: 'Dark Mode',
        href: '#'
    },
    {
        id: 6,
        name: 'Criativo',
        href: '#'
    },
    {
        id: 7,
        name: 'Elegante',
        href: '#'
    },
    {
        id: 8,
        name: 'Neon',
        href: '#'
    },
    {
        id: 9,
        name: 'Retro',
        href: '#'
    },
    {
        id: 10,
        name: 'Fotográfico',
        href: '#'
    }
];


const TemplatesClient = () => {
    return (
        <div className='min-h-screen bg-white text-black font-gsans'>
            <Header />
            <HeaderMobile />
            <section className='min-h-screen flex flex-col items-start md:mt-40 justify-start gap-10 px-6 md:px-20 lg:px-40'>
                <div className='w-full lg:w-1/2 space-y-8 text-left pt-16 md:pt-0'>
                    <h1 className='font-bold text-4xl md:text-6xl'>Escolha o template perfeito para você</h1>
                    <p className='leading-tight text-lg md:text-xl text-gray-800'>Personalize seu Bionk com designs modernos e exclusivos, feitos para destacar sua identidade e atrair mais cliques.</p>
                </div>
                <div>
                    <p className='font-bold text-lg md:text-2xl'>Categorias:</p>
                </div>
                <div className='flex gap-2 w-full'>
                    {Categorias.map((item) => (
                        <div key={item.id} className='space-y-4'>
                            <Link href={item.href} className='text-md font-semibold border-2 p-4 rounded-lg hover:bg-green-950 hover:text-white hover:border-lime-500 transition-colors duration-400'>{item.name}</Link>
                        </div>
                    ))}
                </div>
                <span>Em construção...</span>
            </section>
            <Footer />
        </div>
    )
}

export default TemplatesClient