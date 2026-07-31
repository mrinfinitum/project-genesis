/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  experimental: {
    // Let Next restore document positions for browser back/forward navigation.
    scrollRestoration: true
  }
};

export default nextConfig;
