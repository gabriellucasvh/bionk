import Image from 'next/image'
import Link from 'next/link'

const navigation = {
  connect: [
    { name: 'Book Meeting', href: '' },
    {
      name: 'Twitter',
      href: 'https://twitter.com/justansub',
    },
    {
      name: 'Github',
      href: 'https://www.youtube.com/@SpeedyBrand-SEO',
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/speedy-brand-inc/',
    },
  ],
  company: [
    { name: 'Blogs', href: '/' },
    { name: 'Pricing', href: '/' },
    { name: 'Affiliate Partner', href: '/' },
    { name: 'AI For Enterprise', href: '/' },
  ],
}

const Footer = () => {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="font-inter w-full  bg-gray-100 py-10 text-black"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-2">
        <div className="flex flex-col justify-between lg:flex-row">
          <div className="space-y-8">
            <Image
              priority={true}
              unoptimized={true}
              width={100}
              height={40}
              src="/images/syntaxUI.svg"
              alt="logo"
              className="h-7 w-auto"
            />
            <p className="text-md max-w-xs leading-6 ">
                O melhor gerenciador de links para o seu negócio.
            </p>
            <div className="flex space-x-6 text-sm ">
              <div>Made with ❤️ by <Link className='underline decoration-2 decoration-blue-500 hover:text-blue-500 transition-colors duration-200' href={"https://prysmus.com"}>Prysmus</Link>.</div>
            </div>
          </div>
          {/* Navigations */}
          <div className="mt-16 grid grid-cols-2 gap-14 md:grid-cols-2 lg:mt-0 xl:col-span-2">
            <div className="md:mt-0">
              <h3 className="text-sm font-semibold leading-6">
                Conexões
              </h3>
              <div className="mt-6 space-y-4">
                {navigation.connect.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm leading-6 hover:text-blue-500 transition-colors duration-200 "
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div>
                <h3 className="text-sm font-semibold leading-6 ">
                  Companhia
                </h3>
                <div className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 hover:text-blue-500 transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24 dark:border-gray-100/10">
          <p className="text-xs leading-5 ">
            &copy; 2024 Bionk. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer