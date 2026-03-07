import React from 'react';
import { cn } from '@/lib/utils';

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function GlassSurface({ children, className, ...props }: GlassSurfaceProps) {
    return (
        <div
            className={cn(
                "rounded-xl p-5",
                "bg-white/90 dark:bg-white/[0.04]",
                "backdrop-blur-md",
                "border border-black/5 dark:border-white/5",
                "shadow-sm hover:shadow-md transition-all duration-200",
                "motion-safe:hover:scale-[1.005]",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
