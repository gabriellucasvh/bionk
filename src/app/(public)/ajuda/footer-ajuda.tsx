import Image from "next/image"
import Link from "next/link"

const navigation = {
  connect: [
    { name: "Book Meeting", href: "" },
    { name: "Twitter", href: "https://twitter.com/justansub" },
    { name: "Github", href: "https://www.youtube.com/@SpeedyBrand-SEO" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/speedy-brand-inc/" },
  ],
  company: [
    { name: "Blogs", href: "/" },
    { name: "Pricing", href: "/" },
    { name: "Affiliate Partner", href: "/" },
    { name: "AI For Enterprise", href: "/" },
  ],
}

const FooterAjuda = () => {
  return (
    <footer className="bg-gradient-to-r from-green-800 to-green-500 py-10 px-4 text-white rounded-t-2xl shadow-md">
      <div className="mx-auto max-w-7xl text-center">
        <div className="w-fit mx-auto">
          <Link href="/">
            <Image
              priority
              width={120}
              height={50}
              src="/bionk-logo.svg"
              alt="Bionk Logo"
              className="mx-auto mb-4"
            />
          </Link>
        </div>
        <p className="text-lg max-w-md mx-auto">
          O melhor gerenciador de links para o seu negócio.
        </p>
        <div className="mt-6 flex justify-center space-x-6">
          <p>Made with ❤️ from Brasil.</p>
        </div>

        {/* Links */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-2 gap-10 justify-center">
          <div>
            <h3 className="text-md font-semibold tracking-widest">Conexões</h3>
            <ul className="mt-4 space-y-2">
              {navigation.connect.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm hover:text-green-300 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold tracking-widest">Companhia</h3>
            <ul className="mt-4 space-y-2">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-green-300 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-sm">
          &copy; 2024 Bionk. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}

export default FooterAjuda
