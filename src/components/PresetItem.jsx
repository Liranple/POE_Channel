import useHoldDelete from "../hooks/useHoldDelete";

export default function PresetItem({
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
      onLoad(preset.selected);
    }
  };

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
      style={{ cursor: adminMode ? "grab" : "pointer" }}
    >
      <div className="delete-progress" style={{ width: `${progress}%` }}></div>
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
}
