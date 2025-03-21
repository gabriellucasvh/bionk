import NotFoundButton from '@/components/not-found-button'
import Image from 'next/image'

export default function NotFound() {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-white'>
            <div className='flex flex-col items-center justify-center space-y-5 min-h-screen px-2'>
                <Image src={"/warning.svg"} alt='error' width={160} height={90} />
                <h2 className='font-baithe tracking-wider text-5xl'>Oops...</h2>
                <p className='text-center'>Parece que temos algum problema aqui! A página foi movida ou não existe mais.</p>
                <NotFoundButton />
            </div>
        </div>
    )
}