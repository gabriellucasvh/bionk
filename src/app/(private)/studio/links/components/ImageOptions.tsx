"use client";

import { GalleryVerticalEnd, Image as ImageIcon, Images } from "lucide-react";

interface ImageOptionsProps {
  onOptionSelect: (option: "image_single" | "image_column" | "image_carousel") => void;
}

const ImageOptions = ({ onOptionSelect }: ImageOptionsProps) => {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onOptionSelect("image_single")}
          className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500">
            <ImageIcon className="h-6 w-6 text-white" />
          </div>
          <span className="font-medium text-sm">Única</span>
        </button>

        <button
          type="button"
          onClick={() => onOptionSelect("image_column")}
          className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500">
            <Images className="h-6 w-6 text-white" />
          </div>
          <span className="font-medium text-sm">Coluna</span>
        </button>

        <button
          type="button"
          onClick={() => onOptionSelect("image_carousel")}
          className="flex flex-col items-center gap-2 rounded-lg p-6 transition-colors hover:bg-muted"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500">
            <GalleryVerticalEnd className="h-6 w-6 text-white" />
          </div>
          <span className="font-medium text-sm">Carrossel</span>
        </button>
      </div>
    </div>
  );
};

export default ImageOptions;