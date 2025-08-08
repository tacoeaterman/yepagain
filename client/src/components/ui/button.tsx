import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium font-logo ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cartoon-button text-white font-semibold",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-logo-dark",
        outline:
          "border-3 border-logo-dark bg-white hover:bg-logo-green/20 hover:text-logo-dark font-semibold cartoon-shadow",
        secondary:
          "bg-brand-secondary text-white hover:bg-brand-secondary/80 border-2 border-logo-dark font-semibold",
        ghost: "hover:bg-white/20 hover:text-logo-dark font-medium",
        link: "text-brand-primary underline-offset-4 hover:underline font-medium",
        cartoon: "bg-brand-accent text-logo-dark hover:bg-brand-accent/90 border-3 border-logo-dark cartoon-shadow font-bold",
        gradient: "bg-text-gradient text-white border-2 border-logo-dark cartoon-shadow font-bold",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4",
        lg: "h-14 rounded-xl px-10 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
