import { useState, useEffect, useCallback, useRef } from "react";
import {
  DATA_VERSIONS,
  OPTION_STORAGE_KEYS,
  createEmptyChanges,
  loadChanges,
  saveChanges,
  applyChanges,
  modifyOption as modifyOptionInChanges,
  deleteOption as deleteOptionFromChanges,
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
  const [prefixData, setPrefixDataInternal] = useState(() => {
    if (typeof window === "undefined") return defaultPrefixData;
    const saved = loadChanges(storageKey);
    if (saved?.prefix) {
      return applyChanges(defaultPrefixData, saved.prefix, currentVersion).data;
    }
    return defaultPrefixData;
  });

  const [suffixData, setSuffixDataInternal] = useState(() => {
    if (typeof window === "undefined") return defaultSuffixData;
    const saved = loadChanges(storageKey);
    if (saved?.suffix) {
      return applyChanges(defaultSuffixData, saved.suffix, currentVersion).data;
    }
    return defaultSuffixData;
  });

  const [extraData, setExtraDataInternal] = useState(() => {
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

  // 저장 스킵 플래그 (초기화 중 저장 방지)
  const skipSaveRef = useRef(true);

  // 초기 변경분 로드 (state만 설정, 데이터는 이미 위에서 로드됨)
  useEffect(() => {
    skipSaveRef.current = true;
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
    // 다음 렌더 사이클에서 저장 활성화
    setTimeout(() => {
      skipSaveRef.current = false;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 변경분 저장 (변경될 때마다)
  useEffect(() => {
    if (!isInitialized || skipSaveRef.current) return;

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

  // 순서 변경 핸들러 (드래그앤드롭에서 사용)
  // newDataOrIds: 새로운 데이터 배열 또는 ID 배열
  const updateDataOrder = useCallback(
    (listType, newDataOrIds) => {
      // ID 배열인지 데이터 배열인지 확인
      const isIdArray =
        Array.isArray(newDataOrIds) &&
        newDataOrIds.length > 0 &&
        typeof newDataOrIds[0] === "number";

      if (listType === "prefix") {
        if (isIdArray) {
          // ID 배열인 경우: 현재 데이터를 기반으로 재정렬
          const idOrder = newDataOrIds;
          setPrefixDataInternal((prevData) => {
            const dataMap = new Map(prevData.map((item) => [item.id, item]));
            const reordered = idOrder
              .map((id) => dataMap.get(id))
              .filter(Boolean);
            // ID 배열에 없는 항목들도 끝에 추가 (새로 추가된 항목 등)
            const remainingItems = prevData.filter(
              (item) => !idOrder.includes(item.id)
            );
            return [...reordered, ...remainingItems];
          });
          setPrefixChanges((prev) => updateOrder(prev, idOrder));
        } else {
          // 데이터 배열인 경우: 기존 로직
          const newOrder = newDataOrIds.map((item) => item.id);
          setPrefixDataInternal(newDataOrIds);
          setPrefixChanges((prev) => updateOrder(prev, newOrder));
        }
      } else if (listType === "suffix") {
        if (isIdArray) {
          const idOrder = newDataOrIds;
          setSuffixDataInternal((prevData) => {
            const dataMap = new Map(prevData.map((item) => [item.id, item]));
            const reordered = idOrder
              .map((id) => dataMap.get(id))
              .filter(Boolean);
            const remainingItems = prevData.filter(
              (item) => !idOrder.includes(item.id)
            );
            return [...reordered, ...remainingItems];
          });
          setSuffixChanges((prev) => updateOrder(prev, idOrder));
        } else {
          const newOrder = newDataOrIds.map((item) => item.id);
          setSuffixDataInternal(newDataOrIds);
          setSuffixChanges((prev) => updateOrder(prev, newOrder));
        }
      } else if (listType === "extra" && defaultExtraData) {
        if (isIdArray) {
          const idOrder = newDataOrIds;
          setExtraDataInternal((prevData) => {
            const dataMap = new Map(prevData.map((item) => [item.id, item]));
            const reordered = idOrder
              .map((id) => dataMap.get(id))
              .filter(Boolean);
            const remainingItems = prevData.filter(
              (item) => !idOrder.includes(item.id)
            );
            return [...reordered, ...remainingItems];
          });
          setExtraChanges((prev) => updateOrder(prev, idOrder));
        } else {
          const newOrder = newDataOrIds.map((item) => item.id);
          setExtraDataInternal(newDataOrIds);
          setExtraChanges((prev) => updateOrder(prev, newOrder));
        }
      }
    },
    [defaultExtraData]
  );

  // 옵션 추가 핸들러
  const addOption = useCallback(
    (listType, newOption) => {
      if (listType === "prefix") {
        // 먼저 현재 changes를 읽어서 새 ID 계산
        setPrefixChanges((prev) => {
          const newId =
            prev.added.length > 0
              ? Math.min(...prev.added.map((a) => a.id), -1) - 1
              : -1;
          const addedOption = { ...newOption, id: newId };

          // 데이터 업데이트는 별도로 수행 (batching 활용)
          // React 18에서는 자동으로 batching됨
          setPrefixDataInternal((prevData) => {
            // 이미 같은 ID가 있으면 추가하지 않음 (중복 방지)
            if (prevData.some((item) => item.id === newId)) {
              return prevData;
            }
            return [...prevData, addedOption];
          });

          // 이미 같은 ID가 있으면 추가하지 않음
          if (prev.added.some((item) => item.id === newId)) {
            return prev;
          }

          return {
            ...prev,
            added: [...prev.added, addedOption],
          };
        });
      } else if (listType === "suffix") {
        setSuffixChanges((prev) => {
          const newId =
            prev.added.length > 0
              ? Math.min(...prev.added.map((a) => a.id), -1) - 1
              : -1;
          const addedOption = { ...newOption, id: newId };

          setSuffixDataInternal((prevData) => {
            if (prevData.some((item) => item.id === newId)) {
              return prevData;
            }
            return [...prevData, addedOption];
          });

          if (prev.added.some((item) => item.id === newId)) {
            return prev;
          }

          return {
            ...prev,
            added: [...prev.added, addedOption],
          };
        });
      } else if (listType === "extra" && defaultExtraData) {
        setExtraChanges((prev) => {
          const newId =
            prev.added.length > 0
              ? Math.min(...prev.added.map((a) => a.id), -1) - 1
              : -1;
          const addedOption = { ...newOption, id: newId };

          setExtraDataInternal((prevData) => {
            if (prevData.some((item) => item.id === newId)) {
              return prevData;
            }
            return [...prevData, addedOption];
          });

          if (prev.added.some((item) => item.id === newId)) {
            return prev;
          }

          return {
            ...prev,
            added: [...prev.added, addedOption],
          };
        });
      }
    },
    [defaultExtraData]
  );

  // 옵션 수정 핸들러
  const modifyOption = useCallback(
    (listType, id, modifications) => {
      const updateData = (setData) => {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, ...modifications } : item
          )
        );
      };

      if (listType === "prefix") {
        setPrefixChanges((prev) =>
          modifyOptionInChanges(prev, id, modifications)
        );
        updateData(setPrefixDataInternal);
      } else if (listType === "suffix") {
        setSuffixChanges((prev) =>
          modifyOptionInChanges(prev, id, modifications)
        );
        updateData(setSuffixDataInternal);
      } else if (listType === "extra" && defaultExtraData) {
        setExtraChanges((prev) =>
          modifyOptionInChanges(prev, id, modifications)
        );
        updateData(setExtraDataInternal);
      }
    },
    [defaultExtraData]
  );

  // 옵션 삭제 핸들러
  const deleteOption = useCallback(
    (listType, id) => {
      const removeFromData = (setData) => {
        setData((prevData) => prevData.filter((item) => item.id !== id));
      };

      if (listType === "prefix") {
        setPrefixChanges((prev) => deleteOptionFromChanges(prev, id));
        removeFromData(setPrefixDataInternal);
      } else if (listType === "suffix") {
        setSuffixChanges((prev) => deleteOptionFromChanges(prev, id));
        removeFromData(setSuffixDataInternal);
      } else if (listType === "extra" && defaultExtraData) {
        setExtraChanges((prev) => deleteOptionFromChanges(prev, id));
        removeFromData(setExtraDataInternal);
      }
    },
    [defaultExtraData]
  );

  return {
    prefixData,
    suffixData,
    extraData,
    // 순서 변경용 (드래그앤드롭)
    setPrefixData: (data) => updateDataOrder("prefix", data),
    setSuffixData: (data) => updateDataOrder("suffix", data),
    setExtraData: defaultExtraData
      ? (data) => updateDataOrder("extra", data)
      : null,
    // 개별 옵션 조작용 함수들
    addOption,
    modifyOption,
    deleteOption,
    isInitialized,
  };
}
