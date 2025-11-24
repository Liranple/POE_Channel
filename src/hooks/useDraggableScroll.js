import { useRef, useCallback } from "react";

export default function useDraggableScroll(enabled = true) {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  const hasDragged = useRef(false);

  const onMouseDown = useCallback(
    (e) => {
      if (!enabled || !ref.current) return;
      hasDragged.current = false;
      isDragging.current = true;
      startX.current = e.pageX - ref.current.offsetLeft;
      startY.current = e.pageY - ref.current.offsetTop;
      scrollLeft.current = ref.current.scrollLeft;
      scrollTop.current = ref.current.scrollTop;

      ref.current.style.cursor = "grabbing";
    },
    [enabled]
  );

  const onMouseLeave = useCallback(() => {
    if (!isDragging.current || !ref.current) return;
    isDragging.current = false;
    ref.current.style.cursor = enabled ? "grab" : "default";
  }, [enabled]);

  const onMouseUp = useCallback(() => {
    if (!isDragging.current || !ref.current) return;
    isDragging.current = false;
    ref.current.style.cursor = enabled ? "grab" : "default";

    // Don't reset hasDragged here, we need it for onClickCapture
    setTimeout(() => {
      hasDragged.current = false;
    }, 0);
  }, [enabled]);

  const onMouseMove = useCallback(
    (e) => {
      if (!isDragging.current || !enabled || !ref.current) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const y = e.pageY - ref.current.offsetTop;
      const walkX = (x - startX.current) * 1.5;
      const walkY = (y - startY.current) * 1.5;

      if (
        Math.abs(x - startX.current) > 5 ||
        Math.abs(y - startY.current) > 5
      ) {
        hasDragged.current = true;
      }

      ref.current.scrollLeft = scrollLeft.current - walkX;
      ref.current.scrollTop = scrollTop.current - walkY;
    },
    [enabled]
  );

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
    style: {
      cursor: enabled ? "grab" : "default",
      overflow: "auto",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    },
  };
}
