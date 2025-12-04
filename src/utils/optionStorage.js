/**
 * 옵션 데이터 버전 관리 및 변경분 저장 시스템
 *
 * 개념:
 * - 기본 데이터(DEFAULT_DATA)는 코드에 내장
 * - 사용자 변경분(추가/수정/삭제/순서)만 localStorage에 저장
 * - 버전 업데이트 시 새 데이터와 사용자 변경분을 병합
 */

// 현재 데이터 버전 (기본 데이터 업데이트 시 증가)
export const DATA_VERSIONS = {
  flask: 1,
  map: 1,
  jewel: 1,
};

// 로컬 스토리지 키
export const OPTION_STORAGE_KEYS = {
  flask: "poe_flask_options",
  map: "poe_map_options",
  jewel: "poe_jewel_options",
  theme: "poe_theme",
};

/**
 * 저장되는 변경분 구조:
 * {
 *   version: number,           // 마지막으로 적용된 기본 데이터 버전
 *   deleted: number[],         // 삭제된 옵션 ID 목록
 *   added: object[],           // 추가된 옵션 목록 (id는 음수로 시작)
 *   modified: { [id]: object }, // 수정된 옵션 (id: 변경된 필드들)
 *   order: number[] | null,    // 순서 변경 시 전체 ID 순서 (null이면 기본 순서)
 * }
 */

/**
 * 초기 변경분 객체 생성
 */
export const createEmptyChanges = (version) => ({
  version,
  deleted: [],
  added: [],
  modified: {},
  order: null,
});

/**
 * 변경분을 localStorage에서 로드
 */
export const loadChanges = (key) => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error("Failed to load changes:", e);
    return null;
  }
};

/**
 * 변경분을 localStorage에 저장
 */
export const saveChanges = (key, changes) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(changes));
  } catch (e) {
    console.error("Failed to save changes:", e);
  }
};

/**
 * 기본 데이터에 변경분을 적용하여 최종 데이터 생성
 *
 * @param {Array} defaultData - 기본 옵션 데이터
 * @param {Object} changes - 변경분 객체
 * @param {number} currentVersion - 현재 기본 데이터 버전
 * @returns {Object} { data: 최종 데이터, changes: 업데이트된 변경분 }
 */
export const applyChanges = (defaultData, changes, currentVersion) => {
  // 변경분이 없으면 기본 데이터 반환
  if (!changes) {
    return {
      data: [...defaultData],
      changes: createEmptyChanges(currentVersion),
    };
  }

  // 버전이 다르면 새 데이터와 병합
  let updatedChanges = { ...changes };
  let baseData = [...defaultData];

  if (changes.version !== currentVersion) {
    // 새 버전의 데이터 ID 목록
    const newIds = new Set(defaultData.map((d) => d.id));

    // 삭제 목록에서 새로 추가된 ID는 유지 (사용자가 명시적으로 삭제한 것)
    // 하지만 새 데이터에 없는 ID는 삭제 목록에서 제거
    updatedChanges.deleted = changes.deleted.filter((id) => newIds.has(id));

    // 수정 목록에서 새 데이터에 없는 ID는 제거
    const newModified = {};
    for (const id in changes.modified) {
      if (newIds.has(Number(id))) {
        newModified[id] = changes.modified[id];
      }
    }
    updatedChanges.modified = newModified;

    // 순서는 리셋 (새 데이터 구조가 달라졌을 수 있음)
    // 단, 사용자 추가 옵션은 유지
    updatedChanges.order = null;

    // 버전 업데이트
    updatedChanges.version = currentVersion;
  }

  // 1. 삭제된 옵션 제외
  let result = baseData.filter(
    (item) => !updatedChanges.deleted.includes(item.id)
  );

  // 2. 수정된 옵션 적용
  result = result.map((item) => {
    const mod = updatedChanges.modified[item.id];
    if (mod) {
      return { ...item, ...mod };
    }
    return item;
  });

  // 3. 추가된 옵션 붙이기
  result = [...result, ...updatedChanges.added];

  // 4. 순서 적용 (order가 있으면)
  if (updatedChanges.order && updatedChanges.order.length > 0) {
    const orderMap = new Map(updatedChanges.order.map((id, idx) => [id, idx]));
    result.sort((a, b) => {
      const aIdx = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
      const bIdx = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
      return aIdx - bIdx;
    });
  }

  return { data: result, changes: updatedChanges };
};

/**
 * 옵션 추가 시 변경분 업데이트
 */
export const addOption = (changes, newOption) => {
  // 새 옵션 ID는 음수로 (기본 데이터와 충돌 방지)
  const newId =
    changes.added.length > 0
      ? Math.min(...changes.added.map((a) => a.id), -1) - 1
      : -1;

  return {
    ...changes,
    added: [...changes.added, { ...newOption, id: newId }],
  };
};

/**
 * 옵션 수정 시 변경분 업데이트
 */
export const modifyOption = (changes, id, modifications) => {
  // 사용자 추가 옵션이면 added에서 직접 수정
  if (id < 0) {
    return {
      ...changes,
      added: changes.added.map((item) =>
        item.id === id ? { ...item, ...modifications } : item
      ),
    };
  }

  // 기본 데이터 옵션이면 modified에 기록
  return {
    ...changes,
    modified: {
      ...changes.modified,
      [id]: { ...(changes.modified[id] || {}), ...modifications },
    },
  };
};

/**
 * 옵션 삭제 시 변경분 업데이트
 */
export const deleteOption = (changes, id) => {
  // 사용자 추가 옵션이면 added에서 제거
  if (id < 0) {
    return {
      ...changes,
      added: changes.added.filter((item) => item.id !== id),
      order: changes.order ? changes.order.filter((i) => i !== id) : null,
    };
  }

  // 기본 데이터 옵션이면 deleted에 추가
  return {
    ...changes,
    deleted: [...changes.deleted, id],
    modified: (() => {
      const newMod = { ...changes.modified };
      delete newMod[id];
      return newMod;
    })(),
    order: changes.order ? changes.order.filter((i) => i !== id) : null,
  };
};

/**
 * 순서 변경 시 변경분 업데이트
 */
export const updateOrder = (changes, newOrder) => {
  return {
    ...changes,
    order: newOrder,
  };
};

/**
 * 테마 설정 로드
 */
export const loadTheme = () => {
  if (typeof window === "undefined") return "dark";
  try {
    return localStorage.getItem(OPTION_STORAGE_KEYS.theme) || "dark";
  } catch (e) {
    return "dark";
  }
};

/**
 * 테마 설정 저장
 */
export const saveTheme = (theme) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OPTION_STORAGE_KEYS.theme, theme);
  } catch (e) {
    console.error("Failed to save theme:", e);
  }
};
