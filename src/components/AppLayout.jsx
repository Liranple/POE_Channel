"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import {
  FaFlask,
  FaMap,
  FaMapMarkerAlt,
  FaRegCommentDots,
  FaGem,
} from "react-icons/fa";
import { RiGlobalFill } from "react-icons/ri";
import { PiDiamondsFourFill } from "react-icons/pi";
import ErrorBoundary from "./ErrorBoundary";
import Sidebar from "./Sidebar";
import { loadTheme, saveTheme } from "../utils/optionStorage";
import { APP_VERSION } from "../config/league";

// 로딩 스피너 컴포넌트
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
      color: "var(--muted)",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid var(--sidebar-border)",
          borderTop: "3px solid var(--accent)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 12px",
        }}
      />
      로딩 중...
    </div>
  </div>
);

// 동적 임포트로 코드 스플리팅 (초기 로딩 속도 향상)
const HomePage = dynamic(() => import("./pages/HomePage"), {
  loading: () => <PageLoader />,
});
const FlaskPage = dynamic(() => import("./pages/FlaskPage"), {
  loading: () => <PageLoader />,
});
const CardsPage = dynamic(() => import("./pages/CardsPage"), {
  loading: () => <PageLoader />,
});
const JewelsPage = dynamic(() => import("./pages/JewelsPage"), {
  loading: () => <PageLoader />,
});
const MapsPage = dynamic(() => import("./pages/MapsPage"), {
  loading: () => <PageLoader />,
});
const DiscussionPage = dynamic(() => import("./pages/DiscussionPage"), {
  loading: () => <PageLoader />,
});
const GemsPage = dynamic(() => import("./pages/GemsPage"), {
  loading: () => <PageLoader />,
});
const SitesPage = dynamic(() => import("./pages/SitesPage"), {
  loading: () => <PageLoader />,
});

// 탭 설정
const TABS = [
  { id: "maps", label: "지도", icon: <FaMap size={20} /> },
  { id: "flask", label: "플라스크", icon: <FaFlask size={20} /> },
  { id: "jewels", label: "주얼", icon: <PiDiamondsFourFill size={20} /> },
  { id: "cards", label: "카드 드랍처", icon: <FaMapMarkerAlt size={20} /> },
  { id: "gems", label: "보조 젬 시세", icon: <FaGem size={20} /> },
  { id: "sites", label: "주요 사이트", icon: <RiGlobalFill size={20} /> },
  {
    id: "discussion",
    label: "자유 토론장",
    icon: <FaRegCommentDots size={20} />,
  },
];

// hydration 상태 관리를 위한 useSyncExternalStore 설정
const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function AppLayout() {
  // 클라이언트에서 sessionStorage에서 탭 복원 (지연 초기화)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("activeTab") || "home";
    }
    return "home";
  });

  // hydration 상태 관리 (SSR/CSR 안전)
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  // localStorage에서 테마 로드 (지연 초기화)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return loadTheme();
    }
    return "dark";
  });

  // 테마 클래스 적용
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("theme-light");
    } else {
      document.documentElement.classList.remove("theme-light");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      saveTheme(newTheme);
      return newTheme;
    });
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem("activeTab", tabId);
  }, []);

  const content = useMemo(() => {
    let pageComponent;
    switch (activeTab) {
      case "home":
        pageComponent = <HomePage />;
        break;
      case "flask":
        pageComponent = <FlaskPage />;
        break;
      case "cards":
        pageComponent = <CardsPage />;
        break;
      case "jewels":
        pageComponent = <JewelsPage />;
        break;
      case "maps":
        pageComponent = <MapsPage />;
        break;
      case "discussion":
        pageComponent = <DiscussionPage />;
        break;
      case "gems":
        pageComponent = <GemsPage />;
        break;
      case "sites":
        pageComponent = <SitesPage />;
        break;
      default:
        pageComponent = (
          <div className="page-content">
            <h1>페이지를 찾을 수 없습니다</h1>
          </div>
        );
    }
    return <ErrorBoundary key={activeTab}>{pageComponent}</ErrorBoundary>;
  }, [activeTab]);

  // hydration 완료 전에는 빈 화면 (깜빡임 방지)
  if (!isHydrated) {
    return (
      <div className="app-layout" style={{ visibility: "hidden" }}>
        <div style={{ width: 240 }} />
        <main className="main-content" />
      </div>
    );
  }

  return (
    <div className={`app-layout ${theme === "light" ? "theme-light" : ""}`}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={TABS}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main
        className="main-content"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ paddingBottom: "20px" }}>{content}</div>
        <footer
          style={{
            padding: "20px",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: "12px",
            borderTop: "1px solid var(--sidebar-border)",
            background: "transparent",
          }}
        >
          <p style={{ margin: "0 0 4px 0", fontWeight: 600 }}>
            © 2026 POE Channel. All rights reserved.
          </p>
          <p style={{ margin: 0, opacity: 0.7 }}>
            This product isn&apos;t affiliated with or endorsed by Grinding Gear
            Games in any way.
          </p>
          <p style={{ margin: "4px 0 0 0", opacity: 0.5, fontSize: "12px" }}>
            Release {APP_VERSION} · Stable
          </p>
        </footer>
      </main>
    </div>
  );
}
