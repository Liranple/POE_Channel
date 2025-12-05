/**
 * 애플리케이션 상수 정의 파일
 * 하드코딩된 값들을 중앙에서 관리합니다.
 */

// ==================== 로컬 스토리지 키 ====================
/**
 * 로컬 스토리지에 저장되는 데이터 키
 * - PRESETS: 사용자 설정 프리셋 (로컬 전용)
 * - POSTS: 토론 게시글 (향후 DB 마이그레이션 대상)
 */
export const STORAGE_KEYS = {
  // 프리셋 (로컬 스토리지 전용 - 개인 설정)
  FLASK_PRESETS: "flaskPresets",
  JEWEL_PRESETS: "jewelPresets",
  MAP_PRESETS: "mapPresets",

  // 토론 게시글 (향후 DB 마이그레이션 대상)
  DISCUSSION_POSTS: "poe_channel_discussion_posts",
};

// ==================== 애니메이션 설정 ====================
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    SMOOTH: "cubic-bezier(0.25, 1, 0.5, 1)",
    EASE_OUT: "ease-out",
    EASE_IN_OUT: "ease-in-out",
  },
};

// ==================== 플라스크 타입 매핑 ====================
export const FLASK_TYPE_NAMES = {
  생명력: "생명력",
  마나: "마나",
  특수: "특수",
  팅크: "팅크",
};

// ==================== 태그 정렬 순서 ====================
export const TAG_ORDER = {
  FLASK: ["생명력", "마나", "특수", "팅크"],
  JEWEL: [], // JewelData에서 동적으로 가져옴
};

// ==================== 삭제 지연 시간 (ms) ====================
export const DELETE_DELAY = 1000;
