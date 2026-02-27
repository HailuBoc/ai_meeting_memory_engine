import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Meeting Memory Engine',
  description: 'Never forget important decisions from your meetings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <Navbar />
        <main className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  )
}
