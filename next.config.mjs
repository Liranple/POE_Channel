/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일 캐시
  },

  // 프로덕션 빌드 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 실험적 기능
  experimental: {
    optimizeCss: true, // CSS 최적화
  },

  // 정적 자산 압축
  compress: true,

  // 캐시 헤더 설정
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.woff2",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
