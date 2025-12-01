import { useCallback } from "react";
import { ANIMATION } from "../constants";

/**
 * 드래그 핸들러 커스텀 훅
 *
 * 옵션 아이템과 프리셋 아이템의 드래그 앤 드롭을 처리합니다.
 *
 * @param {boolean} adminMode - 관리자 모드 여부
 * @returns {Object} 드래그 핸들러 함수들
 */
export default function useDragHandler(adminMode) {
  /**
   * 옵션 아이템 드래그 시작 핸들러
   * 수직 방향으로 드래그하여 순서를 변경합니다.
   */
  const handleOptionDragStart = useCallback(
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

      const initialLeft = rect.left;
      const initialTop = rect.top;
      const initialMouseX = clientX;
      const initialMouseY = clientY;

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

            // FLIP 애니메이션을 위한 위치 저장
            const positions = new Map();
            items.forEach((item) => {
              positions.set(item, item.getBoundingClientRect().top);
            });

            listEl.insertBefore(placeholder, target);

            // 이동 애니메이션 적용
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
                    duration: ANIMATION.DURATION.NORMAL,
                    easing: ANIMATION.EASING.SMOOTH,
                  }
                );
              }
            });
          };

          if (insertBefore) {
            performMove(insertBefore);
          } else {
            const addBtn = listEl.querySelector(".add-option");
            performMove(addBtn || null);
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

        // 이벤트 리스너 제거
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);

        // 스크롤 복구
        document.body.style.overflow = "";

        // 스타일 복원
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

      // 이벤트 리스너 등록
      document.addEventListener("mousemove", handleMove, { passive: true });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);

      animationId = requestAnimationFrame(updatePlaceholder);
    },
    [adminMode]
  );

  /**
   * 프리셋 아이템 드래그 시작 핸들러
   * 수평 방향으로 드래그하여 순서를 변경합니다.
   *
   * @param {Event} e - 이벤트 객체
   * @param {number} index - 프리셋 인덱스
   * @param {Array} presets - 프리셋 배열
   * @param {Function} updatePresets - 프리셋 업데이트 함수 (setPresets + localStorage 저장)
   */
  const handlePresetDragStart = useCallback(
    (e, index, presets, updatePresets) => {
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
                    duration: ANIMATION.DURATION.NORMAL,
                    easing: ANIMATION.EASING.SMOOTH,
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
        const cy = ev.type === "touchmove" ? ev.touches[0].clientY : ev.clientY;

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

        // 새로운 순서로 프리셋 업데이트
        const newPresets = [];
        listEl.querySelectorAll(".preset-item").forEach((el) => {
          const idx = parseInt(el.dataset.index, 10);
          if (!isNaN(idx) && presets[idx]) {
            newPresets.push(presets[idx]);
          }
        });

        if (newPresets.length === presets.length) {
          updatePresets(newPresets);
        }
      };

      document.addEventListener("mousemove", handleMove, { passive: true });
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleEnd);

      animationId = requestAnimationFrame(updatePlaceholder);
    },
    [adminMode]
  );

  return {
    handleOptionDragStart,
    handlePresetDragStart,
  };
}
