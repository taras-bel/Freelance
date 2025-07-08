import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-inter font-medium ring-offset-white transition-colors transition shadow-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-matte-dark dark:focus-visible:ring-neon-violet button",
  {
    variants: {
      variant: {
        default: "bg-neon-teal text-matte hover:bg-neon-cyan neon",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 dark:bg-red-900 dark:text-white dark:hover:bg-red-800",
        outline:
          "border border-neon-teal bg-glass text-neon-teal hover:bg-neon-cyan/10 hover:text-neon-cyan glass",
        secondary:
          "bg-matte-light text-neon-teal hover:bg-matte dark:bg-matte-dark dark:text-neon-violet dark:hover:bg-matte-light glass",
        ghost: "bg-transparent text-neon-teal hover:bg-glass hover:text-neon-violet glass",
        link: "text-neon-violet underline-offset-4 hover:underline dark:text-neon-teal",
        glass: "glass text-neon-teal hover:bg-glass/80",
        neon: "bg-neon-violet text-white neon hover:bg-neon-cyan hover:text-matte",
      },
      size: {
        default: "h-11 px-6 py-2 text-base",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
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
