"use client"
import { useEffect } from "react";
import { X } from "lucide-react";
import { MotionDiv, MotionButton } from "./ui/motion";

type ToastProps = {
  message: string;
  variant: "success" | "warning" | "error";
  onClose: () => void;
};

const variantStyles = {
  success: "bg-green-500 border-green-700",
  warning: "bg-yellow-500 border-yellow-700",
  error: "bg-red-500 border-red-700",
};

export default function Toast({ message, variant, onClose }: ToastProps) {
  useEffect(() => {
    const timeout = setTimeout(onClose, 5000);
    return () => {
      clearTimeout(timeout);
    };
  }, [onClose]);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 w-80 p-4 text-white rounded-lg shadow-lg border border-b-0 ${variantStyles[variant]}`}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <MotionButton 
          onClick={onClose} 
          className="text-white"
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={18} />
        </MotionButton>
      </div>
      <MotionDiv
        className="absolute bottom-0 left-0 h-1 bg-white border-b rounded-full ml-1" 
        initial={{ width: "100%" }} 
        animate={{ width: "0%" }} 
        transition={{ duration: 5, ease: "linear" }}
      />
    </MotionDiv>
  );
}