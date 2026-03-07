import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with theme toggle */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif font-bold text-lg md:text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
              R
            </div>
            <span className="hidden sm:inline text-foreground">IIT Ropar</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content - centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  )
}
