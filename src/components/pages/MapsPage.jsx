"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import useDraggableScroll from "../../hooks/useDraggableScroll";
import useDragHandler from "../../hooks/useDragHandler";
import useOptionData from "../../hooks/useOptionData";
import { STORAGE_KEYS } from "../../constants";

import { DEFAULT_PREFIX_DATA, DEFAULT_SUFFIX_DATA } from "../../data/MapData";
import OptionItem from "../OptionItem";
import PresetItem from "../PresetItem";
import "../../styles/MapsPage.css";

/**
 * 지도 정규식 빌더 페이지
 *
 * 데이터 구조:
 * - prefixData/suffixData: 기본 데이터 + 사용자 변경분 (localStorage에 변경분만 저장)
 * - presets: 로컬 스토리지에 저장되는 사용자 프리셋 (개인 설정)
 *   - MapsPage 프리셋은 mapStats, andFlags도 포함하는 특수 구조
 * - selected: 현재 선택된 옵션들 (객체 형태 - include/exclude)
 */

// 프리셋 마이그레이션 함수 (구버전 호환성)
const migrateMapPreset = (p) => {
  let newOptions = p.options;
  if (Array.isArray(p.options)) {
    newOptions = {};
    p.options.forEach((opt) => {
      newOptions[opt] = "include";
    });
  }
  return p.id
    ? { ...p, options: newOptions }
    : { ...p, id: Date.now() + Math.random(), options: newOptions };
};

export default function MapsPage() {
  const [adminMode, setAdminMode] = useState(false);
  const [selected, setSelected] = useState({});
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [presets, setPresets] = useState([]);

  // 옵션 데이터 관리 (버전 관리 + 변경분 저장)
  const {
    prefixData,
    suffixData,
    setPrefixData,
    setSuffixData,
    isInitialized,
  } = useOptionData("map", DEFAULT_PREFIX_DATA, DEFAULT_SUFFIX_DATA);

  // 프리셋 모달 상태
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [showPresetWarning, setShowPresetWarning] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);

  // 드래그 핸들러 훅
  const { handleOptionDragStart, handlePresetDragStart } =
    useDragHandler(adminMode);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [modalListId, setModalListId] = useState(null);
  const [currentEditOption, setCurrentEditOption] = useState(null);

  const [mapStats, setMapStats] = useState({
    quantity: "",
    packSize: "",
    scarabs: "",
    currency: "",
    maps: "",
  });

  const [andFlags, setAndFlags] = useState({
    quantity: false,
    packSize: false,
    scarabs: false,
    currency: false,
    maps: false,
  });

  const toggleAndFlag = (key) => {
    setAndFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [modalData, setModalData] = useState({
    optionText: "",
    filterRegex: "",
    types: [],
  });

  const modalBgRef = useRef(null);
  const modalDown = useRef(false);
  const presetModalDown = useRef(false);

  // 로컬 스토리지에서 프리셋 로드
  useEffect(() => {
    const loadPresets = () => {
      const savedPresets = localStorage.getItem(STORAGE_KEYS.MAP_PRESETS);
      if (savedPresets) {
        try {
          const parsed = JSON.parse(savedPresets);
          const migrated = parsed.map(migrateMapPreset);
          setPresets(migrated);
        } catch (e) {
          console.error("Failed to load presets", e);
        }
      }
    };
    loadPresets();
  }, []);

  // 프리셋 드래그 핸들러 wrapper
  const onPresetDragStart = useCallback(
    (e, index) => {
      handlePresetDragStart(e, index, presets, (newPresets) => {
        setPresets(newPresets);
        localStorage.setItem(
          STORAGE_KEYS.MAP_PRESETS,
          JSON.stringify(newPresets)
        );
      });
    },
    [presets, handlePresetDragStart]
  );

  const toggleOption = useCallback((opt) => {
    const normalRegex = opt.filterRegex;

    setSelected((prev) => {
      const currentState = prev[normalRegex];
      let newState;
      if (!currentState) {
        newState = "include";
      } else if (currentState === "include") {
        newState = "exclude";
      } else {
        newState = undefined; // Remove
      }

      const next = { ...prev };
      if (newState) {
        next[normalRegex] = newState;
      } else {
        delete next[normalRegex];
      }
      return next;
    });
  }, []);

  const handleClear = () => {
    setSelected({});
    setMapStats({
      quantity: "",
      packSize: "",
      scarabs: "",
      currency: "",
      maps: "",
    });
    setAndFlags({
      quantity: false,
      packSize: false,
      scarabs: false,
      currency: false,
      maps: false,
    });
  };

  const generateMapStatRegex = (prefix, valueStr) => {
    const val = parseInt(valueStr, 10);
    if (isNaN(val) || val < 10) return "";

    // 1000 이상은 1...% 로 통일
    if (val >= 1000) return prefix + "1...%";

    let parts = [];

    if (val < 100) {
      // 10 ~ 99
      const t = Math.floor(val / 10);
      const u = val % 10;

      if (t === 9) {
        if (u === 0) parts.push(`9.`);
        else if (u === 9) parts.push(`99`);
        else parts.push(`9[${u}-9]`);
      } else {
        if (u === 0) parts.push(`[${t}-9].`);
        else if (u === 9) {
          parts.push(`${t}9`);
          parts.push(`[${t + 1}-9].`);
        } else {
          parts.push(`${t}[${u}-9]`);
          parts.push(`[${t + 1}-9].`);
        }
      }
      parts.push(`[1-9]..`); // 100~999
    } else {
      // 100 ~ 999
      const h = Math.floor(val / 100);
      const t = Math.floor((val % 100) / 10);
      const u = val % 10;

      if (u === 0) {
        if (t === 0) parts.push(`${h}..`);
        else parts.push(`${h}[${t}-9].`);
      } else if (u === 9) {
        parts.push(`${h}${t}9`);
        if (t < 9) parts.push(`${h}[${t + 1}-9].`);
      } else {
        parts.push(`${h}${t}[${u}-9]`);
        if (t < 9) parts.push(`${h}[${t + 1}-9].`);
      }

      if (h < 9) parts.push(`[${h + 1}-9]..`);
    }

    return prefix + "(" + parts.join("|") + ")%";
  };

  const resultText = useMemo(() => {
    const stats = [
      { key: "quantity", prefix: "량.*", val: mapStats.quantity },
      { key: "packSize", prefix: "모.*", val: mapStats.packSize },
      { key: "scarabs", prefix: "갑.*", val: mapStats.scarabs },
      { key: "currency", prefix: "화.*", val: mapStats.currency },
      { key: "maps", prefix: "지도.*", val: mapStats.maps },
    ];

    const mapAnds = [];
    const mapOrs = [];

    stats.forEach(({ key, prefix, val }) => {
      const regex = generateMapStatRegex(prefix, val);
      if (regex) {
        if (andFlags[key]) {
          mapAnds.push(regex);
        } else {
          mapOrs.push(regex);
        }
      }
    });

    const includes = [];
    const excludes = [];

    Object.entries(selected).forEach(([regex, mode]) => {
      if (mode === "include") {
        includes.push(regex);
      } else if (mode === "exclude") {
        excludes.push(regex);
      }
    });

    const parts = [];

    // 1. Map Stats
    // AND stats (space separated)
    if (mapAnds.length > 0) {
      parts.push(mapAnds.join(" "));
    }
    // OR stats (pipe separated)
    if (mapOrs.length > 0) {
      parts.push(mapOrs.join("|"));
    }

    // 2. Included Options (OR group)
    if (includes.length > 0) {
      const uniqueIncludes = Array.from(new Set(includes));
      parts.push(uniqueIncludes.join("|"));
    }

    // 3. Excluded Options (NOT OR group)
    if (excludes.length > 0) {
      const uniqueExcludes = Array.from(new Set(excludes));
      parts.push("!" + uniqueExcludes.join("|"));
    }

    return parts.join(" ");
  }, [selected, mapStats, andFlags]);

  const handleCopy = async () => {
    if (!resultText) return;
    try {
      await navigator.clipboard.writeText(resultText);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  // 프리셋 저장
  const savePreset = useCallback(() => {
    if (!newPresetName.trim()) return;

    let updatedPresets;
    if (editingPreset) {
      // 수정 모드
      updatedPresets = presets.map((p) =>
        p.id === editingPreset.id
          ? {
              ...p,
              name: newPresetName,
              options: selected,
              mapStats,
              andFlags,
            }
          : p
      );
    } else {
      // 추가 모드
      const newPreset = {
        id: Date.now(),
        name: newPresetName,
        options: selected,
        mapStats,
        andFlags,
      };
      updatedPresets = [...presets, newPreset];
    }

    setPresets(updatedPresets);
    localStorage.setItem("mapPresets", JSON.stringify(updatedPresets));
    setPresetModalVisible(false);
    setNewPresetName("");
    setEditingPreset(null);
  }, [newPresetName, editingPreset, presets, selected, mapStats, andFlags]);

  // 프리셋 로드
  const handleLoadPreset = useCallback((preset) => {
    if (Array.isArray(preset.options)) {
      // Migration for old presets
      const newOptions = {};
      preset.options.forEach((opt) => {
        newOptions[opt] = "include";
      });
      setSelected(newOptions);
    } else {
      setSelected(preset.options || {});
    }

    if (preset.mapStats) {
      setMapStats(preset.mapStats);
    }
    if (preset.andFlags) {
      setAndFlags(preset.andFlags);
    } else {
      setAndFlags({
        quantity: false,
        packSize: false,
        scarabs: false,
        currency: false,
        maps: false,
      });
    }
  }, []);

  // 프리셋 삭제
  const handleDeletePreset = useCallback((preset) => {
    setPresets((prev) => {
      const updated = prev.filter((p) => p.id !== preset.id);
      localStorage.setItem("mapPresets", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 프리셋 수정 모달 열기
  const handleEditPreset = useCallback((preset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setPresetModalVisible(true);
  }, []);

  // 프리셋 모달 열기 (추가)
  const openPresetModal = useCallback(() => {
    if (
      Object.keys(selected).length === 0 &&
      !Object.values(mapStats).some((v) => v >= 10)
    ) {
      setShowPresetWarning(true);
      setTimeout(() => setShowPresetWarning(false), 2000);
      return;
    }
    setEditingPreset(null);
    setNewPresetName("");
    setPresetModalVisible(true);
  }, [selected, mapStats]);

  // 프리셋 영역 드롭 핸들러
  const handlePresetDrop = (e) => {
    if (!adminMode) return;
    e.preventDefault();
    document.body.classList.remove("dragging-active");

    const sourceIndex = parseInt(e.dataTransfer.getData("presetIndex"), 10);
    if (isNaN(sourceIndex)) return;

    const dropTarget = e.target.closest(".preset-item");
    // 맨 뒤로 이동하는 경우 처리 등을 위해 dropTarget이 없으면 맨 뒤로
    let dropIndex;
    if (dropTarget) {
      dropIndex = Array.from(dropTarget.parentNode.children).indexOf(
        dropTarget
      );
    } else {
      dropIndex = presets.length - 1;
    }

    if (sourceIndex === dropIndex) return;

    const newPresets = [...presets];
    const [movedPreset] = newPresets.splice(sourceIndex, 1);
    newPresets.splice(dropIndex, 0, movedPreset);

    setPresets(newPresets);
    localStorage.setItem("mapPresets", JSON.stringify(newPresets));
  };

  // 모달 관련 함수
  const openModal = useCallback((item = null, mode = "add", listId = null) => {
    setModalMode(mode);
    setModalListId(listId);
    setCurrentEditOption(item);

    if (item) {
      setModalData({
        optionText: item.optionText,
        filterRegex: item.filterRegex,
        types: item.type ? item.type.split(", ") : [],
      });
    } else {
      setModalData({
        optionText: "",
        filterRegex: "",
        types: [],
      });
    }
    setModalVisible(true);
  }, []);

  const handleModalSave = () => {
    const newItem = {
      id: currentEditOption ? currentEditOption.id : Date.now(),
      affix:
        modalListId === "prefixList"
          ? "prefix"
          : modalListId === "suffixList"
          ? "suffix"
          : "corrupted",
      optionText: modalData.optionText,
      filterRegex: modalData.filterRegex,
      type: modalData.types.join(", "),
    };

    if (modalMode === "add") {
      if (modalListId === "prefixList") {
        setPrefixData([...prefixData, newItem]);
      } else if (modalListId === "suffixList") {
        setSuffixData([...suffixData, newItem]);
      }
    } else {
      // Edit
      if (modalListId === "prefixList") {
        setPrefixData(
          prefixData.map((item) => (item.id === newItem.id ? newItem : item))
        );
      } else if (modalListId === "suffixList") {
        setSuffixData(
          suffixData.map((item) => (item.id === newItem.id ? newItem : item))
        );
      }
    }
    setModalVisible(false);
  };

  const deleteOption = useCallback((opt, data, setData, listId) => {
    const idx = data.indexOf(opt);
    if (idx > -1) {
      const newData = [...data];
      newData.splice(idx, 1);
      setData(newData);

      // Also remove from selected if present
      setSelected((prev) => {
        if (prev[opt.filterRegex]) {
          const next = { ...prev };
          delete next[opt.filterRegex];
          return next;
        }
        return prev;
      });
    }
  }, []);

  const toggleType = (type) => {
    if (modalData.types.includes(type)) {
      setModalData({
        ...modalData,
        types: modalData.types.filter((t) => t !== type),
      });
    } else {
      setModalData({ ...modalData, types: [...modalData.types, type] });
    }
  };

  const handleWheel = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -1 : 1;
    const currentVal = parseInt(mapStats[key] || "0", 10);
    const newVal = Math.max(0, currentVal + delta);
    setMapStats((prev) => ({ ...prev, [key]: newVal.toString() }));
  };

  // 가로 스크롤 드래그
  const scrollRef = useRef(null);
  const isDraggingScroll = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDraggingScroll.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const handleMouseLeave = () => {
    isDraggingScroll.current = false;
  };
  const handleMouseUp = () => {
    isDraggingScroll.current = false;
  };
  const handleMouseMove = (e) => {
    if (!isDraggingScroll.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // 스크롤 속도 조절
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const prefixScroll = useDraggableScroll(!adminMode);
  const suffixScroll = useDraggableScroll(!adminMode);

  return (
    <div className="maps-page-wrapper">
      <div className="sticky-top-area">
        <div className="wrap" style={{ paddingBottom: 0 }}>
          <header>
            <h1>지도 정규식 빌더</h1>
            <div className="admin-container">
              <span style={{ color: "var(--text)", fontWeight: 700 }}>
                관리자 모드
              </span>
              <button
                id="adminBtn"
                className={`admin-toggle ${adminMode ? "on" : ""}`}
                onClick={() => setAdminMode(!adminMode)}
              >
                <span className="circle"></span>
              </button>
            </div>
          </header>
          {/* 상단 프리셋 바 (가로 스크롤) */}
          <div
            className="preset-bar-container"
            onDragOver={(e) => {
              if (adminMode) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }
            }}
            onDrop={handlePresetDrop}
          >
            <div className="preset-label">PRESETS</div>
            <div
              className="preset-scroll-wrapper"
              style={{ position: "relative" }}
            >
              {showPresetWarning && (
                <div
                  className="preset-warning-toast"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 100,
                  }}
                >
                  저장할 옵션이 선택되지 않았습니다
                </div>
              )}
              <div
                className="preset-scroll-area"
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                {presets.length === 0 ? (
                  <span className="no-preset-msg">
                    저장된 프리셋이 없습니다
                  </span>
                ) : (
                  presets.map((preset, idx) => (
                    <PresetItem
                      key={preset.id}
                      index={idx}
                      preset={preset}
                      onLoad={handleLoadPreset}
                      onDelete={handleDeletePreset}
                      onEdit={handleEditPreset}
                      adminMode={adminMode}
                      onDragStart={handlePresetDragStart}
                    />
                  ))
                )}
              </div>
            </div>
            <button className="add-preset-chip" onClick={openPresetModal}>
              <span>+ New</span>
            </button>
          </div>

          {/* 선택 결과 영역 */}
          <div className="card result-card" style={{ marginBottom: 0 }}>
            <div className="result-input-wrapper" onClick={handleCopy}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  id="result"
                  className="search-box"
                  readOnly
                  placeholder="선택한 옵션 정규식이 여기 표시됩니다"
                  value={resultText}
                />
                {showCopyToast && (
                  <div
                    className="copy-toast"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 100,
                    }}
                  >
                    복사되었습니다
                  </div>
                )}
              </div>
              {(Object.keys(selected).length > 0 ||
                Object.values(mapStats).some((v) => v)) && (
                <button
                  className="clear-btn-inside"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {/* Map Stats Inputs */}
            <div className="map-stats-container">
              <div className="map-stat-input-group">
                <div
                  className="map-stat-label-wrapper"
                  onClick={() => toggleAndFlag("quantity")}
                >
                  <span
                    className={`logic-badge ${
                      andFlags.quantity ? "and" : "or"
                    }`}
                  >
                    {andFlags.quantity ? "AND" : "OR"}
                  </span>
                  <span className="map-stat-name">수량</span>
                </div>
                <input
                  className="map-stat-input"
                  type="number"
                  placeholder="0"
                  value={mapStats.quantity}
                  onChange={(e) =>
                    setMapStats({ ...mapStats, quantity: e.target.value })
                  }
                  onWheel={(e) => handleWheel(e, "quantity")}
                />
              </div>
              <div className="map-stat-input-group">
                <div
                  className="map-stat-label-wrapper"
                  onClick={() => toggleAndFlag("packSize")}
                >
                  <span
                    className={`logic-badge ${
                      andFlags.packSize ? "and" : "or"
                    }`}
                  >
                    {andFlags.packSize ? "AND" : "OR"}
                  </span>
                  <span className="map-stat-name">규모</span>
                </div>
                <input
                  className="map-stat-input"
                  type="number"
                  placeholder="0"
                  value={mapStats.packSize}
                  onChange={(e) =>
                    setMapStats({ ...mapStats, packSize: e.target.value })
                  }
                  onWheel={(e) => handleWheel(e, "packSize")}
                />
              </div>
              <div className="map-stat-input-group">
                <div
                  className="map-stat-label-wrapper"
                  onClick={() => toggleAndFlag("scarabs")}
                >
                  <span
                    className={`logic-badge ${andFlags.scarabs ? "and" : "or"}`}
                  >
                    {andFlags.scarabs ? "AND" : "OR"}
                  </span>
                  <span className="map-stat-name">갑충</span>
                </div>
                <input
                  className="map-stat-input"
                  type="number"
                  placeholder="0"
                  value={mapStats.scarabs}
                  onChange={(e) =>
                    setMapStats({ ...mapStats, scarabs: e.target.value })
                  }
                  onWheel={(e) => handleWheel(e, "scarabs")}
                />
              </div>
              <div className="map-stat-input-group">
                <div
                  className="map-stat-label-wrapper"
                  onClick={() => toggleAndFlag("currency")}
                >
                  <span
                    className={`logic-badge ${
                      andFlags.currency ? "and" : "or"
                    }`}
                  >
                    {andFlags.currency ? "AND" : "OR"}
                  </span>
                  <span className="map-stat-name">화폐</span>
                </div>
                <input
                  className="map-stat-input"
                  type="number"
                  placeholder="0"
                  value={mapStats.currency}
                  onChange={(e) =>
                    setMapStats({ ...mapStats, currency: e.target.value })
                  }
                  onWheel={(e) => handleWheel(e, "currency")}
                />
              </div>
              <div className="map-stat-input-group">
                <div
                  className="map-stat-label-wrapper"
                  onClick={() => toggleAndFlag("maps")}
                >
                  <span
                    className={`logic-badge ${andFlags.maps ? "and" : "or"}`}
                  >
                    {andFlags.maps ? "AND" : "OR"}
                  </span>
                  <span className="map-stat-name">지도</span>
                </div>
                <input
                  className="map-stat-input"
                  type="number"
                  placeholder="0"
                  value={mapStats.maps}
                  onChange={(e) =>
                    setMapStats({ ...mapStats, maps: e.target.value })
                  }
                  onWheel={(e) => handleWheel(e, "maps")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div
          className={`page-layout maps-page ${adminMode ? "admin-mode" : ""}`}
        >
          {/* 빌더 콘텐츠 */}
          <div className="builder-content">
            {/* 옵션 선택 영역 */}
            <div className="options-container">
              <div className="layout">
                <div className="card">
                  <div className="section-title">접두 옵션</div>
                  <div id="prefixList" className="list" {...prefixScroll}>
                    {prefixData.map((opt) => (
                      <OptionItem
                        key={opt.id}
                        opt={opt}
                        listId="prefixList"
                        selected={selected}
                        toggleOption={toggleOption}
                        handleDragStart={handleOptionDragStart}
                        adminMode={adminMode}
                        openModal={openModal}
                        deleteOption={deleteOption}
                        data={prefixData}
                        setData={setPrefixData}
                      />
                    ))}
                    {adminMode && (
                      <div
                        className="add-option"
                        onClick={() => openModal(null, "add", "prefixList")}
                      >
                        +
                      </div>
                    )}
                  </div>
                </div>
                <div className="card">
                  <div className="section-title">접미 옵션</div>
                  <div id="suffixList" className="list" {...suffixScroll}>
                    {suffixData.map((opt) => (
                      <OptionItem
                        key={opt.id}
                        opt={opt}
                        listId="suffixList"
                        selected={selected}
                        toggleOption={toggleOption}
                        handleDragStart={handleOptionDragStart}
                        adminMode={adminMode}
                        openModal={openModal}
                        deleteOption={deleteOption}
                        data={suffixData}
                        setData={setSuffixData}
                      />
                    ))}
                    {adminMode && (
                      <div
                        className="add-option"
                        onClick={() => openModal(null, "add", "suffixList")}
                      >
                        +
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 프리셋 추가 모달 (슬라이드 바) */}
      {presetModalVisible && (
        <div
          className="modal-bg"
          style={{ display: "flex", justifyContent: "center" }}
          onMouseDown={(e) => {
            if (e.target !== e.currentTarget) presetModalDown.current = true;
          }}
          onMouseUp={(e) => {
            if (e.target === e.currentTarget && !presetModalDown.current)
              setPresetModalVisible(false);
            presetModalDown.current = false;
          }}
        >
          <div
            className="modal preset-modal"
            onMouseDown={() => (presetModalDown.current = true)}
          >
            <div className="modal-title">
              {editingPreset ? "프리셋 이름 수정" : "프리셋 추가"}
            </div>
            <div className="modal-field">
              <span>이름</span>
              <input
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newPresetName.trim()) {
                    savePreset();
                  }
                }}
                placeholder="프리셋 이름을 입력하세요"
                autoFocus
                autoComplete="off"
              />
            </div>
            <button
              id="modalSave"
              onClick={savePreset}
              disabled={!newPresetName.trim()}
            >
              {editingPreset ? "수정" : "추가"}
            </button>
          </div>
        </div>
      )}

      {modalVisible && (
        <>
          <style>{`
            @keyframes slideInFromRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            @keyframes fadeInBg {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <div
            className="modal-bg"
            ref={modalBgRef}
            style={{
              display: "flex",
              animation: "fadeInBg 200ms ease-out forwards",
            }}
            onMouseDown={(e) => {
              if (e.target === modalBgRef.current) {
                modalDown.current = false;
              }
            }}
            onMouseUp={(e) => {
              if (e.target === modalBgRef.current && !modalDown.current) {
                setModalVisible(false);
              }
              modalDown.current = false;
            }}
          >
            <div
              className="modal"
              style={{
                animation:
                  "slideInFromRight 280ms cubic-bezier(0.25, 0.8, 0.25, 1) forwards",
              }}
              onMouseDown={() => {
                modalDown.current = true;
              }}
              onMouseUp={() => {
                modalDown.current = false;
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-title">
                {modalMode === "add" ? "CREATE" : "EDIT"}
              </div>

              <div className="modal-field">
                <span>옵션</span>
                <input
                  value={modalData.optionText}
                  onChange={(e) =>
                    setModalData({ ...modalData, optionText: e.target.value })
                  }
                  placeholder="옵션의 이름을 입력하세요"
                  autoComplete="off"
                />
              </div>

              <div className="modal-field">
                <span>필터 정규식</span>
                <input
                  value={modalData.filterRegex}
                  onChange={(e) =>
                    setModalData({ ...modalData, filterRegex: e.target.value })
                  }
                  placeholder="기본 정규식을 입력하세요"
                  autoComplete="off"
                />
              </div>

              <div className="modal-field">
                <span>유형</span>
                <div className="type-select">
                  {["Top", "Uber"].map((type) => (
                    <button
                      key={type}
                      className={`type-btn type-${type} ${
                        modalData.types.includes(type) ? "active" : ""
                      }`}
                      onClick={() => toggleType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="modalSave"
                onClick={handleModalSave}
                disabled={
                  !modalData.optionText ||
                  !modalData.filterRegex ||
                  modalData.types.length === 0
                }
              >
                {!modalData.optionText ||
                !modalData.filterRegex ||
                modalData.types.length === 0
                  ? "모든 항목을 입력해주세요"
                  : modalMode === "add"
                  ? "추가"
                  : "저장"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
