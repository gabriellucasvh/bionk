import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

const SimpleBtn = ({ className, ...props }: ComponentProps<"button">) => {
  return (
    <button
      className={twMerge(
        'bg-lime-400 text-green-950 font-medium py-2 px-4 rounded-lg hover:bg-lime-500 transition-colors duration-300', className)
      }
      {...props}
    >
    </button>
  )
}

export default SimpleBtn