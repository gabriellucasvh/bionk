"use client"
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const HeaderBack = () => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isClicked) {
      e.preventDefault();
    } else {
      setIsClicked(true);
    }
  };

  return (
    <div className="absolute flex justify-center items-center top-0 left-0 w-full h-20 z-50">
      <Link href="/" className="block" onClick={handleClick}>
        <Image
          src="/bionk-logo.svg"
          alt="Logo Bionk"
          width={160}
          height={90}
          className="w-16 md:w-20 transition-transform hover:scale-105"
        />
      </Link>
    </div>
  );
};

export default HeaderBack;
