import { memo } from "react";
import useHoldDelete from "../hooks/useHoldDelete";
import { JEWEL_TYPE_MAP } from "../data/JewelData";

const OptionItem = memo(
  function OptionItem({
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

    let isNormalSelected = false;
    let isExcluded = false;
    let isMaxSelected = false;

    if (Array.isArray(selected)) {
      // Legacy mode (FlaskPage, JewelsPage, etc.)
      isNormalSelected = selected.includes(opt.filterRegex);
      isMaxSelected =
        opt.maxRollRegex &&
        opt.maxRollRegex !== opt.filterRegex &&
        selected.includes(opt.maxRollRegex);
    } else {
      // New mode (MapsPage) - selected is an object
      const selectionState = selected[opt.filterRegex];
      isNormalSelected = selectionState === "include";
      isExcluded = selectionState === "exclude";

      // For MapsPage, maxRollRegex logic might need to be adapted if used.
      // Currently MapsPage doesn't seem to use maxRollRegex in the same way as FlaskPage.
      // But if it did, we'd check the map.
      if (opt.maxRollRegex && opt.maxRollRegex !== opt.filterRegex) {
        isMaxSelected = selected[opt.maxRollRegex] === "include";
      }
    }

    return (
      <div
        className={`option ${isNormalSelected ? "active" : ""} ${
          isExcluded ? "exclude" : ""
        } ${isMaxSelected ? "active-max" : ""}`}
        data-id={opt.id}
        onClick={() => toggleOption(opt)}
        onMouseDown={(e) =>
          adminMode && handleDragStart(e, opt, listId, data, setData)
        }
        onTouchStart={(e) =>
          adminMode && handleDragStart(e, opt, listId, data, setData)
        }
      >
        <div
          className="delete-progress"
          style={{ width: `${progress}%` }}
        ></div>
        <span style={{ position: "relative", zIndex: 2 }}>
          <span className="option-text-inner">{opt.optionText}</span>
          {isExcluded && <span className="not-badge">NOT</span>}
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
                const normalizedType = type.normalize
                  ? type.normalize("NFC")
                  : type;
                let className = "option-tag";
                let label = normalizedType;
                let style = {};

                if (JEWEL_TYPE_MAP[normalizedType]) {
                  className += ` tag-jewel`;
                  label = (
                    <img
                      src={JEWEL_TYPE_MAP[normalizedType]}
                      alt={normalizedType}
                      style={{
                        width: "24px",
                        height: "24px",
                        display: "block",
                      }}
                    />
                  );
                } else if (normalizedType === "생명력") {
                  className += " tag-life";
                  label = "HP";
                } else if (normalizedType === "마나") {
                  className += " tag-mana";
                  label = "MP";
                } else if (normalizedType === "특수") {
                  className += " tag-special";
                  label = "SP";
                } else if (normalizedType === "팅크") {
                  className += " tag-tincture";
                  label = "TK";
                } else if (normalizedType === "Top") {
                  className += " tag-top";
                  label = "Top";
                } else if (normalizedType === "Uber") {
                  className += " tag-uber";
                  label = "Uber";
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
  },
  (prevProps, nextProps) => {
    // Custom comparison function for performance
    if (prevProps.opt.id !== nextProps.opt.id) return false;
    if (prevProps.adminMode !== nextProps.adminMode) return false;

    // Check selection state
    if (Array.isArray(prevProps.selected)) {
      const prevSelected = prevProps.selected.includes(
        prevProps.opt.filterRegex
      );
      const nextSelected = nextProps.selected.includes(
        nextProps.opt.filterRegex
      );
      if (prevSelected !== nextSelected) return false;

      if (prevProps.opt.maxRollRegex) {
        const prevMax = prevProps.selected.includes(prevProps.opt.maxRollRegex);
        const nextMax = nextProps.selected.includes(nextProps.opt.maxRollRegex);
        if (prevMax !== nextMax) return false;
      }
    } else {
      const prevStatus = prevProps.selected[prevProps.opt.filterRegex];
      const nextStatus = nextProps.selected[nextProps.opt.filterRegex];
      if (prevStatus !== nextStatus) return false;

      if (prevProps.opt.maxRollRegex) {
        const prevMax = prevProps.selected[prevProps.opt.maxRollRegex];
        const nextMax = nextProps.selected[nextProps.opt.maxRollRegex];
        if (prevMax !== nextMax) return false;
      }
    }

    return true;
  }
);

export default OptionItem;
