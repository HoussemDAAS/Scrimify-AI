import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { VariantProps } from "class-variance-authority"

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof Button> {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, children, size, variant, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          "bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-red-500 hover:border-red-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
PrimaryButton.displayName = "PrimaryButton"

export { PrimaryButton }