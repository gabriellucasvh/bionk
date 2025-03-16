import Footer from '@/components/Footer'
import Header from '@/components/Header'
import NotFoundButton from '@/components/not-found-button'
import Image from 'next/image'

export default function NotFound() {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-white'>
            <div className='flex flex-col items-center justify-center space-y-5 min-h-screen'>
                <Image src={"/warning.svg"} alt='' width={160} height={90} />
                <h2 className='font-baithe tracking-wide text-5xl'>Oops...</h2>
                <p>Parece que temos algum problema aqui! A página foi movida ou não existe.</p>
                <NotFoundButton />
            </div>
            <Footer />
        </div>
    )
}