# POE Channel - Path of Exile 도구 모음

Path of Exile 관련 다양한 도구들을 한 곳에서 사용할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

- **플라스크 태그 빌더**: 플라스크 옵션 검색 및 관리
- **카드 드랍처**: 점술 카드 드랍 위치 정보 (개발 중)
- **주얼**: 주얼 정보 및 검색 (개발 중)
- **지도**: 지도 정보 및 전략 (개발 중)
- **군단 주얼**: 군단 주얼 정보 (개발 중)

## 📁 프로젝트 구조

```
POE_Channel/
├── src/
│   ├── app/
│   │   ├── layout.js           # 루트 레이아웃
│   │   ├── page.js              # 메인 페이지
│   │   └── globals.css          # 전역 스타일
│   └── components/
│       ├── AppLayout.jsx        # 앱 레이아웃 (사이드바 + 메인)
│       ├── Sidebar.jsx          # 사이드바 네비게이션
│       ├── TagBuilderStash.js   # 플라스크 데이터
│       └── pages/
│           ├── HomePage.jsx     # 홈 페이지
│           ├── FlaskPage.jsx    # 플라스크 태그 빌더
│           ├── CardsPage.jsx    # 카드 드랍처 페이지
│           ├── JewelsPage.jsx   # 주얼 페이지
│           ├── MapsPage.jsx     # 지도 페이지
│           └── LegionPage.jsx   # 군단 주얼 페이지
```

## 🛠️ 기술 스택

- **Framework**: Next.js 16.0.3 (App Router)
- **UI Library**: React 19.2.0
- **Styling**: CSS (globals.css)
- **Language**: JavaScript

## 📝 개발 가이드

### 새로운 탭 추가하기

1. `src/components/pages/` 폴더에 새 페이지 컴포넌트 생성
2. `src/components/AppLayout.jsx`에서 다음을 수정:
   - `TABS` 배열에 새 탭 정보 추가
   - `renderContent()` 함수에 case 추가

예시:

```javascript
// 1. TABS 배열에 추가
const TABS = [
  // ...기존 탭들
  { id: "new-tool", label: "새 도구", icon: "🔧" },
];

// 2. renderContent()에 case 추가
case "new-tool":
  return <NewToolPage />;
```

### 스타일 수정

- 전역 스타일: `src/app/globals.css`
- 컴포넌트별 스타일은 globals.css의 해당 섹션에서 수정

### 주요 클래스

- `.app-layout`: 전체 앱 레이아웃
- `.sidebar`: 사이드바
- `.main-content`: 메인 콘텐츠 영역
- `.page-content`: 페이지 콘텐츠 래퍼

## 🎨 디자인 시스템

### 컬러 팔레트

```css
--bg: #0b1220; /* 배경 */
--card: #071022; /* 카드 배경 */
--accent: #06b6d4; /* 강조 색상 */
--muted: #9aa9b8; /* 보조 텍스트 */
--text: #e6eef6; /* 기본 텍스트 */
```

### 애니메이션

- 탭 전환: `fadeIn` (0.3s ease-out)
- 사이드바 호버: transform + transition (0.25s cubic-bezier)
- 모달: `slideIn` (320ms cubic-bezier)

## 🚦 실행 방법

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📱 반응형 지원

- **데스크톱**: 전체 사이드바 표시
- **모바일** (768px 이하): 축소된 사이드바 (아이콘 + 작은 라벨)

## ✨ 주요 특징

### 확장 가능한 구조

- 탭을 배열로 관리하여 쉽게 추가/제거 가능
- 각 페이지가 독립적인 컴포넌트로 분리되어 유지보수 용이

### 모던한 UX

- 부드러운 전환 애니메이션
- 명확한 호버 효과
- 직관적인 사이드바 네비게이션
- 새로고침 없는 페이지 전환

### 성능 최적화

- 클라이언트 사이드 라우팅으로 빠른 페이지 전환
- CSS transition으로 부드러운 애니메이션
- 효율적인 상태 관리

## 📄 라이선스

이 프로젝트는 개인 사용을 위한 것입니다.
