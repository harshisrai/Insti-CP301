'use client';

import React, { useState } from 'react';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Map, Box, Expand, Shrink } from 'lucide-react';
import { cn } from '@/lib/utils';

type MapView = '2d' | '3d';

export default function CampusMapPage() {
    const [view, setView] = useState<MapView>('2d');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const mapSrc = view === '2d' ? '/maps/2d/index.html' : '/maps/3d/index.html';

    const toggleFullscreen = () => setIsFullscreen(prev => !prev);

    return (
        <div className={cn(
            'space-y-4 animate-fade-in',
            isFullscreen && 'fixed inset-0 z-50 bg-background p-4 space-y-3'
        )}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif">Campus Map</h1>
                    <p className="text-muted-foreground mt-1">
                        Explore the IIT Ropar campus in 2D or 3D.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* 2D / 3D Toggle */}
                    <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                        <button
                            onClick={() => setView('2d')}
                            className={cn(
                                'flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all',
                                view === '2d'
                                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                            )}
                        >
                            <Map className="w-4 h-4" /> 2D Map
                        </button>
                        <button
                            onClick={() => setView('3d')}
                            className={cn(
                                'flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-all',
                                view === '3d'
                                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100'
                                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                            )}
                        >
                            <Box className="w-4 h-4" /> 3D Map
                        </button>
                    </div>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? <Shrink className="w-5 h-5" /> : <Expand className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Map Iframe */}
            <GlassSurface className={cn(
                'overflow-hidden',
                isFullscreen ? 'flex-1 h-[calc(100vh-120px)]' : 'h-[calc(100vh-220px)] min-h-[500px]'
            )}>
                <iframe
                    key={view}
                    src={mapSrc}
                    title={`${view.toUpperCase()} Campus Map`}
                    className="w-full h-full border-0"
                    allow="fullscreen"
                />
            </GlassSurface>
        </div>
    );
}
