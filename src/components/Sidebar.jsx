"use client";

import { memo, useCallback } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

// 정적 스타일 객체 - 컴포넌트 외부에 선언하여 재생성 방지
const footerStyle = {
  padding: "16px",
  borderTop: "1px solid var(--sidebar-border)",
  marginTop: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const themeButtonStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid var(--sidebar-border)",
  background: "var(--input-bg)",
  color: "var(--text)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontWeight: 600,
  transition: "0.2s",
};

// 로고 클릭 가능하도록 스타일 추가
const logoContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
};

const Sidebar = memo(function Sidebar({
  activeTab,
  onTabChange,
  tabs,
  theme,
  toggleTheme,
}) {
  const handleMouseOver = useCallback((e) => {
    e.currentTarget.style.opacity = "0.8";
  }, []);

  const handleMouseOut = useCallback((e) => {
    e.currentTarget.style.opacity = "1";
  }, []);

  // 로고 클릭 시 메인 페이지로 이동
  const handleLogoClick = useCallback(() => {
    onTabChange("home");
  }, [onTabChange]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div
          style={logoContainerStyle}
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleLogoClick()}
        >
          <img
            src="/images/ui/Logo.png"
            alt="Logo"
            className="sidebar-logo"
            loading="eager"
            fetchPriority="high"
          />
          <h1 className="sidebar-title">POE Channel</h1>
        </div>
      </div>
      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="sidebar-tab-icon">{tab.icon}</span>
            <span className="sidebar-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div style={footerStyle}>
        <button
          onClick={toggleTheme}
          style={themeButtonStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          {theme === "dark" ? (
            <>
              <FaSun size={16} color="#FFD700" /> 라이트 모드
            </>
          ) : (
            <>
              <FaMoon size={16} color="#4B0082" /> 다크 모드
            </>
          )}
        </button>
      </div>
    </aside>
  );
});

export default Sidebar;
