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
  description: 'SuccessBuds is India\'s leading online educational platform for CBSE and ICSE students. Take interactive multiple choice tests, practice exams, and track academic progress. Perfect for Indian students, parents, and teachers.',
  keywords: [
    'CBSE tests',
    'ICSE tests', 
    'Indian students online tests',
    'CBSE online tests',
    'ICSE online tests',
    'CBSE practice tests',
    'ICSE practice tests',
    'CBSE exam preparation',
    'ICSE exam preparation',
    'Indian educational platform',
    'CBSE syllabus tests',
    'ICSE syllabus tests',
    'CBSE curriculum tests',
    'ICSE curriculum tests',
    'online education India',
    'CBSE students',
    'ICSE students',
    'Indian students',
    'CBSE board exams',
    'ICSE board exams',
    'CBSE sample papers',
    'ICSE sample papers',
    'CBSE mock tests',
    'ICSE mock tests',
    'educational testing platform',
    'student assessment India',
    'CBSE grade tests',
    'ICSE grade tests',
    'online learning India',
    'educational technology India',
    'CBSE class tests',
    'ICSE class tests',
    'Indian education system',
    'CBSE study materials',
    'ICSE study materials'
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
    locale: 'en_IN',
    url: 'https://successbuds.com',
    title: 'SuccessBuds - CBSE & ICSE Online Tests for Indian Students',
    description: 'India\'s leading platform for CBSE and ICSE online tests. Practice tests, mock exams, and study materials for Indian students from Class 4-10.',
    siteName: 'SuccessBuds',
    images: [
      {
        url: '/images/logo-wide.jpg',
        width: 1200,
        height: 630,
        alt: 'SuccessBuds - CBSE ICSE Online Tests for Indian Students',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuccessBuds - CBSE & ICSE Online Tests for Indian Students',
    description: 'India\'s leading platform for CBSE and ICSE online tests. Practice tests, mock exams, and study materials for Indian students.',
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
    google: 'qQPmQK_RFBgrOigVcobsclOwzakO0hxf93t8GcGqZJQ',
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
              "description": "India's leading online educational platform for CBSE and ICSE students offering interactive multiple choice tests, practice exams, and study materials",
              "url": "https://successbuds.com",
              "logo": "https://successbuds.com/images/logo-wide.jpg",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN",
                "addressRegion": "India"
              },
              "sameAs": [
                "https://twitter.com/successbuds",
                "https://facebook.com/successbuds"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "email": "support@successbuds.com",
                "areaServed": "IN",
                "availableLanguage": ["English", "Hindi"]
              },
              "offers": {
                "@type": "Offer",
                "name": "CBSE & ICSE Online Tests",
                "description": "Interactive multiple choice tests for CBSE and ICSE students from Class 4-10",
                "category": "Educational Technology",
                "areaServed": "IN"
              },
              "audience": {
                "@type": "Audience",
                "audienceType": "Indian Students, CBSE Students, ICSE Students, Parents, Teachers"
              },
              "educationalLevel": "Primary Education, Secondary Education",
              "teaches": "CBSE Curriculum, ICSE Curriculum, Mathematics, Science, English, Social Studies"
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
