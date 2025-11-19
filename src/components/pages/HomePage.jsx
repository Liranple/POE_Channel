export default function HomePage() {
  return (
    <div className="page-content">
      <h1>Path of Exile 도구 모음</h1>
      <p>
        여러 Path of Exile 관련 도구들을 한 곳에서 사용할 수 있습니다.
        <br />
        왼쪽 사이드바에서 원하는 도구를 선택하세요.
      </p>

      <div className="card" style={{ marginTop: "24px" }}>
        <h2
          style={{
            fontSize: "20px",
            marginBottom: "12px",
            color: "var(--accent)",
          }}
        >
          사용 가능한 도구
        </h2>
        <ul style={{ lineHeight: "2", color: "var(--muted)" }}>
          <li>
            ⚗️ <strong>플라스크 태그 빌더</strong> - 플라스크 옵션 검색 및 관리
          </li>
          <li>
            🃏 <strong>카드 드랍처</strong> - 점술 카드 드랍 위치 정보
          </li>
          <li>
            💎 <strong>주얼</strong> - 주얼 정보 및 검색
          </li>
          <li>
            🗺️ <strong>지도</strong> - 지도 정보 및 전략
          </li>
          <li>
            ⚔️ <strong>군단 주얼</strong> - 군단 주얼 정보
          </li>
        </ul>
      </div>
    </div>
  );
}
