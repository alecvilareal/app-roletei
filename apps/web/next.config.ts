import type { NextConfig } from "next";
import { resolve } from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  // No Next.js 16, a chave saiu de dentro de 'experimental' 
  // e deve ser um caminho absoluto
  outputFileTracingRoot: resolve(process.cwd(), "../../"),
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;