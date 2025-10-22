"use client";

import Image from "next/image";

interface MusicOptionsProps {
  onOptionSelect: (option: "spotify") => void;
}

const MusicOptions = ({ onOptionSelect }: MusicOptionsProps) => {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <button
          className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
          onClick={() => onOptionSelect("spotify")}
          type="button"
        >
          <div
            className="relative w-20 overflow-hidden rounded-2xl border bg-[#1DB954]"
            style={{ aspectRatio: "6 / 7" }}
          >
            <Image alt="Spotify" className="object-cover" fill src="/icons/spotify.svg" />
          </div>
          <span className="font-medium text-sm">Spotify</span>
        </button>
      </div>
    </div>
  );
};

export default MusicOptions;
