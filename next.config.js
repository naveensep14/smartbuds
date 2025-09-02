/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['localhost', 'vercel.app', 'vercel.com'],
  },
}

module.exports = nextConfig 