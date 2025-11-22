import useHoldDelete from "../hooks/useHoldDelete";

export default function OptionItem({
  opt,
  listId,
  selected,
  toggleOption,
  handleDragStart,
  adminMode,
  openModal,
  deleteOption,
  data,
  setData,
}) {
  const { progress, handlers } = useHoldDelete(() =>
    deleteOption(opt, data, setData, listId)
  );

  const isNormalSelected = selected.includes(opt.filterRegex);
  const isMaxSelected =
    opt.maxRollRegex &&
    opt.maxRollRegex !== opt.filterRegex &&
    selected.includes(opt.maxRollRegex);
  const isSelected = isNormalSelected || isMaxSelected;

  return (
    <div
      className={`option ${isNormalSelected ? "active" : ""} ${
        isMaxSelected ? "active-max" : ""
      }`}
      data-id={opt.id}
      onClick={() => toggleOption(opt)}
      onMouseDown={(e) => handleDragStart(e, opt, listId, data, setData)}
      onTouchStart={(e) => handleDragStart(e, opt, listId, data, setData)}
    >
      <div className="delete-progress" style={{ width: `${progress}%` }}></div>
      <span style={{ position: "relative", zIndex: 2 }}>
        {opt.optionText}
        {isMaxSelected && <span className="max-badge">MAX</span>}
      </span>
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
              {...handlers}
              onClick={(e) => e.stopPropagation()}
              style={{ display: "inline-block" }}
            ></button>
          </div>
        )}
      </div>
    </div>
  );
}
