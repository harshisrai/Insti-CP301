import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
      {Icon && (
        <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground/30 mb-4" />
      )}
      <h3 className="font-serif font-bold text-xl sm:text-2xl text-foreground mb-2 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md text-center">
          {description}
        </p>
      )}
      {action && <div className="flex gap-3 justify-center">{action}</div>}
      {children}
    </div>
  )
}
