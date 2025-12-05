"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  Suspense,
  lazy,
} from "react";
import dynamic from "next/dynamic";
import {
  FaHome,
  FaFlask,
  FaMap,
  FaMapMarkerAlt,
  FaRegCommentDots,
  FaGem,
} from "react-icons/fa";
import ErrorBoundary from "./ErrorBoundary";

import { PiDiamondsFourFill } from "react-icons/pi";
import Sidebar from "../components/Sidebar";
import {
  loadTheme,
  saveTheme,
  OPTION_STORAGE_KEYS,
} from "../utils/optionStorage";

// 기존 로딩 스피너 컴포넌트
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
const HomePage = dynamic(() => import("../components/pages/HomePage"), {
  loading: () => <PageLoader />,
});
const FlaskPage = dynamic(() => import("../components/pages/FlaskPage"), {
  loading: () => <PageLoader />,
});
const CardsPage = dynamic(() => import("../components/pages/CardsPage"), {
  loading: () => <PageLoader />,
});
const JewelsPage = dynamic(() => import("../components/pages/JewelsPage"), {
  loading: () => <PageLoader />,
});
const MapsPage = dynamic(() => import("../components/pages/MapsPage"), {
  loading: () => <PageLoader />,
});
const DiscussionPage = dynamic(
  () => import("../components/pages/DiscussionPage"),
  {
    loading: () => <PageLoader />,
  }
);
const GemsPage = dynamic(() => import("../components/pages/GemsPage"), {
  loading: () => <PageLoader />,
});

// 탭 설정 - 여기서 탭을 쉽게 추가/제거/수정할 수 있습니다
const TABS = [
  { id: "home", label: "메인 페이지", icon: <FaHome size={20} /> },
  { id: "maps", label: "지도", icon: <FaMap size={20} /> },
  { id: "flask", label: "플라스크", icon: <FaFlask size={20} /> },
  { id: "jewels", label: "주얼", icon: <PiDiamondsFourFill size={20} /> },
  { id: "cards", label: "카드 드랍처", icon: <FaMapMarkerAlt size={20} /> },
  { id: "gems", label: "보조 젬 시세", icon: <FaGem size={20} /> },
  {
    id: "discussion",
    label: "자유 토론장",
    icon: <FaRegCommentDots size={20} />,
  },
];

// 서버/클라이언트 초기 테마 동기화를 위한 함수
const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("poe-channel-theme");
    return saved || "dark";
  }
  return "dark";
};

export default function AppLayout() {
  // 초기값은 home, 클라이언트에서 sessionStorage 확인 후 업데이트
  const [activeTab, setActiveTab] = useState("home");
  const [isHydrated, setIsHydrated] = useState(false);
  const [theme, setTheme] = useState("dark");

  // 클라이언트에서만 sessionStorage에서 탭 복원 (새로고침 시 유지, 탭 닫으면 초기화)
  useEffect(() => {
    // 테마 먼저 적용 (깜빡임 방지)
    const savedTheme = loadTheme();
    if (savedTheme === "light") {
      document.documentElement.classList.add("theme-light");
    }
    setTheme(savedTheme);

    const savedTab = sessionStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }

    setIsHydrated(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      saveTheme(newTheme); // 테마 저장
      return newTheme;
    });
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("theme-light");
    } else {
      document.documentElement.classList.remove("theme-light");
    }
  }, [theme]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    // sessionStorage에 현재 탭 저장 (새로고침 시 유지, 탭 닫으면 초기화)
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
      default:
        pageComponent = (
          <div className="page-content">
            <h1>페이지를 찾을 수 없습니다</h1>
          </div>
        );
    }
    // ErrorBoundary로 각 페이지 감싸기 (한 페이지 에러가 전체 앱에 영향 안 줌)
    // key를 activeTab으로 설정하여 탭 변경 시 에러 상태 초기화
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
            © 2025 POE Channel. All rights reserved.
          </p>
          <p style={{ margin: 0, opacity: 0.7 }}>
            This product isn&apos;t affiliated with or endorsed by Grinding Gear
            Games in any way.
          </p>
        </footer>
      </main>
    </div>
  );
}
