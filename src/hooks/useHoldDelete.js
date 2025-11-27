import { useState, useRef, useEffect, useCallback, useMemo } from "react";

export default function useHoldDelete(onDelete, deleteDelay = 1000) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(0);
  const isDeletingRef = useRef(false);
  const commitTimeoutRef = useRef(null);

  const cancelDelete = useCallback(() => {
    isDeletingRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (commitTimeoutRef.current) {
      clearTimeout(commitTimeoutRef.current);
      commitTimeoutRef.current = null;
    }
    setProgress(0);
  }, []);

  const startDelete = useCallback(
    (e) => {
      // 우클릭 방지
      if (e.type === "mousedown" && e.button !== 0) return;

      // 기존 작업 취소
      cancelDelete();

      isDeletingRef.current = true;
      startTimeRef.current = Date.now();
      setProgress(0);

      const animate = () => {
        if (!isDeletingRef.current) return;

        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const newProgress = Math.min(100, (elapsed / deleteDelay) * 100);

        setProgress(newProgress);

        if (newProgress < 100) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          // 100% 도달
          // 시각적 완성을 위한 짧은 지연 (이 시간 동안에도 취소 가능해야 함)
          commitTimeoutRef.current = setTimeout(() => {
            if (isDeletingRef.current) {
              onDelete();
              isDeletingRef.current = false;
              setProgress(0);
            }
          }, 200); // 200ms 버퍼
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [onDelete, deleteDelay, cancelDelete]
  );

  useEffect(() => {
    return () => cancelDelete();
  }, [cancelDelete]);

  const handlers = useMemo(
    () => ({
      onMouseDown: startDelete,
      onMouseUp: cancelDelete,
      onMouseLeave: cancelDelete,
      onTouchStart: startDelete,
      onTouchEnd: cancelDelete,
      onTouchCancel: cancelDelete,
    }),
    [startDelete, cancelDelete]
  );

  return {
    progress,
    handlers,
  };
}
