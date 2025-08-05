import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { VariantProps } from "class-variance-authority"

interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof Button> {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ className, children, size, variant, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        variant="outline"
        className={cn(
          "border-2 border-white text-white hover:bg-white hover:text-black font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-white/25 bg-transparent",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
SecondaryButton.displayName = "SecondaryButton"

export { SecondaryButton }