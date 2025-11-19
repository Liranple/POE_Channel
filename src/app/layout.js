import "./globals.css";

export const metadata = {
  title: "POE Channel — Path of Exile 도구 모음",
  description: "Path of Exile 플라스크, 카드, 주얼, 지도 등 다양한 도구 모음",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
