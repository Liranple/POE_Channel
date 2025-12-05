import { Noto_Sans_KR, Cinzel } from "next/font/google";
import "../styles/variables.css";
import "./globals.css";
import "../styles/FlaskPage.css";
import "../styles/JewelsPage.css";

// 폰트 최적화 - 로컬 호스팅 & 프리로드
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  variable: "--font-noto-sans",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  variable: "--font-cinzel",
});

export const metadata = {
  title: "POE Channel",
  description: "Path of Exile 플라스크, 카드, 주얼, 지도 등 다양한 도구 모음",
};

export default function RootLayout({ children }) {
  // 테마 초기화 스크립트 - HTML 파싱 시점에 즉시 실행하여 깜빡임 방지
  const themeInitScript = `
    (function() {
      try {
        var theme = localStorage.getItem('poe-channel-theme');
        if (theme === 'light') {
          document.documentElement.classList.add('theme-light');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="ko" className={`${notoSansKr.variable} ${cinzel.variable}`}>
      <head>
        {/* PWA 매니페스트 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c9aa71" />
        {/* 로고 이미지 프리로드 */}
        <link rel="preload" href="/images/ui/Logo.png" as="image" />
        {/* DNS 프리페치 */}
        <link rel="dns-prefetch" href="https://poe.ninja" />
        {/* 테마 초기화 - CSS 적용 전 실행 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={notoSansKr.className}>{children}</body>
    </html>
  );
}
