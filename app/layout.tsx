import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'SuccessBuds - Online Educational Testing Platform for Kids',
    template: '%s | SuccessBuds'
  },
  description: 'SuccessBuds is the leading online educational platform for kids. Take interactive multiple choice tests, track progress, and improve learning outcomes. Perfect for parents, teachers, and students.',
  keywords: [
    'online education',
    'educational testing',
    'kids learning platform',
    'multiple choice tests',
    'student assessment',
    'educational games',
    'learning management',
    'parent dashboard',
    'teacher tools',
    'academic progress',
    'study materials',
    'test preparation',
    'educational technology',
    'e-learning',
    'student performance'
  ],
  authors: [{ name: 'SuccessBuds Team' }],
  creator: 'SuccessBuds',
  publisher: 'SuccessBuds',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://successbuds.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://successbuds.com',
    title: 'SuccessBuds - Online Educational Testing Platform for Kids',
    description: 'SuccessBuds is the leading online educational platform for kids. Take interactive multiple choice tests, track progress, and improve learning outcomes.',
    siteName: 'SuccessBuds',
    images: [
      {
        url: '/images/logo-wide.jpg',
        width: 1200,
        height: 630,
        alt: 'SuccessBuds Educational Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuccessBuds - Online Educational Testing Platform for Kids',
    description: 'SuccessBuds is the leading online educational platform for kids. Take interactive multiple choice tests, track progress, and improve learning outcomes.',
    images: ['/images/logo-wide.jpg'],
    creator: '@successbuds',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "SuccessBuds",
              "description": "Online educational platform for kids offering interactive multiple choice tests and learning management tools",
              "url": "https://successbuds.com",
              "logo": "https://successbuds.com/images/logo-wide.jpg",
              "sameAs": [
                "https://twitter.com/successbuds",
                "https://facebook.com/successbuds"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "support@successbuds.com"
              },
              "offers": {
                "@type": "Offer",
                "name": "Educational Testing Platform",
                "description": "Interactive multiple choice tests for students",
                "category": "Educational Technology"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "Students, Parents, Teachers"
              }
            })
          }}
        />
      </head>
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