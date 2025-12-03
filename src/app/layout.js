import "../styles/variables.css";
import "./globals.css";
import "../styles/FlaskPage.css";
import "../styles/JewelsPage.css";

export const metadata = {
  title: "POE Channel — Path of Exile 도구 모음",
  description: "Path of Exile 플라스크, 카드, 주얼, 지도 등 다양한 도구 모음",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
