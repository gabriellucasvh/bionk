import ButtonBack from '@/components/buttons/button-back'
import Image from 'next/image'

export default function NotFound() {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-white'>
            <div className='flex flex-col items-center justify-center space-y-5 min-h-screen px-2'>
                <Image src={"/warning.svg"} alt='error' width={160} height={90} />
                <h2 className='font-gsans font-bold text-5xl'>Oops...</h2>
                <p className='text-center'>Parece que temos algum problema aqui! A página foi movida ou não existe mais.</p>
                <ButtonBack />
            </div>
        </div>
    )
}