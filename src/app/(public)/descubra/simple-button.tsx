import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

interface NeoButtonProps extends ComponentProps<'button'> { }

const SimpleBtn = ({ className, ...props }: NeoButtonProps) => {
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