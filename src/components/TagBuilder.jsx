"use client";

import { useState, useRef, useEffect } from "react";

import { DEFAULT_PREFIX_DATA, DEFAULT_SUFFIX_DATA } from "./TagBuilderStash";

export default function TagBuilder() {
  const [adminMode, setAdminMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [prefixData, setPrefixData] = useState(DEFAULT_PREFIX_DATA);
  const [suffixData, setSuffixData] = useState(DEFAULT_SUFFIX_DATA);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [modalListId, setModalListId] = useState(null);
  const [currentEditOption, setCurrentEditOption] = useState(null);
  const [modalData, setModalData] = useState({
    name: "",
    tag: "",
    value: "",
    level: "",
    types: [],
  });

  const modalBgRef = useRef(null);
  const modalDown = useRef(false);

  const toggleOption = (opt) => {
    if (selected.includes(opt.tag)) {
      setSelected(selected.filter((t) => t !== opt.tag));
    } else {
      setSelected([...selected, opt.tag]);
    }
  };

  const updateResult = () => {
    const allData = [...prefixData, ...suffixData];
    const tags = selected
      .map((tag) => {
        const opt = allData.find((o) => o.tag === tag);
        return opt ? opt.tag : null;
      })
      .filter(Boolean);
    return tags.join(" | ");
  };

  const deleteOption = (opt, data, setData, listId) => {
    const idx = data.indexOf(opt);
    if (idx > -1) {
      const newData = [...data];
      newData.splice(idx, 1);
      setData(newData);
      setSelected(selected.filter((t) => t !== opt.tag));
    }
  };

  const openModal = (opt, mode, listId) => {
    setModalMode(mode);
    setModalListId(listId);
    setCurrentEditOption(opt);

    if (mode === "edit" && opt) {
      setModalData({
        name: opt.text,
        tag: opt.tag,
        value: opt.value,
        level: opt.level,
        types: opt.type
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    } else {
      setModalData({
        name: "",
        tag: "",
        value: "",
        level: "",
        types: [],
      });
    }

    setModalVisible(true);
  };

  const handleModalSave = () => {
    const { name, tag, value, level, types } = modalData;
    const type = types.join(",");

    if (modalMode === "edit" && currentEditOption) {
      const updateData = (data, setData) => {
        const newData = data.map((item) => {
          if (item === currentEditOption) {
            return {
              ...item,
              text: name,
              tag: tag,
              value: value,
              level: level,
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
          text: name || "새 옵션",
          tag: tag || "tag" + (maxId + 1),
          value: value,
          level: level,
          type: type,
        },
      ]);
    }

    setModalVisible(false);
  };

  const toggleTypeButton = (type) => {
    const types = modalData.types;
    if (types.includes(type)) {
      setModalData({ ...modalData, types: types.filter((t) => t !== type) });
    } else {
      setModalData({ ...modalData, types: [...types, type] });
    }
  };

  // 커스텀 드래그 핸들러 (완벽한 실시간 추적)
  const handleMouseDownForDrag = (e, opt, listId) => {
    if (!adminMode) return;
    if (e.button !== 0) return;
    if (e.target.closest("button")) return;

    const listEl = document.getElementById(listId);
    if (!listEl) return;

    const div = e.currentTarget;
    const rect = div.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

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
    div.style.pointerEvents = "none";
    div.style.willChange = "transform";
    document.body.appendChild(div);

    let isDragging = true;
    let animationId = null;

    // 초기 위치 저장
    const initialLeft = rect.left;
    const initialTop = rect.top;
    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;

    // placeholder 업데이트 함수 (RAF로 최적화)
    let needsPlaceholderUpdate = false;
    let currentMouseY = e.clientY;

    const updatePlaceholder = () => {
      if (!isDragging) return;

      if (needsPlaceholderUpdate) {
        needsPlaceholderUpdate = false;

        const items = [...listEl.children].filter(
          (el) =>
            el.classList.contains("option") && el !== placeholder && el !== div
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
        if (insertBefore) {
          if (placeholder.nextSibling !== insertBefore) {
            listEl.insertBefore(placeholder, insertBefore);
          }
        } else {
          const addBtn = listEl.querySelector(".add-option");
          const targetNode = addBtn || null;
          if (placeholder.nextSibling !== targetNode) {
            listEl.insertBefore(placeholder, targetNode);
          }
        }
      }

      animationId = requestAnimationFrame(updatePlaceholder);
    };

    const handleMouseMove = (ev) => {
      if (!isDragging) return;

      const deltaX = ev.clientX - initialMouseX;
      const deltaY = ev.clientY - initialMouseY;

      // 위치 즉시 업데이트 (GPU 가속 transform)
      div.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;

      // placeholder 업데이트 플래그 설정
      currentMouseY = ev.clientY;
      needsPlaceholderUpdate = true;
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;

      if (animationId) cancelAnimationFrame(animationId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

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
      const data = listId === "prefixList" ? prefixData : suffixData;
      const setData = listId === "prefixList" ? setPrefixData : setSuffixData;
      const newOrder = [];

      listEl.querySelectorAll(".option").forEach((el) => {
        const id = parseInt(el.dataset.id, 10);
        const foundOpt = data.find((o) => o.id === id);
        if (foundOpt) newOrder.push(foundOpt);
      });

      setData(newOrder);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseup", handleMouseUp);

    // placeholder 업데이트 루프 시작
    animationId = requestAnimationFrame(updatePlaceholder);
  };

  const OptionItem = ({ opt, listId }) => {
    const [deleteProgress, setDeleteProgress] = useState(0);
    const deleteTimerRef = useRef(null);
    const holdTimerRef = useRef(null);
    const sessionIdRef = useRef(0);

    const startDelete = (e) => {
      e.stopPropagation();

      // 이전 세션 완전히 정리
      if (deleteTimerRef.current) {
        clearInterval(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      // 새로운 세션 시작
      sessionIdRef.current += 1;
      const currentSessionId = sessionIdRef.current;

      // 게이지 초기화
      setDeleteProgress(0);

      // 인터벌 시작
      deleteTimerRef.current = setInterval(() => {
        // 세션이 바뀌었는지 확인
        if (sessionIdRef.current !== currentSessionId) {
          clearInterval(deleteTimerRef.current);
          deleteTimerRef.current = null;
          return;
        }

        setDeleteProgress((prev) => {
          const newVal = prev + 2;
          if (newVal >= 100) {
            clearInterval(deleteTimerRef.current);
            deleteTimerRef.current = null;

            // 삭제 실행 예약
            holdTimerRef.current = setTimeout(() => {
              // 세션이 여전히 유효한지 확인
              if (sessionIdRef.current === currentSessionId) {
                const data = listId === "prefixList" ? prefixData : suffixData;
                const setData =
                  listId === "prefixList" ? setPrefixData : setSuffixData;
                deleteOption(opt, data, setData, listId);
              }
              holdTimerRef.current = null;
            }, 300);
          }
          return newVal > 100 ? 100 : newVal;
        });
      }, 20);
    };

    const cancelDelete = (e) => {
      if (e) e.stopPropagation();

      // 세션 무효화
      sessionIdRef.current += 1;

      // 타이머 정리
      if (deleteTimerRef.current) {
        clearInterval(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      // 게이지 초기화
      setDeleteProgress(0);
    };

    useEffect(() => {
      return () => {
        clearInterval(deleteTimerRef.current);
        clearTimeout(holdTimerRef.current);
      };
    }, []);

    return (
      <div
        className={`option ${selected.includes(opt.tag) ? "active" : ""}`}
        data-id={opt.id}
        onClick={() => toggleOption(opt)}
        onMouseDown={(e) => handleMouseDownForDrag(e, opt, listId)}
      >
        <div
          className="delete-progress"
          style={{ width: `${deleteProgress}%` }}
        ></div>
        <span style={{ position: "relative", zIndex: 2 }}>{opt.text}</span>
        <div className="right-box">
          <div className="option-tags">
            {opt.type.split(",").map((t, idx) => {
              const type = t.trim();
              if (!type) return null;
              let className = "option-tag";
              let label = type;
              if (type === "생명력") {
                className += " tag-life";
                label = "HP";
              } else if (type === "마나") {
                className += " tag-mana";
                label = "MP";
              } else if (type === "특수") {
                className += " tag-special";
                label = "SP";
              } else if (type === "팅크") {
                className += " tag-tincture";
                label = "TK";
              }
              return (
                <div key={idx} className={className}>
                  {label}
                </div>
              );
            })}
          </div>
          {adminMode && (
            <div className="buttons">
              <button
                className="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(opt, "edit", listId);
                }}
                style={{ display: "inline-block" }}
              ></button>
              <button
                className="delete"
                onMouseDown={startDelete}
                onMouseUp={cancelDelete}
                onMouseLeave={cancelDelete}
                onClick={(e) => e.stopPropagation()}
                style={{ display: "inline-block" }}
              ></button>
            </div>
          )}
        </div>
      </div>
    );
  };

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

        <div className="card">
          <input
            id="result"
            className="search-box"
            readOnly
            placeholder="선택한 옵션 태그가 여기 표시됩니다"
            value={updateResult()}
          />

          <div className="layout">
            <div>
              <div className="section-title">접두 옵션</div>
              <div id="prefixList" className="list">
                {prefixData.map((opt) => (
                  <OptionItem key={opt.id} opt={opt} listId="prefixList" />
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
                  <OptionItem key={opt.id} opt={opt} listId="suffixList" />
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

      {/* 모달 */}
      {modalVisible && (
        <div
          className="modal-bg"
          ref={modalBgRef}
          style={{ display: "flex" }}
          onMouseUp={(e) => {
            if (!modalDown.current && e.target === modalBgRef.current) {
              setModalVisible(false);
            }
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
              <span>이름</span>
              <input
                id="modalName"
                value={modalData.name}
                onChange={(e) =>
                  setModalData({ ...modalData, name: e.target.value })
                }
              />
            </div>

            <div className="modal-field">
              <span>태그</span>
              <input
                id="modalTag"
                value={modalData.tag}
                onChange={(e) =>
                  setModalData({ ...modalData, tag: e.target.value })
                }
              />
            </div>

            <div className="modal-field">
              <span>수치</span>
              <input
                id="modalValue"
                value={modalData.value}
                onChange={(e) =>
                  setModalData({ ...modalData, value: e.target.value })
                }
              />
            </div>

            <div className="modal-field">
              <span>레벨</span>
              <input
                id="modalLevel"
                value={modalData.level}
                onChange={(e) =>
                  setModalData({ ...modalData, level: e.target.value })
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

            <button id="modalSave" onClick={handleModalSave}>
              {modalMode === "edit" ? "저장" : "추가"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
