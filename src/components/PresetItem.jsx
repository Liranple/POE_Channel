import { memo, useMemo } from "react";
import useHoldDelete from "../hooks/useHoldDelete";

// 정적 스타일 객체
const grabStyle = { cursor: "grab" };
const pointerStyle = { cursor: "pointer" };

const PresetItem = memo(function PresetItem({
  preset,
  index,
  onLoad,
  onDelete,
  onEdit,
  adminMode,
  onDragStart,
}) {
  const { progress, handlers } = useHoldDelete(() => onDelete(preset));

  const handleClick = () => {
    if (!adminMode) {
      onLoad(preset);
    }
  };

  const cursorStyle = adminMode ? grabStyle : pointerStyle;
  const progressStyle = useMemo(() => ({ width: `${progress}%` }), [progress]);

  return (
    <div
      className="preset-item"
      data-index={index}
      onClick={handleClick}
      onMouseDown={(e) => {
        if (adminMode && onDragStart) {
          onDragStart(e, index);
        }
      }}
      onTouchStart={(e) => {
        if (adminMode && onDragStart) {
          onDragStart(e, index);
        }
      }}
      style={cursorStyle}
    >
      <div className="delete-progress" style={progressStyle}></div>
      <span className="preset-name">{preset.name}</span>
      {adminMode && (
        <div
          className="preset-actions"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            className="preset-action-btn edit"
            onClick={() => onEdit(preset)}
          >
            ✎
          </button>
          <button className="preset-action-btn delete" {...handlers}>
            🗑
          </button>
        </div>
      )}
    </div>
  );
});

export default PresetItem;
