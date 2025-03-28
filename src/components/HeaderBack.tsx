import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const HeaderBack = () => {
    return (
        <div className="absolute top-5 left-5 md:top-10 md:left-20 bg-white">
            <Link href="/" className="block">
                <Image
                    src="/bionk-logo.svg"
                    alt="Logo Bionk"
                    width={160}
                    height={90}
                    className="w-16 md:w-20 transition-transform hover:scale-105"
                />
            </Link>
        </div>
    )
}

export default HeaderBack
