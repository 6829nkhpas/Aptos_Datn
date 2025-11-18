/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
  domains: ['images.unsplash.com', 'plus.unsplash.com'],
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  // Disable strict mode to prevent double-mounting in development
  reactStrictMode: false,
};

export default nextConfig;
