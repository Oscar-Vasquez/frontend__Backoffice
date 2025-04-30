/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  swcMinify: false, // Temporarily disable minification for debugging
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig 