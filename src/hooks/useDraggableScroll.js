import { useRef, useCallback, useMemo } from "react";

// 정적 스타일 객체 - 컴포넌트 외부에 선언하여 재생성 방지
const scrollStyle = {
  overflow: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

export default function useDraggableScroll(enabled = true) {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const hasDragged = useRef(false);

  const onMouseDown = useCallback((e) => {
    if (!enabledRef.current || !ref.current) return;
    // 옵션 박스나 add-option 클릭 시에는 드래그 스크롤 시작 안함
    if (e.target.closest(".option") || e.target.closest(".add-option")) return;

    hasDragged.current = false;
    isDragging.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    startY.current = e.pageY - ref.current.offsetTop;
    scrollLeft.current = ref.current.scrollLeft;
    scrollTop.current = ref.current.scrollTop;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!isDragging.current || !ref.current) return;
    isDragging.current = false;
    ref.current.style.cursor = "";
  }, []);

  const onMouseUp = useCallback(() => {
    if (!isDragging.current || !ref.current) return;
    isDragging.current = false;
    ref.current.style.cursor = "";

    // Don't reset hasDragged here, we need it for onClickCapture
    setTimeout(() => {
      hasDragged.current = false;
    }, 0);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current || !enabledRef.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const y = e.pageY - ref.current.offsetTop;
    const walkX = (x - startX.current) * 1.5;
    const walkY = (y - startY.current) * 1.5;

    if (Math.abs(x - startX.current) > 5 || Math.abs(y - startY.current) > 5) {
      hasDragged.current = true;
    }

    ref.current.scrollLeft = scrollLeft.current - walkX;
    ref.current.scrollTop = scrollTop.current - walkY;
  }, []);

  const onClickCapture = useCallback((e) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return {
    ref,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    onClickCapture,
    style: scrollStyle,
  };
}
