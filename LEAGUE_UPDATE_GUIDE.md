# 🔄 리그 업데이트 가이드

새 리그가 시작되면 이 문서를 참고하여 필요한 부분을 업데이트하세요.

---

## ✅ 필수 수정 (매 리그)

### 1. `src/config/league.js` - 리그 설정 파일

```javascript
// POE Ninja API URL에 사용되는 리그명 (영문)
export const CURRENT_LEAGUE = "새리그명"; // 예: "Settlers", "Necropolis"

// 메인 페이지에 표시되는 리그 정보
export const LEAGUE_INFO = {
  name: "Full League Name", // 영문 전체 이름
  nameKo: "리그 한글명", // 한글 이름
  startDate: new Date("YYYY-MM-DDTHH:MM:SS+09:00"), // 리그 시작 시간 (한국 시간)
};
```

> ⚠️ **startDate**: 리그 경과 시간 계산에 사용됩니다. 공식 홈페이지에서 가져오는 것이 아니라 이 값을 기준으로 계산하므로 정확히 설정해야 합니다!

---

## 📝 선택 수정 (신규 콘텐츠 추가 시)

### 2. 신규 젬 추가

**파일**: `src/data/GemNameMapping.js`

```javascript
export const GEM_NAME_TO_KOREAN = {
  // 기존 젬들...
  "New Support Gem": "새로운 서포트 젬", // 신규 젬 추가
};
```

### 3. 신규 점술 카드 추가

**파일**: `src/data/CardData.js`

```javascript
{
  name: "카드 한글명",
  reward: "보상 설명",
  cardReward: "보상 상세",
  locations: ["획득 위치1", "획득 위치2"],
  stackSize: 8,
  flavorText: "플레이버 텍스트",
},
```

**파일**: `src/data/CardImages.js` (이미지 매핑 필요 시)

### 4. 신규 유니크 아이템 시세 추적

**파일**: `src/app/api/items/route.js`

```javascript
const TRACKED_ITEMS = {
  // 기존 아이템들...
  "New Unique Item": {
    nameKo: "새 유니크 한글명",
    icon: "ItemIcon.webp",
    type: "UniqueArmour", // UniqueArmour, UniqueAccessory, UniqueFlask, UniqueJewel
  },
};
```

---

## 🔧 드문 수정 (수치 변경 시)

### 지도/플라스크/주얼 옵션 수치 변경

- `src/data/MapData.js` - 지도 관련 옵션
- `src/data/FlaskData.js` - 플라스크 옵션
- `src/data/JewelData.js` - 주얼 옵션
- `src/data/CatalystData.js` - 촉매 효과

---

## 📁 파일 구조 요약

```
src/
├── config/
│   ├── league.js          ⭐ 리그 설정 (매 리그 필수 수정)
│   ├── notices.js         📢 공지사항
│   └── constants.js       ⚙️ 앱 상수 (스토리지 키, 애니메이션 등)
├── data/
│   ├── GemNameMapping.js  📝 젬 한글 매핑 (신규 젬 추가 시)
│   ├── CardData.js        📝 카드 데이터 (신규 카드 추가 시)
│   ├── CardImages.js      📝 카드 이미지 매핑
│   ├── MapData.js         🔧 지도 옵션 (수치 변경 시)
│   ├── FlaskData.js       🔧 플라스크 옵션 (수치 변경 시)
│   └── JewelData.js       🔧 주얼 옵션 (수치 변경 시)
└── app/api/
    └── items/route.js     📝 유니크 아이템 추적 목록
```

---

## ❓ FAQ

### Q: 리그 경과 시간이 맞지 않아요

A: `src/config/league.js`의 `startDate`를 확인하세요. 한국 시간(KST, +09:00) 기준으로 설정해야 합니다.

### Q: POE Ninja API에서 데이터를 못 가져와요

A: `CURRENT_LEAGUE` 값이 정확한지 확인하세요. POE Ninja URL에서 사용하는 리그명과 동일해야 합니다.

- POE Ninja URL 예시: `https://poe.ninja/economy/keepers/currency`
- 이 경우 `CURRENT_LEAGUE = "Keepers"`

### Q: 새 유니크 아이템의 아이콘이 안 보여요

A: `public/images/items/` 폴더에 해당 아이콘 파일(.webp)이 있는지 확인하세요.

---

## 🔍 리그명 확인 방법

1. POE Ninja 접속: https://poe.ninja/economy
2. 현재 리그 선택
3. URL에서 리그명 확인 (예: `/economy/keepers/...` → `Keepers`)
