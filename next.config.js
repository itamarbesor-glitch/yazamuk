/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for axios and Node.js modules in client components
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http2: false,
        http: false,
        https: false,
        zlib: false,
        stream: false,
        url: false,
        util: false,
        buffer: false,
        crypto: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
