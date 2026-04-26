/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Set NEXT_STATIC_EXPORT=1 to emit a fully static site to ./out/ for
  // hosting on any bucket/CDN (Cloudflare Pages, S3, GitHub Pages, etc.).
  // Default (unset) keeps Next.js serverless mode for Vercel.
  ...(process.env.NEXT_STATIC_EXPORT === "1"
    ? { output: "export", trailingSlash: true, images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
