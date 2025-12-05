"use client";

import { Component } from "react";

/**
 * 에러 바운더리 컴포넌트
 * - 자식 컴포넌트에서 발생한 렌더링 에러를 잡아서 폴백 UI 표시
 * - 다른 페이지/컴포넌트에 영향 없이 해당 영역만 에러 처리
 *
 * 주의: 이벤트 핸들러, 비동기 코드의 에러는 잡지 못함 (React 한계)
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // 에러 발생 시 폴백 UI 표시를 위한 상태 업데이트
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅 (필요시 외부 서비스로 전송 가능)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            padding: "40px 20px",
            textAlign: "center",
            color: "var(--text)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
            }}
          >
            😥
          </div>
          <h2
            style={{
              margin: "0 0 8px 0",
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--text)",
            }}
          >
            오류가 발생했습니다
          </h2>
          <p
            style={{
              margin: "0 0 20px 0",
              fontSize: "14px",
              color: "var(--muted)",
            }}
          >
            페이지를 불러오는 중 문제가 발생했습니다.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--bg)",
              backgroundColor: "var(--accent)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
