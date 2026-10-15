/** Static React output: no Node.js server is needed on Cloudflare. */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
