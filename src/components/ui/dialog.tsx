import * as React from "react"

import { cn } from "@/lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
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
      <div className="relative z-50 bg-white p-6 rounded-lg shadow-lg max-w-lg w-full mx-4">
        {children}
      </div>
    </div>
  )
}

interface DialogTriggerProps {
  onClick?: () => void
  children: React.ReactNode
}

const DialogTrigger = ({ onClick, children }: DialogTriggerProps) => {
  return <div onClick={onClick}>{children}</div>
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

const DialogContent = ({ children, className }: DialogContentProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  )
}

interface DialogHeaderProps {
  className?: string
  children: React.ReactNode
}

const DialogHeader = ({ className, children }: DialogHeaderProps) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
    {children}
  </div>
)

interface DialogFooterProps {
  className?: string
  children: React.ReactNode
}

const DialogFooter = ({ className, children }: DialogFooterProps) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
    {children}
  </div>
)

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

const DialogTitle = ({ className, children }: DialogTitleProps) => (
  <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
    {children}
  </h2>
)

interface DialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

const DialogDescription = ({ className, children }: DialogDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground", className)}>
    {children}
  </p>
)

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
