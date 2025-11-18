import "./globals.css";

export const metadata = {
  title: "태그 빌더 — ★ 플라스크",
  description: "Path of Exile 플라스크 태그 빌더",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
