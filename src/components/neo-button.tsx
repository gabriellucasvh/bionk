import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

interface NeoButtonProps extends ComponentProps<'button'> {}

const NeoButton = ({className, ...props}: NeoButtonProps) => {
    return (
      <button
        className={'group/button rounded-lg bg-[#222222] text-black'}
      >
        <span
          className={twMerge(
            'block -translate-x-1 -translate-y-1 rounded-lg border-2 border-[#222222] bg-green-500 px-4 py-1 text-sm font-medium tracking-tight transition-all group-hover/button:-translate-y-2 group-active/button:translate-x-0 group-active/button:translate-y-0 cursor-pointer', className)
          }
          {...props}
        />
      </button>
    )
  }
  
  export default NeoButton