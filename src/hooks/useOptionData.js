import { useState, useEffect, useCallback } from "react";
import {
  DATA_VERSIONS,
  OPTION_STORAGE_KEYS,
  createEmptyChanges,
  loadChanges,
  saveChanges,
  applyChanges,
  addOption,
  modifyOption,
  deleteOption,
  updateOrder,
} from "../utils/optionStorage";

/**
 * 옵션 데이터 관리 훅
 * 버전 관리 + 변경분 저장을 처리합니다.
 *
 * @param {string} type - 'flask' | 'map' | 'jewel'
 * @param {Array} defaultPrefixData - 기본 prefix 데이터
 * @param {Array} defaultSuffixData - 기본 suffix 데이터
 * @param {Array} defaultExtraData - 기본 추가 데이터 (jewel의 corrupted 등)
 */
export default function useOptionData(
  type,
  defaultPrefixData,
  defaultSuffixData,
  defaultExtraData = null
) {
  const storageKey = OPTION_STORAGE_KEYS[type];
  const currentVersion = DATA_VERSIONS[type];

  // 변경분 상태
  const [prefixChanges, setPrefixChanges] = useState(() =>
    createEmptyChanges(currentVersion)
  );
  const [suffixChanges, setSuffixChanges] = useState(() =>
    createEmptyChanges(currentVersion)
  );
  const [extraChanges, setExtraChanges] = useState(() =>
    defaultExtraData ? createEmptyChanges(currentVersion) : null
  );

  // 최종 데이터 상태 - 초기값을 함수로 설정하여 로드 시 적용
  const [prefixData, setPrefixData] = useState(() => {
    if (typeof window === "undefined") return defaultPrefixData;
    const saved = loadChanges(storageKey);
    if (saved?.prefix) {
      return applyChanges(defaultPrefixData, saved.prefix, currentVersion).data;
    }
    return defaultPrefixData;
  });

  const [suffixData, setSuffixData] = useState(() => {
    if (typeof window === "undefined") return defaultSuffixData;
    const saved = loadChanges(storageKey);
    if (saved?.suffix) {
      return applyChanges(defaultSuffixData, saved.suffix, currentVersion).data;
    }
    return defaultSuffixData;
  });

  const [extraData, setExtraData] = useState(() => {
    if (!defaultExtraData) return null;
    if (typeof window === "undefined") return defaultExtraData;
    const saved = loadChanges(storageKey);
    if (saved?.extra) {
      return applyChanges(defaultExtraData, saved.extra, currentVersion).data;
    }
    return defaultExtraData;
  });

  // 초기화 플래그
  const [isInitialized, setIsInitialized] = useState(false);

  // 초기 변경분 로드 (state만 설정, 데이터는 이미 위에서 로드됨)
  useEffect(() => {
    const saved = loadChanges(storageKey);

    if (saved) {
      if (saved.prefix) {
        const result = applyChanges(
          defaultPrefixData,
          saved.prefix,
          currentVersion
        );
        setPrefixChanges(result.changes);
      }
      if (saved.suffix) {
        const result = applyChanges(
          defaultSuffixData,
          saved.suffix,
          currentVersion
        );
        setSuffixChanges(result.changes);
      }
      if (defaultExtraData && saved.extra) {
        const result = applyChanges(
          defaultExtraData,
          saved.extra,
          currentVersion
        );
        setExtraChanges(result.changes);
      }
    }

    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 변경분 저장 (변경될 때마다)
  useEffect(() => {
    if (!isInitialized) return;

    // 변경분이 비어있는지 확인
    const isChangesEmpty = (changes) =>
      changes.deleted.length === 0 &&
      changes.added.length === 0 &&
      Object.keys(changes.modified).length === 0 &&
      changes.order === null;

    const isPrefixEmpty = isChangesEmpty(prefixChanges);
    const isSuffixEmpty = isChangesEmpty(suffixChanges);
    const isExtraEmpty = !extraChanges || isChangesEmpty(extraChanges);

    if (isPrefixEmpty && isSuffixEmpty && isExtraEmpty) {
      // 변경분이 없으면 저장하지 않음 (또는 삭제)
      localStorage.removeItem(storageKey);
    } else {
      const saveData = {
        prefix: prefixChanges,
        suffix: suffixChanges,
      };
      if (extraChanges) {
        saveData.extra = extraChanges;
      }
      saveChanges(storageKey, saveData);
    }
  }, [prefixChanges, suffixChanges, extraChanges, isInitialized, storageKey]);

  // 직접 데이터 설정 (드래그앤드롭 등에서 사용)
  const setDataDirectly = useCallback(
    (listType, newData) => {
      const newOrder = newData.map((item) => item.id);

      if (listType === "prefix") {
        setPrefixData(newData);
        setPrefixChanges((prev) => updateOrder(prev, newOrder));
      } else if (listType === "suffix") {
        setSuffixData(newData);
        setSuffixChanges((prev) => updateOrder(prev, newOrder));
      } else if (listType === "extra" && extraChanges) {
        setExtraData(newData);
        setExtraChanges((prev) => updateOrder(prev, newOrder));
      }
    },
    [extraChanges]
  );

  return {
    prefixData,
    suffixData,
    extraData,
    setPrefixData: (data) => setDataDirectly("prefix", data),
    setSuffixData: (data) => setDataDirectly("suffix", data),
    setExtraData: extraChanges
      ? (data) => setDataDirectly("extra", data)
      : null,
    isInitialized,
  };
}
