import { motion } from "framer-motion";
import { useEffect } from "react";

interface FloatingElementProps {
  size: number;
  startX: number;
  startY: number;
  delay: number;
  duration: number;
  rotate?: number[];
  className?: string;
  children: React.ReactNode;
}

const FloatingElement = ({
  size,
  startX,
  startY,
  delay,
  duration,
  rotate = [0, 15, -15, 0],
  className = "",
  children
}: FloatingElementProps) => (
  <motion.div
    className={`absolute ${className}`}
    style={{ width: size, height: size }}
    initial={{ 
      x: startX, 
      y: startY, 
      opacity: 0,
      scale: 0.8
    }}
    animate={{
      x: [startX, startX + 50, startX - 50, startX],
      y: [startY, startY - 50, startY - 20, startY],
      opacity: [0, 1, 1, 0.8, 1],
      rotate,
      scale: [0.8, 1.1, 0.9, 1]
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);



// Botão animado de cadastro


// Título animado
const AnimatedTitle = () => (
  <motion.div
    className="absolute left-1/2 top-[10%] transform -translate-x-1/2 text-center"
    initial={{ opacity: 0, y: -30 }}
    animate={{ 
      opacity: 1, 
      y: 0
    }}
    transition={{
      duration: 1,
      ease: "easeOut",
    }}
  >
    <motion.h1 
      className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent 
                bg-gradient-to-r from-green-300 to-green-100 mb-2"
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      Seja bem-vindo de volta ao Bionk!
    </motion.h1>
    <motion.p 
      className="text-green-200/80 text-sm md:text-base max-w-xs mx-auto"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.5, 0.8, 0.5] 
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }}
    >
      Acesse sua conta e continue gerenciando seus links com facilidade.
    </motion.p>
  </motion.div>
);

// Fundo de partículas
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-green-500"
          style={{
            width: 2 + Math.random() * 6,
            height: 2 + Math.random() * 6,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.7, 0],
            y: [0, -30 - Math.random() * 100],
            x: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Elemento de padrão hexagonal
const HexagonPattern = () => (
  <div className="absolute inset-0 z-0 opacity-20">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <pattern 
        id="hexagonPattern" 
        width="40" 
        height="40" 
        patternUnits="userSpaceOnUse"
        patternTransform="scale(2) rotate(0)"
      >
        <path 
          d="M10,20 L20,10 L30,20 L20,30 Z" 
          fill="none" 
          stroke="rgba(74, 222, 128, 0.5)" 
          strokeWidth="1"
        />
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#hexagonPattern)" />
    </svg>
  </div>
);

// Efeito de linha conectando elementos
const ConnectingLines = () => (
  <svg className="absolute inset-0 w-full h-full z-0 opacity-30">
    <motion.path
      d="M200,100 Q300,200 400,150 T600,300"
      stroke="rgba(74, 222, 128, 0.5)"
      strokeWidth="2"
      fill="transparent"
      strokeDasharray="10,10"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: 1, 
        opacity: 1,
        strokeDashoffset: [0, -100]
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    <motion.path
      d="M100,300 Q200,200 300,250 T500,150"
      stroke="rgba(134, 239, 172, 0.5)"
      strokeWidth="2"
      fill="transparent"
      strokeDasharray="10,10"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: 1, 
        opacity: 1,
        strokeDashoffset: [0, 100]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </svg>
);

const GreenAnimation = () => {
  useEffect(() => {
    document.documentElement.style.setProperty('--green-200-rgb', '187, 247, 208');
    document.documentElement.style.setProperty('--green-300-rgb', '134, 239, 172');
    document.documentElement.style.setProperty('--green-400-rgb', '74, 222, 128');
    document.documentElement.style.setProperty('--green-500-rgb', '34, 197, 94');
    document.documentElement.style.setProperty('--green-600-rgb', '22, 163, 74');
    document.documentElement.style.setProperty('--green-700-rgb', '21, 128, 61');
  }, []);
  
  const formFields = [
    { label: "Nome completo", icon: "👤" },
    { label: "Email", icon: "✉️" },
    { label: "Senha", icon: "🔒" },
    { label: "Confirmar senha", icon: "✓" }
  ];
  
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-green-900 to-gray-950 backdrop-blur-3xl shadow-xl">
      <ParticleBackground />
      <HexagonPattern />
      <ConnectingLines />
      
      {/* Elementos flutuantes de decoração */}
      <FloatingElement size={70} startX={50} startY={200} delay={0} duration={15}>
        <div className="w-full h-full rounded-full bg-green-700/20 backdrop-blur-sm border border-green-500/10 shadow-lg" />
      </FloatingElement>
      
      <FloatingElement size={50} startX={300} startY={400} delay={1.5} duration={12}>
        <div className="w-full h-full rounded-full bg-green-500/10 backdrop-blur-sm border border-green-300/20 shadow-lg" />
      </FloatingElement>
      
      <FloatingElement 
        size={60} 
        startX={500} 
        startY={150} 
        delay={2} 
        duration={18}
        rotate={[0, 25, -25, 0]}
      >
        <div className="w-full h-full rounded-full bg-green-600/15 backdrop-blur-sm border border-green-400/10 shadow-lg" />
      </FloatingElement>
      
      <FloatingElement size={40} startX={150} startY={500} delay={2.5} duration={14}>
        <div className="w-full h-full rounded-full bg-green-400/10 backdrop-blur-sm border border-green-200/20 shadow-lg" />
      </FloatingElement>
      
      <FloatingElement size={55} startX={450} startY={300} delay={3} duration={16}>
        <div className="w-full h-full rounded-full bg-green-300/10 backdrop-blur-sm border border-green-100/20 shadow-lg" />
      </FloatingElement>
      
      {/* Título */}
      <AnimatedTitle />
      
      {/* Campos de formulário animados */}

      {/* Botão de cadastro */}
    </div>
  );
};

export default GreenAnimation;