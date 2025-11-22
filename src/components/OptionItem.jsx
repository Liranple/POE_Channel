import { useState, useRef, useEffect } from "react";

export default function OptionItem({
  opt,
  listId,
  selected,
  toggleOption,
  handleMouseDownForDrag,
  adminMode,
  openModal,
  deleteOption,
  data,
  setData,
}) {
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
      className={`option ${selected.includes(opt.filterRegex) ? "active" : ""}`}
      data-id={opt.id}
      onClick={() => toggleOption(opt)}
      onMouseDown={(e) => handleMouseDownForDrag(e, opt, listId, data, setData)}
    >
      <div
        className="delete-progress"
        style={{ width: `${deleteProgress}%` }}
      ></div>
      <span style={{ position: "relative", zIndex: 2 }}>{opt.optionText}</span>
      <div className="right-box">
        <div className="option-tags">
          {opt.type
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .sort((a, b) => {
              const order = ["생명력", "마나", "특수", "팅크"];
              return order.indexOf(a) - order.indexOf(b);
            })
            .map((type, idx) => {
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
}
