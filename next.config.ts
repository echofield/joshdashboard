/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Ignore the Tailwind CSS base export error
    config.externals = config.externals || [];
    config.externals.push({
      'tailwindcss/base': 'tailwindcss/base',
    });
    return config;
  },
}

module.exports = nextConfig
