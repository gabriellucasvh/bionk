import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const HeaderBack = () => {
    return (
        <div className='absolute md:top-10 md:left-20 bg-white px-10 py-5 rounded-md'>
            <Link href="/">
                <Image src={"/bionk-logo.svg"} alt='' width={160} height={90} />
            </Link>
        </div>
    )
}

export default HeaderBack