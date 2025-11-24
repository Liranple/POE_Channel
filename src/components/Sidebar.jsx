"use client";

import { memo } from "react";

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
        <h1 className="sidebar-title">POE Channel</h1>
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
          {theme === "dark" ? "☀️ 라이트 모드" : "🌙 다크 모드"}
        </button>
      </div>
    </aside>
  );
});

export default Sidebar;
