"use client";

import Link from "next/link";
import React from "react";

interface InteractiveLinkProps {
  href: string;
  linkId: number;
  children: React.ReactNode;
}

const InteractiveLink: React.FC<InteractiveLinkProps> = ({ href, linkId, children }) => {
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
      }).catch((error) => {
        console.error("Erro ao registrar clique:", error);
      });
    }
  };

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className="block w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-center font-medium border border-gray-100">
      {children}
    </Link>
  );
};

export default InteractiveLink;
