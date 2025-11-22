import useHoldDelete from "../hooks/useHoldDelete";

export default function PresetItem({ preset, onLoad, onDelete }) {
  const { progress, handlers } = useHoldDelete(() => onDelete(preset));

  return (
    <div className="preset-item" onClick={() => onLoad(preset.selected)}>
      <div className="delete-progress" style={{ width: `${progress}%` }}></div>
      <span className="preset-name">{preset.name}</span>
      <div
        className="preset-actions"
        {...handlers}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="delete-btn">×</button>
      </div>
    </div>
  );
}
