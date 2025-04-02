// components/InteractiveLink.tsx
"use client";

import Link from "next/link";
import React from "react";

interface InteractiveLinkProps {
  href: string;
  linkId: number;
  children: React.ReactNode;
}

const InteractiveLink: React.FC<InteractiveLinkProps> = ({
  href,
  linkId,
  children,
}) => {
  const handleClick = async () => {
    try {
      await fetch("/api/link-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      });
    } catch (error) {
      console.error("Failed to record link click:", error);
    }
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="block w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-center font-medium border border-gray-100"
    >
      {children}
    </Link>
  );
};

export default InteractiveLink;
