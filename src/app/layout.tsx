import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">Meeting Memory</h1>
              <div className="flex space-x-4">
                <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
                <a href="/search" className="text-gray-600 hover:text-gray-900">Search</a>
                <a href="/meetings/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">New Meeting</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
