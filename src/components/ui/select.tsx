import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Select = ({ value, onValueChange, children, className }: SelectProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </select>
  )
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 opacity-50 -translate-y-1/2" />
    </div>
  )
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

const SelectContent = ({ children, className }: SelectContentProps) => {
  return (
    <div
      className={cn(
        "relative z-50 max-h-60 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
    >
      {children}
    </div>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

const SelectItem = ({ value, children, className }: SelectItemProps) => {
  return (
    <option value={value} className={cn("py-2 pl-8 pr-2 text-sm", className)}>
      {children}
    </option>
  )
}

interface SelectLabelProps {
  children: React.ReactNode
  className?: string
}

const SelectLabel = ({ children, className }: SelectLabelProps) => {
  return (
    <label className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}>
      {children}
    </label>
  )
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
}
