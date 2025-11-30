"use client";

import { memo } from "react";
import { FaSun, FaMoon, FaRegCommentDots } from "react-icons/fa";

const Sidebar = memo(function Sidebar({
  activeTab,
  onTabChange,
  tabs,
  theme,
  toggleTheme,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1
          className="sidebar-title"
          style={{
            color: "var(--text)",
            fontSize: "22px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
            fontFamily: "'Pretendard', sans-serif", // 폰트가 없다면 기본 산세리프 적용됨
          }}
        >
          POE Channel
        </h1>
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
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid var(--sidebar-border)",
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px", // 간격 증가
        }}
      >
        <button
          onClick={toggleTheme}
          style={{
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
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
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
