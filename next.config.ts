import type { NextConfig } from "next";

// The site has no server side: it exports to plain files in out/ and is served from Cloudflare Pages.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
