# POE Channel

Path of Exile 관련 도구/정보를 한 화면에서 다루는 Next.js 웹 앱.

## 목적

- 기능 섹션을 빠르게 탐색하고 사용
- 데이터 조회/가공 로직을 API 라우트로 분리
- 페이지/스타일/데이터를 모듈 단위로 관리

## 실행

```bash
npm install
npm run dev
```

- 주소: `http://localhost:3000`

## 스크립트

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## 디렉터리

```text
src/
  app/         # 엔트리, 레이아웃, API 라우트
  components/  # 공통 UI, 페이지 컴포넌트
  styles/      # 스타일
  data/        # 정적 데이터/매핑
  lib/         # 외부 연동 로직
  hooks/       # 커스텀 훅
  config/      # 설정/상수
  utils/       # 유틸리티
```

## 문서 정책

- README는 개요, 실행, 구조만 기록
- 탭 이름, UI 문구, 버전 수치 등 변경 잦은 정보는 기록하지 않음

## 환경 변수

- 로컬 환경 변수 파일: `.env.local`
- 필요한 키는 코드 참조 기준으로 추가

## 라이선스

개인 사용 목적 프로젝트.
