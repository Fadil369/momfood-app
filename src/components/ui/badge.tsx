import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        accent:
          "border-transparent bg-gold-100 text-gold-700 dark:bg-gold-700/20 dark:text-gold-300",
        olive:
          "border-transparent bg-olive-100 text-olive-700 dark:bg-olive-700/20 dark:text-olive-300",
        outline:
          "border-border text-foreground bg-background/60 backdrop-blur",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-300",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        glow:
          "border-gold-300/50 bg-gold-50 text-gold-700 shadow-[0_0_20px_-4px_hsl(var(--gold-400)/0.5)] dark:bg-gold-700/10 dark:text-gold-300",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
