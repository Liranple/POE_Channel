# 탭 추가/수정 가이드

## 새로운 탭 추가하기

### 1단계: 페이지 컴포넌트 생성

`src/components/pages/` 폴더에 새 파일을 생성합니다.

```jsx
// src/components/pages/YourNewPage.jsx
export default function YourNewPage() {
  return (
    <div className="page-content">
      <h1>새 페이지 제목</h1>
      <div className="card" style={{ marginTop: "16px" }}>
        <p>페이지 내용</p>
      </div>
    </div>
  );
}
```

### 2단계: AppLayout에 페이지 등록

`src/components/AppLayout.jsx` 파일을 수정합니다.

#### 2-1. import 추가

```javascript
import YourNewPage from "../components/pages/YourNewPage";
```

#### 2-2. TABS 배열에 탭 정보 추가

```javascript
const TABS = [
  // ...기존 탭들
  { id: "your-id", label: "표시될 이름", icon: "🎯" },
];
```

**아이콘 선택 팁**:

- [Emojipedia](https://emojipedia.org/)에서 적절한 이모지 찾기
- 또는 유니코드 심볼 사용

#### 2-3. renderContent 함수에 case 추가

```javascript
const renderContent = () => {
  switch (activeTab) {
    // ...기존 case들
    case "your-id":
      return <YourNewPage />;
    // ...
  }
};
```

### 완성! 🎉

이제 사이드바에 새 탭이 표시되고, 클릭하면 해당 페이지로 전환됩니다.

## 탭 수정하기

### 탭 이름 변경

`TABS` 배열에서 `label` 속성만 수정:

```javascript
{ id: "flask", label: "플라스크 도구", icon: "⚗️" },
```

### 탭 아이콘 변경

`TABS` 배열에서 `icon` 속성만 수정:

```javascript
{ id: "flask", label: "플라스크 태그", icon: "🧪" },
```

### 탭 순서 변경

`TABS` 배열의 순서를 변경:

```javascript
const TABS = [
  { id: "flask", label: "플라스크 태그", icon: "⚗️" }, // 첫 번째
  { id: "home", label: "메인 페이지", icon: "🏠" }, // 두 번째
  // ...
];
```

## 탭 삭제하기

### 1단계: TABS 배열에서 제거

해당 탭 객체를 삭제합니다.

### 2단계: renderContent에서 case 제거

해당 case 블록을 삭제합니다.

### 3단계: 페이지 파일 삭제 (선택사항)

더 이상 사용하지 않는 페이지 컴포넌트 파일을 삭제할 수 있습니다.

## 기본 탭 변경하기

처음 접속했을 때 보여질 탭을 변경:

```javascript
const [activeTab, setActiveTab] = useState("your-id"); // 기본값 변경
```

## 페이지 컴포넌트 템플릿

### 기본 템플릿

```jsx
export default function PageName() {
  return (
    <div className="page-content">
      <h1>페이지 제목</h1>
      <p>간단한 설명</p>
    </div>
  );
}
```

### 카드 포함 템플릿

```jsx
export default function PageName() {
  return (
    <div className="page-content">
      <h1>페이지 제목</h1>

      <div className="card" style={{ marginTop: "16px" }}>
        <h2
          style={{
            fontSize: "20px",
            marginBottom: "12px",
            color: "var(--accent)",
          }}
        >
          섹션 제목
        </h2>
        <p>내용</p>
      </div>
    </div>
  );
}
```

### 복잡한 레이아웃 템플릿

```jsx
export default function PageName() {
  return (
    <div className="page-content">
      <h1>페이지 제목</h1>

      <div className="layout">
        <div className="card">
          <div className="section-title">왼쪽 섹션</div>
          {/* 내용 */}
        </div>

        <div className="card">
          <div className="section-title">오른쪽 섹션</div>
          {/* 내용 */}
        </div>
      </div>
    </div>
  );
}
```

## 사용 가능한 CSS 클래스

### 레이아웃

- `.page-content`: 페이지 콘텐츠 래퍼 (자동 중앙 정렬, 최대 너비 1100px)
- `.layout`: 2열 그리드 레이아웃
- `.card`: 카드 스타일 컨테이너
- `.wrap`: TagBuilder용 래퍼 (기존 호환성)

### 텍스트

- `.section-title`: 섹션 제목 (16px, accent 색상)
- `h1`: 페이지 제목 (32px, accent 색상)
- `p`: 기본 텍스트 (16px, muted 색상)

### 입력 요소

- `.search-box`: 검색 박스 스타일
- `input`: 기본 입력 필드 스타일

### 리스트

- `.list`: 스크롤 가능한 리스트 컨테이너
- `.option`: 리스트 아이템 스타일

## CSS 변수 사용

```css
/* 컴포넌트 내에서 인라인 스타일로 사용 */
<div style={{ color: "var(--accent)" }}>강조 텍스트</div>
<div style={{ color: "var(--muted)" }}>보조 텍스트</div>
<div style={{ background: "var(--card)" }}>카드 배경</div>
```

사용 가능한 변수:

- `--bg`: 배경색
- `--card`: 카드 배경색
- `--accent`: 강조 색상 (파란색)
- `--muted`: 보조 텍스트 색상
- `--text`: 기본 텍스트 색상
- `--admin-off`: 관리자 모드 꺼짐
- `--admin-on`: 관리자 모드 켜짐
- `--delete-red`: 삭제 색상

## 예제: 완전한 새 탭 추가

```jsx
// 1. src/components/pages/ExamplePage.jsx
export default function ExamplePage() {
  return (
    <div className="page-content">
      <h1>예제 페이지</h1>

      <div className="card" style={{ marginTop: "16px" }}>
        <h2 style={{ fontSize: "20px", marginBottom: "12px", color: "var(--accent)" }}>
          기능 설명
        </h2>
        <p style={{ lineHeight: "1.8", color: "var(--muted)" }}>
          이 페이지는 예제입니다.
        </p>
      </div>
    </div>
  );
}

// 2. src/components/AppLayout.jsx에 추가
import ExamplePage from "../components/pages/ExamplePage";

const TABS = [
  // ...
  { id: "example", label: "예제", icon: "📝" },
];

// renderContent()에 추가
case "example":
  return <ExamplePage />;
```
