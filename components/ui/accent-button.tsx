import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import { VariantProps } from "class-variance-authority"

interface AccentButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof Button> {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

const AccentButton = forwardRef<HTMLButtonElement, AccentButtonProps>(
  ({ className, children, size, variant, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        variant="outline"
        className={cn(
          "border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-red-500/25 bg-transparent",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
AccentButton.displayName = "AccentButton"

export { AccentButton }