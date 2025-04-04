"use client";

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
      className={twMerge(`relative flex items-center justify-center w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-center font-medium border border-gray-100 ${
        sensitive ? "border-red-200 group overflow-hidden" : ""
      } ${className}`, className)}
    >
      {sensitive && (
        <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md text-white text-sm font-semibold transition-opacity group-hover:opacity-0">
          Conteúdo Sensível - Clique para visualizar
        </span>
      )}
      <span className={`${sensitive ? "group-hover:backdrop-blur-none" : ""}`}>{children}</span>
    </Link>
  );
};

export default InteractiveLink;
