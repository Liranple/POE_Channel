import { useState, useEffect, useCallback } from "react";

/**
 * 프리셋 관리 커스텀 훅
 *
 * Flask, Jewels, Maps 페이지에서 공통으로 사용되는 프리셋 관리 로직을 추상화합니다.
 *
 * @param {string} storageKey - 로컬 스토리지 키
 * @param {Function} setSelected - 선택된 옵션들을 설정하는 setState 함수
 * @param {Array|Object} selected - 현재 선택된 옵션들
 * @param {Object} options - 추가 옵션
 * @param {boolean} options.isObjectMode - selected가 객체인지 배열인지 (MapsPage용)
 * @param {Function} options.migratePreset - 구버전 데이터 마이그레이션 함수
 * @returns {Object} 프리셋 관리 함수들
 */
export default function usePreset(
  storageKey,
  setSelected,
  selected,
  options = {}
) {
  const { isObjectMode = false, migratePreset } = options;

  const [presets, setPresets] = useState([]);
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [showPresetWarning, setShowPresetWarning] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);

  // 프리셋 로드 (컴포넌트 마운트 시)
  useEffect(() => {
    const loadPresets = () => {
      const savedPresets = localStorage.getItem(storageKey);
      if (savedPresets) {
        try {
          let parsed = JSON.parse(savedPresets);

          // 마이그레이션 함수가 제공된 경우 실행
          if (migratePreset) {
            parsed = parsed.map(migratePreset);
          } else {
            // 기본 마이그레이션: ID가 없는 구버전 데이터 처리
            parsed = parsed.map((p) =>
              p.id ? p : { ...p, id: Date.now() + Math.random() }
            );
          }

          setPresets(parsed);
        } catch (e) {
          console.error("Failed to load presets", e);
        }
      }
    };
    loadPresets();
  }, [storageKey, migratePreset]);

  // 프리셋 저장
  const savePresetsToStorage = useCallback(
    (newPresets) => {
      localStorage.setItem(storageKey, JSON.stringify(newPresets));
    },
    [storageKey]
  );

  // 프리셋 추가 모달 열기
  const openPresetModal = useCallback(() => {
    const isEmpty = isObjectMode
      ? Object.keys(selected).length === 0
      : selected.length === 0;

    if (isEmpty) {
      setShowPresetWarning(true);
      setTimeout(() => setShowPresetWarning(false), 2000);
      return;
    }
    setEditingPreset(null);
    setNewPresetName("");
    setPresetModalVisible(true);
  }, [selected, isObjectMode]);

  // 프리셋 수정 모달 열기
  const openEditPresetModal = useCallback((preset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setPresetModalVisible(true);
  }, []);

  // 프리셋 저장 (추가 또는 수정)
  const savePreset = useCallback(() => {
    if (!newPresetName.trim()) return;

    let newPresets;
    if (editingPreset) {
      // 수정 로직
      newPresets = presets.map((p) =>
        p.id === editingPreset.id ? { ...p, name: newPresetName } : p
      );
    } else {
      // 추가 로직 - selected는 외부에서 전달받은 현재 선택 상태
      // options 객체가 있는 경우 (MapsPage 등)
      const presetData = { id: Date.now(), name: newPresetName };

      if (isObjectMode) {
        presetData.options = selected;
      } else {
        presetData.selected = selected;
      }

      newPresets = [...presets, presetData];
    }

    setPresets(newPresets);
    savePresetsToStorage(newPresets);
    setPresetModalVisible(false);
  }, [
    presets,
    selected,
    newPresetName,
    editingPreset,
    isObjectMode,
    savePresetsToStorage,
  ]);

  // 프리셋 로드
  const handleLoadPreset = useCallback(
    (preset) => {
      if (isObjectMode) {
        setSelected(preset.options || {});
      } else {
        setSelected(preset.selected || []);
      }
    },
    [setSelected, isObjectMode]
  );

  // 프리셋 삭제
  const handleDeletePreset = useCallback(
    (preset) => {
      setPresets((prev) => {
        const newPresets = prev.filter((p) => p.id !== preset.id);
        savePresetsToStorage(newPresets);
        return newPresets;
      });
    },
    [savePresetsToStorage]
  );

  // 프리셋 수정 (모달 열기)
  const handleEditPreset = useCallback(
    (preset) => {
      openEditPresetModal(preset);
    },
    [openEditPresetModal]
  );

  // 프리셋 순서 변경 (드래그 앤 드롭 후)
  const updatePresetOrder = useCallback(
    (newPresets) => {
      setPresets(newPresets);
      savePresetsToStorage(newPresets);
    },
    [savePresetsToStorage]
  );

  // 모달 닫기
  const closePresetModal = useCallback(() => {
    setPresetModalVisible(false);
    setEditingPreset(null);
    setNewPresetName("");
  }, []);

  return {
    // 상태
    presets,
    setPresets,
    presetModalVisible,
    newPresetName,
    setNewPresetName,
    showPresetWarning,
    editingPreset,

    // 액션
    openPresetModal,
    openEditPresetModal,
    savePreset,
    handleLoadPreset,
    handleDeletePreset,
    handleEditPreset,
    updatePresetOrder,
    closePresetModal,
    savePresetsToStorage,
  };
}
