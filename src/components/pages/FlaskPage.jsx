"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

import { DEFAULT_PREFIX_DATA, DEFAULT_SUFFIX_DATA } from "../TagBuilderStash";
import OptionItem from "../OptionItem";
import PresetItem from "../PresetItem";

export default function FlaskPage() {
  const [adminMode, setAdminMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [prefixData, setPrefixData] = useState(DEFAULT_PREFIX_DATA);
  const [suffixData, setSuffixData] = useState(DEFAULT_SUFFIX_DATA);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [presets, setPresets] = useState([]);

  // 프리셋 추가 모달 상태
  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

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

  // 로컬 스토리지에서 프리셋 로드
  useEffect(() => {
    const loadPresets = () => {
      const savedPresets = localStorage.getItem("flaskPresets");
      if (savedPresets) {
        try {
          const parsed = JSON.parse(savedPresets);
          setPresets(parsed);
        } catch (e) {
          console.error("Failed to load presets", e);
        }
      }
    };
    loadPresets();
  }, []);

  const toggleOption = useCallback(
    (opt) => {
      const normalRegex = opt.filterRegex;
      const maxRegex = opt.maxRollRegex;

      // 일반 정규식과 맥롤 정규식이 같으면 단순 토글 (Normal <-> Off)
      if (normalRegex === maxRegex) {
        if (selected.includes(normalRegex)) {
          setSelected(selected.filter((t) => t !== normalRegex));
        } else {
          setSelected([...selected, normalRegex]);
        }
        return;
      }

      const isNormalSelected = selected.includes(normalRegex);
      const isMaxSelected = selected.includes(maxRegex);

      let newSelected = selected.filter(
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

      setSelected(newSelected);
    },
    [selected]
  );

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

  const openPresetModal = useCallback(() => {
    if (selected.length === 0) {
      alert("저장할 옵션이 선택되지 않았습니다.");
      return;
    }
    setNewPresetName("");
    setPresetModalVisible(true);
  }, [selected]);

  const savePreset = useCallback(() => {
    if (!newPresetName.trim()) return;

    const newPresets = [...presets, { name: newPresetName, selected }];
    setPresets(newPresets);
    localStorage.setItem("flaskPresets", JSON.stringify(newPresets));
    setPresetModalVisible(false);
  }, [presets, selected, newPresetName]);

  const handleLoadPreset = useCallback((presetSelected) => {
    setSelected(presetSelected);
  }, []);

  const handleDeletePreset = useCallback(
    (preset) => {
      const newPresets = presets.filter((p) => p !== preset);
      setPresets(newPresets);
      localStorage.setItem("flaskPresets", JSON.stringify(newPresets));
    },
    [presets]
  );

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

  const deleteOption = useCallback(
    (opt, data, setData, listId) => {
      const idx = data.indexOf(opt);
      if (idx > -1) {
        const newData = [...data];
        newData.splice(idx, 1);
        setData(newData);
        setSelected(selected.filter((t) => t !== opt.filterRegex));
      }
    },
    [selected]
  );

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
      const base = modalListId === "prefixList" ? 0 : 100;
      const maxId = arr.reduce((m, o) => Math.max(m, o.id), base);

      setArr([
        ...arr,
        {
          id: maxId + 1,
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

  // 커스텀 드래그 핸들러 (완벽한 실시간 추적 - 모바일 터치 지원)
  const handleDragStart = useCallback(
    (e, opt, listId, data, setData) => {
      if (!adminMode) return;

      // 이벤트 정규화 (마우스/터치)
      const isTouch = e.type === "touchstart";
      if (!isTouch && e.button !== 0) return;
      if (e.target.closest("button")) return;

      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      const clientY = isTouch ? e.touches[0].clientY : e.clientY;

      const listEl = document.getElementById(listId);
      if (!listEl) return;

      const div = e.currentTarget;
      const rect = div.getBoundingClientRect();

      // 터치 시 스크롤 방지
      if (isTouch) {
        document.body.style.overflow = "hidden";
      }

      // placeholder 생성
      const placeholder = document.createElement("div");
      placeholder.className = "option";
      placeholder.style.visibility = "hidden";
      placeholder.style.height = rect.height + "px";
      listEl.insertBefore(placeholder, div.nextSibling);

      // 드래그 중인 요소 스타일 설정 (GPU 가속 사용)
      div.classList.add("dragging");
      div.style.position = "fixed";
      div.style.width = rect.width + "px";
      div.style.left = rect.left + "px";
      div.style.top = rect.top + "px";
      div.style.zIndex = "9999";
      div.style.pointerEvents = "none"; // 드래그 중인 요소가 이벤트를 가로채지 않도록
      div.style.willChange = "transform";
      document.body.appendChild(div);

      let isDragging = true;
      let animationId = null;

      // 초기 위치 저장
      const initialLeft = rect.left;
      const initialTop = rect.top;
      const initialMouseX = clientX;
      const initialMouseY = clientY;

      // placeholder 업데이트 함수 (RAF로 최적화)
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

          // DOM 조작 최소화
          const performMove = (target) => {
            if (placeholder.nextSibling === target) return;

            // 1. 이동 전 위치 저장 (FLIP 애니메이션)
            const positions = new Map();
            items.forEach((item) => {
              const rect = item.getBoundingClientRect();
              positions.set(item, rect.top);
            });

            // 2. placeholder 이동
            listEl.insertBefore(placeholder, target);

            // 3. 이동한 아이템 애니메이션 적용
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
                    easing: "cubic-bezier(0.25, 1, 0.5, 1)", // 부드러운 감속
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

        // 터치 이벤트인 경우 preventDefault로 스크롤 방지 (passive: false 필요)
        if (ev.type === "touchmove") {
          // ev.preventDefault(); // React 합성 이벤트가 아니라 직접 등록하므로 가능하지만, passive listener 문제 주의
        }

        const cx = ev.type === "touchmove" ? ev.touches[0].clientX : ev.clientX;
        const cy = ev.type === "touchmove" ? ev.touches[0].clientY : ev.clientY;

        const deltaX = cx - initialMouseX;
        const deltaY = cy - initialMouseY;

        // 위치 즉시 업데이트 (GPU 가속 transform)
        div.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;

        // placeholder 업데이트 플래그 설정
        currentMouseY = cy;
        needsPlaceholderUpdate = true;
      };

      const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        if (animationId) cancelAnimationFrame(animationId);

        // 이벤트 리스너 제거
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);

        // 스크롤 복구
        document.body.style.overflow = "";

        // 스타일 복원
        div.classList.remove("dragging");
        div.style.position = "";
        div.style.left = "";
        div.style.top = "";
        div.style.width = "";
        div.style.zIndex = "";
        div.style.pointerEvents = "";
        div.style.transform = "";
        div.style.willChange = "";

        // placeholder 위치에 요소 삽입
        listEl.insertBefore(div, placeholder);
        placeholder.remove();

        // 새로운 순서로 데이터 업데이트
        const newOrder = [];

        listEl.querySelectorAll(".option").forEach((el) => {
          const id = parseInt(el.dataset.id, 10);
          const foundOpt = data.find((o) => o.id === id);
          if (foundOpt) newOrder.push(foundOpt);
        });

        setData(newOrder);
      };

      // 이벤트 리스너 등록 (passive: false for touchmove to allow preventDefault if needed, but here we just block body scroll)
      document.addEventListener("mousemove", handleMove, { passive: true });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);

      // placeholder 업데이트 루프 시작
      animationId = requestAnimationFrame(updatePlaceholder);
    },
    [adminMode]
  );

  return (
    <>
      <div className="wrap">
        <header>
          <h1>★ 플라스크 태그 빌더</h1>
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

        <div className="page-layout">
          {/* 좌측 프리셋 사이드바 */}
          <div className="preset-sidebar">
            <div className="preset-header">
              <h3>프리셋</h3>
              <button className="add-preset-btn" onClick={openPresetModal}>
                +
              </button>
            </div>
            <div className="preset-list-vertical">
              {presets.length === 0 ? (
                <div className="no-preset">저장된 프리셋이 없습니다</div>
              ) : (
                presets.map((preset, idx) => (
                  <PresetItem
                    key={idx}
                    preset={preset}
                    onLoad={handleLoadPreset}
                    onDelete={handleDeletePreset}
                  />
                ))
              )}
            </div>
          </div>

          {/* 우측 빌더 콘텐츠 */}
          <div className="builder-content">
            {/* 선택 결과 영역 */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="result-toolbar">
                <div className="toolbar-left">{/* Max Roll 토글 제거됨 */}</div>
                <div className="toolbar-right">
                  <button className="tool-btn clear-btn" onClick={handleClear}>
                    선택 해제
                  </button>
                </div>
              </div>

              <div className="result-input-wrapper" onClick={handleCopy}>
                <input
                  id="result"
                  className="search-box"
                  readOnly
                  placeholder="선택한 옵션 정규식이 여기 표시됩니다"
                  value={resultText}
                />
                {showCopyToast && (
                  <div className="copy-toast">복사되었습니다!</div>
                )}
              </div>
              <div
                style={{
                  marginTop: "10px",
                  textAlign: "center",
                  fontSize: "16px",
                  fontWeight: 600,
                  padding: "4px 0",
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

            {/* 옵션 선택 영역 */}
            <div className="card">
              <div className="layout">
                <div>
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
                <div>
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

      {/* 프리셋 추가 모달 (슬라이드 바) */}
      {presetModalVisible && (
        <div
          className="modal-bg"
          style={{ display: "flex", justifyContent: "center" }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPresetModalVisible(false);
          }}
        >
          <div className="modal preset-modal">
            <div className="modal-title">프리셋 저장</div>
            <div className="modal-field">
              <span>이름</span>
              <input
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="프리셋 이름을 입력하세요"
                autoFocus
              />
            </div>
            <button
              id="modalSave"
              onClick={savePreset}
              disabled={!newPresetName.trim()}
            >
              저장
            </button>
          </div>
        </div>
      )}

      {/* 모달 */}
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
      )}
    </>
  );
}
