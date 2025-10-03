import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SuccessBuds - Educational Platform',
  description: 'An interactive educational platform for kids to take multiple choice tests',
  keywords: ['education', 'testing', 'kids', 'learning', 'multiple choice'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 