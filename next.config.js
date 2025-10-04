/** @type {import('next').NextConfig} */
const nextConfig = {
  // No image configuration needed for external CDN URLs
  // Exclude Supabase Edge Functions from Next.js build
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ts$/,
      include: /supabase\/functions/,
      use: 'ignore-loader',
    });
    return config;
  },
}

module.exports = nextConfig 