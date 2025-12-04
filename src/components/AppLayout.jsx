"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  FaHome,
  FaFlask,
  FaMap,
  FaMapMarkerAlt,
  FaRegCommentDots,
  FaGem,
} from "react-icons/fa";

import { PiDiamondsFourFill } from "react-icons/pi";
import Sidebar from "../components/Sidebar";
import HomePage from "../components/pages/HomePage";
import FlaskPage from "../components/pages/FlaskPage";
import CardsPage from "../components/pages/CardsPage";
import JewelsPage from "../components/pages/JewelsPage";
import MapsPage from "../components/pages/MapsPage";
import DiscussionPage from "../components/pages/DiscussionPage";
import GemsPage from "../components/pages/GemsPage";
import {
  loadTheme,
  saveTheme,
  OPTION_STORAGE_KEYS,
} from "../utils/optionStorage";

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

export default function AppLayout() {
  // 초기값은 home, 클라이언트에서 sessionStorage 확인 후 업데이트
  const [activeTab, setActiveTab] = useState("home");
  const [isHydrated, setIsHydrated] = useState(false);
  const [theme, setTheme] = useState("dark");

  // 클라이언트에서만 sessionStorage에서 탭 복원 (새로고침 시 유지, 탭 닫으면 초기화)
  useEffect(() => {
    const savedTab = sessionStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }

    // 테마 복원 (localStorage - 영구 저장)
    const savedTheme = loadTheme();
    setTheme(savedTheme);

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
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "flask":
        return <FlaskPage />;
      case "cards":
        return <CardsPage />;
      case "jewels":
        return <JewelsPage />;
      case "maps":
        return <MapsPage />;
      case "discussion":
        return <DiscussionPage />;
      case "gems":
        return <GemsPage />;
      default:
        return (
          <div className="page-content">
            <h1>페이지를 찾을 수 없습니다</h1>
          </div>
        );
    }
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
