"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import HomePage from "../components/pages/HomePage";
import TagBuilder from "../components/TagBuilder";
import CardsPage from "../components/pages/CardsPage";
import JewelsPage from "../components/pages/JewelsPage";
import MapsPage from "../components/pages/MapsPage";
import LegionPage from "../components/pages/LegionPage";

// 탭 설정 - 여기서 탭을 쉽게 추가/제거/수정할 수 있습니다
const TABS = [
  { id: "home", label: "메인 페이지", icon: "🏠" },
  { id: "flask", label: "플라스크 태그", icon: "⚗️" },
  { id: "cards", label: "카드 드랍처", icon: "🃏" },
  { id: "jewels", label: "주얼", icon: "💎" },
  { id: "maps", label: "지도", icon: "🗺️" },
  { id: "legion", label: "군단 주얼", icon: "⚔️" },
];

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState("flask");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "flask":
        return <TagBuilder />;
      case "cards":
        return <CardsPage />;
      case "jewels":
        return <JewelsPage />;
      case "maps":
        return <MapsPage />;
      case "legion":
        return <LegionPage />;
      default:
        return (
          <div className="page-content">
            <h1>페이지를 찾을 수 없습니다</h1>
          </div>
        );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} tabs={TABS} />
      <main className="main-content">{renderContent()}</main>
    </div>
  );
}
