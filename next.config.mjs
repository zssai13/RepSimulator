/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle native modules (LanceDB)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize native modules for server-side
      config.externals = config.externals || [];
      config.externals.push({
        '@lancedb/lancedb': 'commonjs @lancedb/lancedb',
      });
    }
    return config;
  },
  // Suppress experimental warnings
  experimental: {
    serverComponentsExternalPackages: ['@lancedb/lancedb'],
  },
};

export default nextConfig;
