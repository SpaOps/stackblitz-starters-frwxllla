/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // The old standalone pricing page was retired; pricing lives on the homepage.
      { source: "/pricing.html", destination: "/#portal", permanent: true },
      { source: "/pricing", destination: "/#portal", permanent: true },
    ];
  },
}

module.exports = nextConfig
