import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        open ? "block" : "hidden"
      )}
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-50 bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  )
}

interface AlertDialogTriggerProps {
  onClick?: () => void
  children: React.ReactNode
}

const AlertDialogTrigger = ({ onClick, children }: AlertDialogTriggerProps) => {
  return <div onClick={onClick}>{children}</div>
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

const AlertDialogContent = ({ children, className }: AlertDialogContentProps) => {
  return <div className={cn("space-y-4", className)}>{children}</div>
}

interface AlertDialogHeaderProps {
  className?: string
  children: React.ReactNode
}

const AlertDialogHeader = ({ className, children }: AlertDialogHeaderProps) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
    {children}
  </div>
)

interface AlertDialogFooterProps {
  className?: string
  children: React.ReactNode
}

const AlertDialogFooter = ({ className, children }: AlertDialogFooterProps) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
    {children}
  </div>
)

interface AlertDialogTitleProps {
  className?: string
  children: React.ReactNode
}

const AlertDialogTitle = ({ className, children }: AlertDialogTitleProps) => (
  <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
)

interface AlertDialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

const AlertDialogDescription = ({ className, children }: AlertDialogDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
)

interface AlertDialogActionProps {
  onClick?: () => void
  className?: string
  children: React.ReactNode
}

const AlertDialogAction = ({ onClick, className, children }: AlertDialogActionProps) => (
  <Button onClick={onClick} className={className}>
    {children}
  </Button>
)

interface AlertDialogCancelProps {
  onClick?: () => void
  className?: string
  children: React.ReactNode
}

const AlertDialogCancel = ({ onClick, className, children }: AlertDialogCancelProps) => (
  <Button variant="outline" onClick={onClick} className={className}>
    {children}
  </Button>
)

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
