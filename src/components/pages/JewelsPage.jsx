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
import "../../styles/JewelsPage.css";

export default function JewelsPage() {
  const [adminMode, setAdminMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [prefixData, setPrefixData] = useState(DEFAULT_PREFIX_DATA);
  const [suffixData, setSuffixData] = useState(DEFAULT_SUFFIX_DATA);
  const [corruptedData, setCorruptedData] = useState(DEFAULT_CORRUPTED_DATA);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [presets, setPresets] = useState([]);

  // 프리셋 추가 모달 상태
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [showPresetWarning, setShowPresetWarning] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [modalListId, setModalListId] = useState(null);
  const [currentEditOption, setCurrentEditOption] = useState(null);

  // 프리셋 수정용 상태 추가
  const [editingPreset, setEditingPreset] = useState(null);

  const [modalData, setModalData] = useState({
    optionText: "",
    filterRegex: "",
    types: [],
  });

  const modalBgRef = useRef(null);
  const modalDown = useRef(false);

  // 로컬 스토리지에서 프리셋 로드
  useEffect(() => {
    const loadPresets = () => {
      const savedPresets = localStorage.getItem("jewelPresets");
      if (savedPresets) {
        try {
          const parsed = JSON.parse(savedPresets);
          const migrated = parsed.map((p) =>
            p.id ? p : { ...p, id: Date.now() + Math.random() }
          );
          setPresets(migrated);
        } catch (e) {
          console.error("Failed to load presets", e);
        }
      }
    };
    loadPresets();
  }, []);

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

  const openPresetModal = useCallback(() => {
    if (selected.length === 0) {
      setShowPresetWarning(true);
      setTimeout(() => setShowPresetWarning(false), 2000);
      return;
    }
    setEditingPreset(null);
    setNewPresetName("");
    setPresetModalVisible(true);
  }, [selected]);

  const openEditPresetModal = useCallback((preset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setPresetModalVisible(true);
  }, []);

  const savePreset = useCallback(() => {
    if (!newPresetName.trim()) return;

    if (editingPreset) {
      const newPresets = presets.map((p) =>
        p.id === editingPreset.id ? { ...p, name: newPresetName } : p
      );
      setPresets(newPresets);
      localStorage.setItem("jewelPresets", JSON.stringify(newPresets));
    } else {
      const newPresets = [
        ...presets,
        { id: Date.now(), name: newPresetName, selected },
      ];
      setPresets(newPresets);
      localStorage.setItem("jewelPresets", JSON.stringify(newPresets));
    }
    setPresetModalVisible(false);
  }, [presets, selected, newPresetName, editingPreset]);

  const handleLoadPreset = useCallback((preset) => {
    setSelected(preset.selected);
  }, []);

  const handleDeletePreset = useCallback((preset) => {
    setPresets((prev) => {
      const newPresets = prev.filter((p) => p.id !== preset.id);
      localStorage.setItem("jewelPresets", JSON.stringify(newPresets));
      return newPresets;
    });
  }, []);

  const handleEditPreset = useCallback(
    (preset) => {
      openEditPresetModal(preset);
    },
    [openEditPresetModal]
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

  const handleDragStart = useCallback(
    (e, opt, listId, data, setData) => {
      if (!adminMode) return;

      const isTouch = e.type === "touchstart";
      if (!isTouch && e.button !== 0) return;
      if (e.target.closest("button")) return;

      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;

      const listEl = document.getElementById(listId);
      if (!listEl) return;

      const div = e.currentTarget;
      const rect = div.getBoundingClientRect();

      if (isTouch) {
        document.body.style.overflow = "hidden";
      }

      const placeholder = document.createElement("div");
      placeholder.className = "option";
      placeholder.style.visibility = "hidden";
      placeholder.style.height = rect.height + "px";
      listEl.insertBefore(placeholder, div.nextSibling);

      div.classList.add("dragging");
      document.body.classList.add("dragging-active");
      div.style.position = "fixed";
      div.style.width = rect.width + "px";
      div.style.left = rect.left + "px";
      div.style.top = rect.top + "px";
      div.style.zIndex = "9999";
      div.style.pointerEvents = "none";
      div.style.willChange = "transform";
      document.body.appendChild(div);

      let isDragging = true;
      let animationId = null;

      const initialTop = rect.top;
      const initialMouseY = clientY;
      const initialMouseX = clientX;

      let needsPlaceholderUpdate = false;
      let currentMouseY = clientY;

      const updatePlaceholder = () => {
        if (!isDragging) return;

        if (needsPlaceholderUpdate) {
          needsPlaceholderUpdate = false;

          const items = [...listEl.children].filter(
            (el) =>
              el.classList.contains("option") &&
              el !== placeholder &&
              el !== div
          );

          const deltaY = currentMouseY - initialMouseY;
          const currentAbsY = initialTop + deltaY + rect.height / 2;

          let insertBefore = null;
          for (const item of items) {
            const itemRect = item.getBoundingClientRect();
            const itemMid = itemRect.top + itemRect.height / 2;
            if (currentAbsY < itemMid) {
              insertBefore = item;
              break;
            }
          }

          const performMove = (target) => {
            if (placeholder.nextSibling === target) return;

            const positions = new Map();
            items.forEach((item) => {
              const rect = item.getBoundingClientRect();
              positions.set(item, rect.top);
            });

            listEl.insertBefore(placeholder, target);

            items.forEach((item) => {
              const oldTop = positions.get(item);
              const newTop = item.getBoundingClientRect().top;

              if (oldTop !== newTop) {
                item.animate(
                  [
                    { transform: `translateY(${oldTop - newTop}px)` },
                    { transform: "translateY(0)" },
                  ],
                  {
                    duration: 300,
                    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
                  }
                );
              }
            });
          };

          if (insertBefore) {
            performMove(insertBefore);
          } else {
            const addBtn = listEl.querySelector(".add-option");
            const targetNode = addBtn || null;
            performMove(targetNode);
          }
        }

        animationId = requestAnimationFrame(updatePlaceholder);
      };

      const handleMove = (ev) => {
        if (!isDragging) return;

        const cx = ev.type === "touchmove" ? ev.touches[0].clientX : ev.clientX;
        const cy = ev.type === "touchmove" ? ev.touches[0].clientY : ev.clientY;

        const deltaX = cx - initialMouseX;
        const deltaY = cy - initialMouseY;

        div.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;

        currentMouseY = cy;
        needsPlaceholderUpdate = true;
      };

      const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        if (animationId) cancelAnimationFrame(animationId);

        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);

        document.body.style.overflow = "";

        div.classList.remove("dragging");
        document.body.classList.remove("dragging-active");
        div.style.position = "";
        div.style.left = "";
        div.style.top = "";
        div.style.width = "";
        div.style.zIndex = "";
        div.style.pointerEvents = "";
        div.style.transform = "";
        div.style.willChange = "";

        listEl.insertBefore(div, placeholder);
        placeholder.remove();

        const newOrder = [];

        listEl.querySelectorAll(".option").forEach((el) => {
          const id = parseInt(el.dataset.id, 10);
          const foundOpt = data.find((o) => o.id === id);
          if (foundOpt) newOrder.push(foundOpt);
        });

        setData(newOrder);
      };

      document.addEventListener("mousemove", handleMove, { passive: true });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);

      animationId = requestAnimationFrame(updatePlaceholder);
    },
    [adminMode]
  );

  const handlePresetDragStart = useCallback(
    (e, index) => {
      if (!adminMode) return;

      const isTouch = e.type === "touchstart";
      if (!isTouch && e.button !== 0) return;

      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;

      const div = e.currentTarget;
      const listEl = div.parentElement;
      const rect = div.getBoundingClientRect();

      if (isTouch) {
        document.body.style.overflow = "hidden";
      }

      const placeholder = document.createElement("div");
      placeholder.className = "preset-item placeholder";
      placeholder.style.width = rect.width + "px";
      placeholder.style.height = rect.height + "px";
      placeholder.style.flexShrink = "0";
      placeholder.style.visibility = "hidden";

      listEl.insertBefore(placeholder, div.nextSibling);

      div.classList.add("dragging");
      document.body.classList.add("dragging-active");
      div.style.position = "fixed";
      div.style.width = rect.width + "px";
      div.style.height = rect.height + "px";
      div.style.left = rect.left + "px";
      div.style.top = rect.top + "px";
      div.style.zIndex = "9999";
      div.style.pointerEvents = "none";
      div.style.willChange = "transform";
      document.body.appendChild(div);

      let isDragging = true;
      let animationId = null;

      const initialLeft = rect.left;
      const initialMouseX = clientX;
      const initialMouseY = clientY;

      let needsPlaceholderUpdate = false;
      let currentMouseX = clientX;

      const updatePlaceholder = () => {
        if (!isDragging) return;

        if (needsPlaceholderUpdate) {
          needsPlaceholderUpdate = false;

          const items = [...listEl.children].filter(
            (el) =>
              el !== placeholder &&
              el !== div &&
              el.classList.contains("preset-item")
          );

          const deltaX = currentMouseX - initialMouseX;
          const currentAbsX = initialLeft + deltaX + rect.width / 2;

          let insertBefore = null;
          for (const item of items) {
            const itemRect = item.getBoundingClientRect();
            const itemMid = itemRect.left + itemRect.width / 2;
            if (currentAbsX < itemMid) {
              insertBefore = item;
              break;
            }
          }

          const performMove = (target) => {
            if (placeholder.nextSibling === target) return;

            const positions = new Map();
            items.forEach((item) => {
              positions.set(item, item.getBoundingClientRect().left);
            });

            listEl.insertBefore(placeholder, target);

            items.forEach((item) => {
              const oldLeft = positions.get(item);
              const newLeft = item.getBoundingClientRect().left;

              if (oldLeft !== newLeft) {
                item.animate(
                  [
                    { transform: `translateX(${oldLeft - newLeft}px)` },
                    { transform: "translateX(0)" },
                  ],
                  {
                    duration: 300,
                    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
                  }
                );
              }
            });
          };

          if (insertBefore) {
            performMove(insertBefore);
          } else {
            const addBtn = listEl.querySelector(".add-preset-chip");
            performMove(addBtn);
          }
        }
        animationId = requestAnimationFrame(updatePlaceholder);
      };

      const handleMove = (ev) => {
        if (!isDragging) return;

        const cx = ev.type === "touchmove" ? ev.touches[0].clientX : ev.clientX;
        const cy = ev.type === "touchmove" ? ev.touches[0].clientY : e.clientY;

        const deltaX = cx - initialMouseX;
        const deltaY = cy - initialMouseY;

        div.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
        currentMouseX = cx;
        needsPlaceholderUpdate = true;
      };

      const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        if (animationId) cancelAnimationFrame(animationId);

        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);

        document.body.style.overflow = "";

        div.classList.remove("dragging");
        document.body.classList.remove("dragging-active");
        div.style.position = "";
        div.style.width = "";
        div.style.height = "";
        div.style.left = "";
        div.style.top = "";
        div.style.zIndex = "";
        div.style.pointerEvents = "";
        div.style.transform = "";
        div.style.willChange = "";

        listEl.insertBefore(div, placeholder);
        placeholder.remove();

        const newPresets = [];
        listEl.querySelectorAll(".preset-item").forEach((el) => {
          const idx = parseInt(el.dataset.index, 10);
          if (!isNaN(idx) && presets[idx]) {
            newPresets.push(presets[idx]);
          }
        });

        if (newPresets.length === presets.length) {
          setPresets(newPresets);
          localStorage.setItem("jewelPresets", JSON.stringify(newPresets));
        }
      };

      document.addEventListener("mousemove", handleMove, { passive: true });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);

      animationId = requestAnimationFrame(updatePlaceholder);
    },
    [adminMode, presets]
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

  // const prefixScroll = useDraggableScroll(!adminMode);
  // const suffixScroll = useDraggableScroll(!adminMode);
  // const corruptedScroll = useDraggableScroll(!adminMode);

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
          <div
            className="preset-bar-container"
            style={{ position: "relative" }}
          >
            {showPresetWarning && (
              <div className="preset-warning-toast">
                저장할 옵션이 선택되지 않았습니다
              </div>
            )}
            <div className="preset-label">PRESETS</div>
            <div
              className="preset-scroll-area"
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              {presets.length === 0 ? (
                <span className="no-preset-msg">저장된 프리셋이 없습니다</span>
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
            <button className="add-preset-chip" onClick={openPresetModal}>
              <span>+ New</span>
            </button>
          </div>

          <div className="card result-card" style={{ marginBottom: 0 }}>
            <div className="result-input-wrapper" onClick={handleCopy}>
              <input
                id="result"
                className="search-box"
                readOnly
                placeholder="선택한 옵션 정규식이 여기 표시됩니다"
                value={resultText}
              />
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
              {showCopyToast && (
                <div className="copy-toast">복사되었습니다!</div>
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
                    handleDragStart={handleDragStart}
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
                        handleDragStart={handleDragStart}
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
                        handleDragStart={handleDragStart}
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
            if (e.target === e.currentTarget) setPresetModalVisible(false);
          }}
        >
          <div className="modal preset-modal">
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
        <div
          className="modal-bg"
          ref={modalBgRef}
          style={{ display: "flex" }}
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
      )}
    </div>
  );
}
