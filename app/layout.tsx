import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'SuccessBuds - Online Educational Tests for Kids',
    template: '%s | SuccessBuds'
  },
  description: 'SuccessBuds is the leading online educational platform for kids. Take interactive multiple choice tests for CBSE and ICSE curriculum, track progress, and improve learning outcomes. Perfect for parents, teachers, and students.',
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
    'student performance',
    'CBSE',
    'ICSE',
    'CBSE tests',
    'ICSE tests',
    'CBSE online tests',
    'ICSE online tests',
    'CBSE practice tests',
    'ICSE practice tests',
    'CBSE exam preparation',
    'ICSE exam preparation',
    'CBSE syllabus',
    'ICSE syllabus',
    'CBSE curriculum',
    'ICSE curriculum'
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
    title: 'SuccessBuds - Online Educational Tests for Kids',
    description: 'SuccessBuds is the leading online educational platform for kids. Take interactive multiple choice tests for CBSE and ICSE curriculum, track progress, and improve learning outcomes.',
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
    title: 'SuccessBuds - Online Educational Tests for Kids',
    description: 'SuccessBuds is the leading online educational platform for kids. Take interactive multiple choice tests for CBSE and ICSE curriculum, track progress, and improve learning outcomes.',
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
  icons: [
    { rel: 'icon', url: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', url: '/images/logo-square.jpg', sizes: '32x32', type: 'image/jpeg' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png', sizes: '180x180' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
          <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-cream">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
