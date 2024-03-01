/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["img.icons8.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.icons8.com",
        pathname: "*",
      },
    ],
  },
};

export default nextConfig;
