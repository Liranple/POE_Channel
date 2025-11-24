import useHoldDelete from "../hooks/useHoldDelete";

const JEWEL_TYPE_MAP = {
  // English keys (for backward compatibility)
  basicstr: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/basicstr.webp",
  basicdex: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/basicdex.webp",
  basicint: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/basicint.webp",
  MurderousEye:
    "https://cdn.poedb.tw/image/Art/2DItems/Jewels/MurderousEye.webp",
  SearchingEye:
    "https://cdn.poedb.tw/image/Art/2DItems/Jewels/SearchingEye.webp",
  RivetedEye: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/RivetedEye.webp",
  GhastlyEye: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/GhastlyEye.webp",

  // Korean keys
  진홍: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/basicstr.webp",
  진청록: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/basicdex.webp",
  코발트: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/basicint.webp",
  살인적인: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/MurderousEye.webp",
  탐색하는: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/SearchingEye.webp",
  최면거는: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/RivetedEye.webp",
  무시무시한: "https://cdn.poedb.tw/image/Art/2DItems/Jewels/GhastlyEye.webp",
};

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
      onMouseDown={(e) =>
        adminMode && handleDragStart(e, opt, listId, data, setData)
      }
      onTouchStart={(e) =>
        adminMode && handleDragStart(e, opt, listId, data, setData)
      }
    >
      <div className="delete-progress" style={{ width: `${progress}%` }}></div>
      <span style={{ position: "relative", zIndex: 2 }}>
        <span className="option-text-inner">{opt.optionText}</span>
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
              // Jewel types order doesn't matter much, but let's keep them together
              return order.indexOf(a) - order.indexOf(b);
            })
            .map((type, idx) => {
              let className = "option-tag";
              let label = type;
              let style = {};

              if (JEWEL_TYPE_MAP[type]) {
                className += ` tag-jewel`;
                label = (
                  <img
                    src={JEWEL_TYPE_MAP[type]}
                    alt={type}
                    style={{ width: "24px", height: "24px", display: "block" }}
                  />
                );
              } else if (type === "생명력") {
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
                <div key={idx} className={className} style={style}>
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
