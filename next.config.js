/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration for external URLs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Exclude Supabase Edge Functions from Next.js build
  webpack: (config) => {
    // Exclude Supabase functions directory from Next.js build
    config.module.rules.push({
      test: /supabase-functions\/.*\.ts$/,
      use: 'ignore-loader',
    });
    
    // Exclude any files with Deno imports
    config.module.rules.push({
      test: /.*\.ts$/,
      include: /supabase-functions/,
      use: 'ignore-loader',
    });
    
    // Also exclude Deno imports
    config.externals = config.externals || [];
    config.externals.push({
      'https://deno.land/std@0.190.0/http/server.ts': 'commonjs https://deno.land/std@0.190.0/http/server.ts',
    });
    
    return config;
  },
}

module.exports = nextConfig 