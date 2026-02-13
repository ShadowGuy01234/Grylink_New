import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E5AAF]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#1E5AAF] to-[#3B82F6] text-white shadow-lg shadow-[#1E5AAF]/25 hover:shadow-[#1E5AAF]/40 hover:scale-[1.02] active:scale-[0.98]",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
        outline: "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:border-[#1E5AAF] text-gray-700 hover:text-[#1E5AAF]",
        secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200",
        success: "bg-gradient-to-r from-[#15803D] to-[#22C55E] text-white shadow-lg shadow-[#22C55E]/25 hover:shadow-[#22C55E]/40 hover:scale-[1.02] active:scale-[0.98]",
        ghost: "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
        link: "text-[#3B82F6] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
