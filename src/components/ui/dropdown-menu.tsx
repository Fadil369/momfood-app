import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenu = ({ children, className }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <div className={cn("relative", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && child.type === DropdownMenuTrigger
          ? React.cloneElement(child, { 
              ...child.props, 
              onToggle: () => setIsOpen(!isOpen),
              isOpen
            })
          : child
      )}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          {React.Children.map(children, (child) =>
            React.isValidElement(child) && child.type === DropdownMenuContent
              ? child
              : null
          )}
        </div>
      )}
    </div>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  onToggle?: () => void
  isOpen?: boolean
}

const DropdownMenuTrigger = ({ children, onToggle, isOpen }: DropdownMenuTriggerProps) => {
  return (
    <div 
      onClick={onToggle}
      className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {children}
      <ChevronDown className={`h-5 w-5 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </div>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
}

const DropdownMenuContent = ({ children }: DropdownMenuContentProps) => {
  return <div className="py-1">{children}</div>
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onSelect?: () => void
  className?: string
}

const DropdownMenuItem = ({ children, onSelect, className }: DropdownMenuItemProps) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuLabel = ({ children, className }: DropdownMenuLabelProps) => {
  return (
    <div className={cn("block px-4 py-2 text-sm font-medium text-gray-900", className)}>
      {children}
    </div>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

const DropdownMenuSeparator = ({ className }: DropdownMenuSeparatorProps) => {
  return <div className={cn("block h-px my-1 bg-gray-200", className)} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
