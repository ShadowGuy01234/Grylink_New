import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E5AAF] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#1E5AAF]/15 text-[#1E5AAF] border-[#1E5AAF]/20",
        secondary: "border-transparent bg-gray-100 text-gray-700",
        destructive: "border-transparent bg-red-50 text-red-700 border-red-200",
        success: "border-transparent bg-[#22C55E]/15 text-[#15803D] border-[#22C55E]/20",
        warning: "border-transparent bg-amber-50 text-amber-700 border-amber-200",
        outline: "text-gray-600 border-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
