import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  backHref?: string;
}

export function PageContainer({
  title,
  description,
  actions,
  children,
  className,
  backHref,
}: PageContainerProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || actions || backHref) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {backHref && (
              <Link href={backHref} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ChevronLeft size={16} className="mr-1" />
                Back
              </Link>
            )}
            {title && (
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-foreground">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
