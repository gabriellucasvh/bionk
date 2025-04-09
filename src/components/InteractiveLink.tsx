"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

interface InteractiveLinkProps {
  href: string;
  linkId: number;
  children: React.ReactNode;
  sensitive?: boolean;
  className?: string;
}

const InteractiveLink: React.FC<InteractiveLinkProps> = ({
  href,
  linkId,
  children,
  sensitive,
  className = "",
}) => {
  const handleClick = () => {
    const url = "/api/link-click";
    const data = JSON.stringify({ linkId });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, data);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      }).catch((error) => console.error("Erro ao registrar clique:", error));
    }
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={twMerge(`relative flex items-center justify-center w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-start font-medium border border-gray-100 ${sensitive ? "border-red-200 group overflow-hidden" : ""
        } ${className}`, className)}
    >
      {sensitive && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full rounded-lg backdrop-blur-md transition-all duration-300 group-hover:backdrop-blur-none" />
          <span className="absolute flex items-center gap-2 text-sm font-semibold text-white bg-black/60 bg-opacity-50 px-3 py-1 rounded-md transition-opacity duration-300 group-hover:opacity-0">
           <Eye size={16}/> Conteúdo sensível
          </span>
        </div>
      )}


      <span className={twMerge(
        "break-words whitespace-pre-wrap w-full",
        sensitive ? "group-hover:backdrop-blur-none" : ""
      )}>
        {children}
      </span>

    </Link>
  );
};

export default InteractiveLink;
