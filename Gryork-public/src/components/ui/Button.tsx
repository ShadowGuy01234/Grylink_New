import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/25 hover:-translate-y-0.5 hover:shadow-primary-500/40 active:translate-y-0",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        outline:
          "border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-700",
        secondary:
          "bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/25 hover:-translate-y-0.5 active:translate-y-0",
        ghost: "hover:bg-gray-100 text-gray-700",
        link: "text-primary-600 underline-offset-4 hover:underline",
        white: "bg-white text-primary-700 hover:bg-gray-50 shadow-lg hover:-translate-y-0.5",
        "outline-white":
          "border border-white/40 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
        primary:
          "bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/25 hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        md: "h-10 px-6 py-3 text-base",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
