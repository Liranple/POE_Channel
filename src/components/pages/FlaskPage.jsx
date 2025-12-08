"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import useDraggableScroll from "../../hooks/useDraggableScroll";
import usePreset from "../../hooks/usePreset";
import useDragHandler from "../../hooks/useDragHandler";
import useOptionData from "../../hooks/useOptionData";
import { STORAGE_KEYS, TAG_ORDER } from "../../config/constants";

import { DEFAULT_PREFIX_DATA, DEFAULT_SUFFIX_DATA } from "../../data/FlaskData";
import OptionItem from "../OptionItem";
import PresetItem from "../PresetItem";

/**
 * 플라스크 정규식 빌더 페이지
 *
 * 데이터 구조:
 * - prefixData/suffixData: 기본 데이터 + 사용자 변경분 (localStorage에 변경분만 저장)
 * - presets: 로컬 스토리지에 저장되는 사용자 프리셋 (개인 설정)
 * - selected: 현재 선택된 옵션들 (임시 상태)
 */
export default function FlaskPage() {
  const [adminMode, setAdminMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // 옵션 데이터 관리 (버전 관리 + 변경분 저장)
  const {
    prefixData,
    suffixData,
    setPrefixData,
    setSuffixData,
    isInitialized,
  } = useOptionData("flask", DEFAULT_PREFIX_DATA, DEFAULT_SUFFIX_DATA);

  // 커스텀 훅 사용
  const {
    presets,
    setPresets,
    presetModalVisible,
    newPresetName,
    setNewPresetName,
    showPresetWarning,
    editingPreset,
    openPresetModal,
    savePreset,
    handleLoadPreset,
    handleDeletePreset,
    handleEditPreset,
    openEditPresetModal,
    savePresetsToStorage,
    closePresetModal,
  } = usePreset(STORAGE_KEYS.FLASK_PRESETS, setSelected, selected);

  const { handleOptionDragStart, handlePresetDragStart } =
    useDragHandler(adminMode);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [modalListId, setModalListId] = useState(null);
  const [currentEditOption, setCurrentEditOption] = useState(null);

  const [modalData, setModalData] = useState({
    optionText: "",
    filterRegex: "",
    maxRollRegex: "",
    itemLevel: "",
    types: [],
  });

  const modalBgRef = useRef(null);
  const modalDown = useRef(false);
  const presetModalDown = useRef(false);

  const toggleOption = useCallback((opt) => {
    const normalRegex = opt.filterRegex;
    const maxRegex = opt.maxRollRegex;

    setSelected((prevSelected) => {
      // 일반 정규식과 맥롤 정규식이 같으면 단순 토글 (Normal <-> Off)
      if (normalRegex === maxRegex) {
        if (prevSelected.includes(normalRegex)) {
          return prevSelected.filter((t) => t !== normalRegex);
        } else {
          return [...prevSelected, normalRegex];
        }
      }

      const isNormalSelected = prevSelected.includes(normalRegex);
      const isMaxSelected = prevSelected.includes(maxRegex);

      let newSelected = prevSelected.filter(
        (t) => t !== normalRegex && t !== maxRegex
      );

      if (isNormalSelected) {
        // Normal -> Max (if available) -> Off
        if (maxRegex) {
          newSelected.push(maxRegex);
        }
        // If no maxRegex, it goes to Off (already filtered out)
      } else if (isMaxSelected) {
        // Max -> Off
        // Already filtered out
      } else {
        // Off -> Normal
        newSelected.push(normalRegex);
      }

      return newSelected;
    });
  }, []);

  const resultText = useMemo(() => {
    // selected 배열 자체가 이미 올바른 정규식들을 담고 있음
    // 순서를 보장하기 위해 prefix/suffix 데이터 순서대로 정렬
    const allData = [...prefixData, ...suffixData];
    const sortedTags = [];

    // 데이터 순서대로 순회하며 selected에 있는지 확인
    allData.forEach((opt) => {
      if (selected.includes(opt.filterRegex)) {
        sortedTags.push(opt.filterRegex);
      } else if (selected.includes(opt.maxRollRegex)) {
        sortedTags.push(opt.maxRollRegex);
      }
    });

    return sortedTags.join("|");
  }, [selected, prefixData, suffixData]);

  const handleCopy = useCallback(() => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText).then(() => {
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    });
  }, [resultText]);

  const handleClear = useCallback(() => {
    setSelected([]);
  }, []);

  const itemRequirement = useMemo(() => {
    if (selected.length === 0) {
      return { text: "필요한 아이템 조건이 여기 표시됩니다", isError: false };
    }

    const allData = [...prefixData, ...suffixData];
    const selectedOptions = selected
      .map((tag) =>
        allData.find((o) => o.filterRegex === tag || o.maxRollRegex === tag)
      )
      .filter(Boolean);

    // 최대 레벨 찾기
    const maxLevel = Math.max(
      ...selectedOptions.map((opt) => parseInt(opt.itemLevel) || 0)
    );

    // 각 옵션별 유형 배열 (교집합 확인용)
    const optionTypeSets = selectedOptions.map((opt) =>
      opt.type
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    );

    // 모든 유형 수집 (중복 제거)
    const allUniqueTypes = [...new Set(optionTypeSets.flat())];

    // 모든 옵션에 공통으로 포함된 유형 찾기 (중복 없이)
    const commonTypes = allUniqueTypes.filter((type) =>
      optionTypeSets.every((typeSet) => typeSet.includes(type))
    );

    // 유형 검증
    if (selectedOptions.length > 1 && commonTypes.length === 0) {
      return { text: "아이템 유형이 잘못 되었습니다", isError: true };
    }

    // 플라스크 이름 매핑
    const typeNames = {
      생명력: "생명력",
      마나: "마나",
      특수: "특수",
      팅크: "팅크",
    };

    // 공통 유형을 한글 이름으로 변환 (이미 중복 제거됨)
    const flaskNames = commonTypes
      .map((type) => typeNames[type] || type)
      .filter(Boolean);

    // 결과 문구 생성
    let flaskText = "";
    if (flaskNames.length === 0) {
      flaskText = "플라스크";
    } else if (flaskNames.length === 1) {
      // 팅크는 "팅크"로만 표시
      flaskText =
        flaskNames[0] === "팅크" ? "팅크" : `${flaskNames[0]} 플라스크`;
    } else {
      // 여러 유형인 경우
      // 팅크가 포함되어 있는지 확인
      if (flaskNames.includes("팅크")) {
        // 팅크가 아닌 플라스크들
        const nonTincture = flaskNames.filter((n) => n !== "팅크");
        if (nonTincture.length > 0) {
          flaskText = nonTincture.join(" · ") + " 플라스크 혹은 팅크";
        } else {
          flaskText = "팅크";
        }
      } else {
        // 팅크가 없는 경우
        flaskText = flaskNames.join(" · ") + " 플라스크";
      }
    }

    const levelText = maxLevel > 0 ? `아이템 레벨 ${maxLevel} 이상의 ` : "";
    return {
      text: `${levelText}${flaskText}가 필요합니다`,
      isError: false,
    };
  }, [selected, prefixData, suffixData]);

  const deleteOption = useCallback((opt, data, setData, listId) => {
    const idx = data.indexOf(opt);
    if (idx > -1) {
      const newData = [...data];
      newData.splice(idx, 1);
      setData(newData);
      setSelected((prev) => prev.filter((t) => t !== opt.filterRegex));
    }
  }, []);

  const openModal = useCallback((opt, mode, listId) => {
    setModalMode(mode);
    setModalListId(listId);
    setCurrentEditOption(opt);

    if (mode === "edit" && opt) {
      setModalData({
        optionText: opt.optionText,
        filterRegex: opt.filterRegex,
        maxRollRegex: opt.maxRollRegex,
        itemLevel: opt.itemLevel,
        types: opt.type
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } else {
      setModalData({
        optionText: "",
        filterRegex: "",
        maxRollRegex: "",
        itemLevel: "",
        types: [],
      });
    }

    setModalVisible(true);
  }, []);

  const handleModalSave = useCallback(() => {
    const { optionText, filterRegex, maxRollRegex, itemLevel, types } =
      modalData;

    // 유형 정렬: 생명력(HP) → 마나(MP) → 특수(SP) → 팅크(TK) 순서
    const typeOrder = ["생명력", "마나", "특수", "팅크"];
    const sortedTypes = types.sort((a, b) => {
      return typeOrder.indexOf(a) - typeOrder.indexOf(b);
    });
    const type = sortedTypes.join(",");

    if (modalMode === "edit" && currentEditOption) {
      const updateData = (data, setData) => {
        const newData = data.map((item) => {
          if (item === currentEditOption) {
            return {
              ...item,
              optionText: optionText,
              filterRegex: filterRegex,
              maxRollRegex: maxRollRegex,
              itemLevel: itemLevel,
              type: type,
            };
          }
          return item;
        });
        setData(newData);
      };

      if (modalListId === "prefixList") {
        updateData(prefixData, setPrefixData);
      } else {
        updateData(suffixData, setSuffixData);
      }
    } else if (modalMode === "add") {
      const arr = modalListId === "prefixList" ? prefixData : suffixData;
      const setArr =
        modalListId === "prefixList" ? setPrefixData : setSuffixData;
      // ID는 각 배열 내에서 유일하면 됨 (기존 100단위 구분 제거)
      const maxId = arr.reduce((m, o) => Math.max(m, o.id), 0);
      const affix = modalListId === "prefixList" ? "prefix" : "suffix";

      setArr([
        ...arr,
        {
          id: maxId + 1,
          affix: affix,
          optionText: optionText || "새 옵션",
          filterRegex: filterRegex || "tag" + (maxId + 1),
          maxRollRegex: maxRollRegex,
          itemLevel: itemLevel,
          type: type,
        },
      ]);
    }

    setModalVisible(false);
  }, [
    modalData,
    modalMode,
    currentEditOption,
    modalListId,
    prefixData,
    suffixData,
  ]);

  const toggleTypeButton = useCallback((type) => {
    setModalData((prev) => {
      const types = prev.types;
      if (types.includes(type)) {
        return { ...prev, types: types.filter((t) => t !== type) };
      } else {
        return { ...prev, types: [...types, type] };
      }
    });
  }, []);

  // 프리셋 드래그 핸들러를 위한 wrapper 함수
  const onPresetDragStart = useCallback(
    (e, index) => {
      handlePresetDragStart(e, index, presets, (newPresets) => {
        setPresets(newPresets);
        savePresetsToStorage(newPresets);
      });
    },
    [presets, handlePresetDragStart, setPresets, savePresetsToStorage]
  );

  // 드래그 스크롤 관련
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
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const prefixScroll = useDraggableScroll(!adminMode);
  const suffixScroll = useDraggableScroll(!adminMode);

  return (
    <div className="flask-page-wrapper">
      <div className="sticky-top-area">
        <div className="wrap" style={{ paddingBottom: 0 }}>
          <header>
            <h1>플라스크 정규식 빌더</h1>
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
          <div className="preset-bar-container">
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
                      onDragStart={onPresetDragStart}
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
              {selected.length > 0 && (
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
            <div
              className="info-text-row"
              style={{
                color:
                  selected.length === 0
                    ? "#7a8a9a"
                    : itemRequirement.isError
                    ? "#ff6262"
                    : "var(--accent)",
              }}
            >
              {itemRequirement.text}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div
          className={`page-layout flask-page ${adminMode ? "admin-mode" : ""}`}
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
              closePresetModal();
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

      {/* 모달 */}
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
            >
              <div className="modal-title" id="modalTitle">
                {modalMode === "edit" ? "EDIT" : "CREATE"}
              </div>

              <div className="modal-field">
                <span>옵션</span>
                <input
                  id="modalOptionText"
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
                  id="modalFilterRegex"
                  value={modalData.filterRegex}
                  onChange={(e) =>
                    setModalData({ ...modalData, filterRegex: e.target.value })
                  }
                  placeholder="기본 정규식을 입력하세요"
                  autoComplete="off"
                />
              </div>

              <div className="modal-field">
                <span>필터 정규식 (Max roll)</span>
                <input
                  id="modalMaxRollRegex"
                  value={modalData.maxRollRegex}
                  onChange={(e) =>
                    setModalData({ ...modalData, maxRollRegex: e.target.value })
                  }
                  placeholder="Max roll 정규식을 입력하세요"
                  autoComplete="off"
                />
              </div>

              <div className="modal-field">
                <span>아이템 레벨</span>
                <input
                  id="modalItemLevel"
                  value={modalData.itemLevel}
                  onChange={(e) =>
                    setModalData({ ...modalData, itemLevel: e.target.value })
                  }
                  placeholder="아이템 레벨을 입력하세요"
                  autoComplete="off"
                />
              </div>

              <div className="modal-field">
                <span>유형</span>
                <div className="type-select">
                  {["생명력", "마나", "특수", "팅크"].map((type) => (
                    <button
                      key={type}
                      className={`type-btn type-${
                        type === "생명력"
                          ? "life"
                          : type === "마나"
                          ? "mana"
                          : type === "특수"
                          ? "special"
                          : "tincture"
                      } ${modalData.types.includes(type) ? "active" : ""}`}
                      data-type={type}
                      onClick={() => toggleTypeButton(type)}
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
                  !modalData.itemLevel ||
                  modalData.types.length === 0
                }
              >
                {!modalData.optionText ||
                !modalData.filterRegex ||
                !modalData.itemLevel ||
                modalData.types.length === 0
                  ? "모든 항목을 입력해주세요"
                  : modalMode === "edit"
                  ? "저장"
                  : "추가"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
