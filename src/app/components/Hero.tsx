"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, Link as LinkIcon } from "lucide-react";
import NeoButton from "@/components/buttons/button-neubrutalism";
import { useRouter } from "next/navigation";
import { MotionDiv } from "@/components/ui/motion";

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicked, setIsClicked] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (path: string) => {
    if (isClicked[path]) return;
    setIsClicked((prev) => ({ ...prev, [path]: true }));
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white bg-green-900">
      <MotionDiv
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-green-500 opacity-60 blur-3xl"></div>
        <div className="absolute top-1/2 -left-24 h-96 w-96 rounded-full bg-green-500 opacity-60 blur-3xl"></div>
      </MotionDiv>
      <div className="container relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8 mt-20">
        <div
          className={`mb-6 transform bg-lime-400 block -translate-x-1 -translate-y-1 rounded-lg border-2 border-[#222222] px-4 py-1 text-sm font-medium tracking-tight transition-all duration-700 text-black backdrop-blur-xl ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          TUDO EM UM SÓ LUGAR
        </div>

        <h1
          className={`mb-6 text-center tracking-wider font-gsans text-4xl font-bold text-white transition-all duration-700 sm:text-5xl md:text-6xl lg:text-7xl ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "100ms" }}
        >
          Link para<br className="sm:hidden" />{" "}
          <span className="relative inline-block">
            Sua Bio
            <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-lime-400"></span>
          </span>
        </h1>

        <p
          className={`mb-8 max-w-2xl text-center text-lg text-gray-200 transition-all duration-700 sm:text-xl ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          Unifique todos os seus links em um único lugar elegante. Compartilhe
          sua presença digital com estilo usando o Bionk.
        </p>

        <div
          className={`flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 transition-all duration-700 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <NeoButton
            className="group relative bg-lime-400 overflow-hidden px-6 py-3 text-black"
            onClick={() => handleClick("/registro")}
            disabled={isClicked["/registro"]}
          >
            <span className="relative z-10 flex items-center font-medium">
              Comece Grátis{" "}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 z-0 bg-white opacity-0 transition-opacity group-hover:opacity-100"></span>
          </NeoButton>

          <NeoButton
            className="flex items-center px-6 py-3 font-medium text-black bg-gray-50"
            onClick={() => handleClick("/descubra")}
            disabled={isClicked["/descubra"]}
          >
            Saiba mais <ExternalLink className="ml-2 h-4 w-4" />
          </NeoButton>
        </div>

        <div
          className={`relative mt-16 w-full max-w-4xl transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="aspect-[16/9] overflow-hidden rounded-xl bg-gradient-to-tr from-gray-100 to-gray-50 p-4 shadow-2xl sm:p-8">
            <div className="glass-effect h-full w-full rounded-lg p-6 shadow-inner">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white">
                  <LinkIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="h-4 w-36 rounded-full bg-gray-200"></div>
                  <div className="mt-2 h-3 w-24 rounded-full bg-gray-100"></div>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-14 w-full rounded-lg bg-white/40 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-24 rounded-full bg-gray-200"></div>
                      <div className="h-6 w-6 rounded-full bg-gray-100"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="absolute -right-4 -top-4 h-20 w-20 rounded-xl bg-blue-500/10 backdrop-blur-xl float-animation"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-purple-500/10 backdrop-blur-xl float-animation"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
