import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TFT Team Planner',
  description: 'Build your perfect Teamfight Tactics compositions for Set 15',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TFT</span>
                  </div>
                  <h1 className="text-xl font-bold">Team Planner</h1>
                </div>
                <nav className="flex items-center gap-6">
                  <a href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Traits
                  </a>
                  <a href="/builder" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Team Builder
                  </a>
                </nav>
              </div>
            </header>
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
