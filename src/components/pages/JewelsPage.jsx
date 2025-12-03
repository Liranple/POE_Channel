"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

import {
  DEFAULT_PREFIX_DATA,
  DEFAULT_SUFFIX_DATA,
  DEFAULT_CORRUPTED_DATA,
  JEWEL_TYPES,
} from "../../data/JewelData";
import OptionItem from "../OptionItem";
import PresetItem from "../PresetItem";
import useDraggableScroll from "../../hooks/useDraggableScroll";
import usePreset from "../../hooks/usePreset";
import useDragHandler from "../../hooks/useDragHandler";
import { STORAGE_KEYS } from "../../constants";
import "../../styles/JewelsPage.css";

/**
 * 주얼 정규식 빌더 페이지
 *
 * 데이터 구조:
 * - prefixData/suffixData/corruptedData: 앱 내장 데이터
 * - presets: 로컬 스토리지에 저장되는 사용자 프리셋 (개인 설정)
 * - selected: 현재 선택된 옵션들 (임시 상태)
 */
export default function JewelsPage() {
  const [adminMode, setAdminMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [prefixData, setPrefixData] = useState(DEFAULT_PREFIX_DATA);
  const [suffixData, setSuffixData] = useState(DEFAULT_SUFFIX_DATA);
  const [corruptedData, setCorruptedData] = useState(DEFAULT_CORRUPTED_DATA);
  const [showCopyToast, setShowCopyToast] = useState(false);

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
  } = usePreset(STORAGE_KEYS.JEWEL_PRESETS, setSelected, selected);

  const { handleOptionDragStart, handlePresetDragStart } =
    useDragHandler(adminMode);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [modalListId, setModalListId] = useState(null);
  const [currentEditOption, setCurrentEditOption] = useState(null);

  const [modalData, setModalData] = useState({
    optionText: "",
    filterRegex: "",
    types: [],
  });

  const modalBgRef = useRef(null);
  const modalDown = useRef(false);
  const presetModalDown = useRef(false);

  const toggleOption = useCallback((opt) => {
    const normalRegex = opt.filterRegex;

    setSelected((prevSelected) => {
      if (prevSelected.includes(normalRegex)) {
        return prevSelected.filter((t) => t !== normalRegex);
      } else {
        return [...prevSelected, normalRegex];
      }
    });
  }, []);

  const resultText = useMemo(() => {
    const allData = [...prefixData, ...suffixData, ...corruptedData];
    const sortedTags = [];

    allData.forEach((opt) => {
      if (selected.includes(opt.filterRegex)) {
        sortedTags.push(opt.filterRegex);
      }
    });

    return sortedTags.join("|");
  }, [selected, prefixData, suffixData, corruptedData]);

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

  // 프리셋 드래그 핸들러 wrapper
  const onPresetDragStart = useCallback(
    (e, index) => {
      handlePresetDragStart(e, index, presets, (newPresets) => {
        setPresets(newPresets);
        savePresetsToStorage(newPresets);
      });
    },
    [presets, handlePresetDragStart, setPresets, savePresetsToStorage]
  );

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
        types: opt.type
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
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

  const handleModalSave = useCallback(() => {
    const { optionText, filterRegex, types } = modalData;

    // 유형 정렬 (JEWEL_TYPES 순서대로)
    const typeOrder = JEWEL_TYPES.map((t) => t.id);
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
              type: type,
            };
          }
          return item;
        });
        setData(newData);
      };

      if (modalListId === "prefixList") {
        updateData(prefixData, setPrefixData);
      } else if (modalListId === "suffixList") {
        updateData(suffixData, setSuffixData);
      } else {
        updateData(corruptedData, setCorruptedData);
      }
    } else if (modalMode === "add") {
      let arr, setArr, affix;
      if (modalListId === "prefixList") {
        arr = prefixData;
        setArr = setPrefixData;
        affix = "prefix";
      } else if (modalListId === "suffixList") {
        arr = suffixData;
        setArr = setSuffixData;
        affix = "suffix";
      } else {
        arr = corruptedData;
        setArr = setCorruptedData;
        affix = "corrupted";
      }

      const maxId = arr.reduce((m, o) => Math.max(m, o.id), 0);

      setArr([
        ...arr,
        {
          id: maxId + 1,
          affix: affix,
          optionText: optionText || "새 옵션",
          filterRegex: filterRegex || "tag" + (maxId + 1),
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
    corruptedData,
  ]);

  const toggleTypeButton = useCallback(
    (type) => {
      const types = modalData.types;
      if (types.includes(type)) {
        setModalData({ ...modalData, types: types.filter((t) => t !== type) });
      } else {
        setModalData({ ...modalData, types: [...types, type] });
      }
    },
    [modalData]
  );

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

  return (
    <div className="jewels-page-wrapper">
      <div className="sticky-top-area">
        <div className="wrap" style={{ paddingBottom: 0 }}>
          <header>
            <h1>주얼 정규식 빌더</h1>
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
          </div>
        </div>
      </div>

      <div className="wrap">
        <div
          className={`page-layout jewels-page ${adminMode ? "admin-mode" : ""}`}
        >
          <div className="builder-content">
            {/* 타락 옵션 영역 */}
            <div className="card corrupted-section">
              <div className="section-title">타락 옵션</div>
              <div id="corruptedList" className="list">
                {corruptedData.map((opt) => (
                  <OptionItem
                    key={opt.id}
                    opt={opt}
                    listId="corruptedList"
                    selected={selected}
                    toggleOption={toggleOption}
                    handleDragStart={handleOptionDragStart}
                    adminMode={adminMode}
                    openModal={openModal}
                    deleteOption={deleteOption}
                    data={corruptedData}
                    setData={setCorruptedData}
                  />
                ))}
                {adminMode && (
                  <div
                    className="add-option"
                    onClick={() => openModal(null, "add", "corruptedList")}
                  >
                    +
                  </div>
                )}
              </div>
            </div>

            <div className="options-container">
              <div className="layout">
                <div className="card">
                  <div className="section-title">접두 옵션</div>
                  <div id="prefixList" className="list">
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
                  <div id="suffixList" className="list">
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
                <span>유형</span>
                <div className="type-select">
                  {JEWEL_TYPES.map((type) => (
                    <button
                      key={type.id}
                      className={`type-btn type-${type.id} ${
                        modalData.types.includes(type.id) ? "active" : ""
                      }`}
                      data-type={type.id}
                      onClick={() => toggleTypeButton(type.id)}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "4px",
                      }}
                    >
                      <img
                        src={type.img}
                        alt={type.id}
                        style={{
                          width: "32px",
                          height: "32px",
                          display: "block",
                        }}
                      />
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
