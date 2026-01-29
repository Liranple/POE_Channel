/**
 * 리그 설정 파일
 *
 * 🔄 리그가 변경될 때 이 파일만 수정하면 됩니다!
 *
 * 수정 체크리스트:
 * ----------------------------------------
 * ✅ 이 파일에서 수정:
 *   - CURRENT_LEAGUE: API URL에 사용되는 리그명 (영문)
 *   - LEAGUE_INFO: 메인 페이지에 표시되는 리그 정보
 *
 * 📝 data 폴더에서 수정 (신규 아이템 추가 시):
 *   - GemNameMapping.js: 신규 젬 한글 매핑 추가
 *   - CardData.js: 신규 카드 데이터 추가
 *   - CardImages.js: 신규 카드 이미지 매핑 추가
 *
 * 📝 API 파일에서 수정 (신규 유니크 아이템 추가 시):
 *   - api/items/route.js: TRACKED_ITEMS에 신규 아이템 추가
 *
 * 📝 수치 변경 시 (드문 경우):
 *   - MapData.js: 지도 옵션 수치
 *   - FlaskData.js: 플라스크 옵션 수치
 *   - JewelData.js: 주얼 옵션 수치
 *
 * ⚠️ 리그 경과 시간:
 *   - 공식 홈페이지에서 가져오는 것이 아니라,
 *   - startDate 기준으로 클라이언트에서 계산됩니다.
 *   - 따라서 startDate를 정확히 설정해야 합니다!
 * ----------------------------------------
 */

// POE Ninja API URL에 사용되는 리그명 (영문)
// 예: "Keepers", "Settlers", "Necropolis" 등
export const CURRENT_LEAGUE = "Keepers";

// 메인 페이지에 표시되는 리그 정보
export const LEAGUE_INFO = {
  // 영문 리그명 (전체)
  name: "Keepers of the Flame",

  // 한글 리그명
  nameKo: "불꽃의 수호자",

  // 리그 시작 시간 (한국 시간 기준)
  // ⚠️ 리그 경과 시간 계산에 사용되므로 정확히 설정!
  // ⚠️ 공식 홈페이지에서 자동으로 가져오지 않음! 수동 입력 필요!
  startDate: new Date("2025-11-01T04:00:00+09:00"),
};

// 캐시 설정
export const CACHE_DURATION = {
  API: 3600 * 1000, // API 캐시: 1시간
  CLIENT: 60 * 60 * 1000, // 클라이언트 캐시: 1시간
};
// 앱 버전 (푸터에 표시)
// 1.0.x - 버그 수정, 자잘한 개선
// 1.x.0 - 새 페이지/탭 추가 등 기능 추가
// x.0.0 - 대규모 변경
export const APP_VERSION = "1.1.0";
