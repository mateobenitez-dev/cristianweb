import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Los PDFs de rutinas viven en /private (fuera de /public) para que no sean descargables por URL.
  outputFileTracingIncludes: {
    "/api/webhooks/mercadopago": ["./private/rutinas/**/*"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
