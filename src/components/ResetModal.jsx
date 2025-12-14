"use client";

import { useRef } from "react";
import "./ResetModal.css";

/**
 * 캐시 초기화 확인 모달
 *
 * @param {boolean} visible - 모달 표시 여부
 * @param {Function} onClose - 모달 닫기 핸들러
 * @param {Function} onConfirm - 확인 버튼 클릭 핸들러
 */
export default function ResetModal({ visible, onClose, onConfirm }) {
  const modalDown = useRef(false);

  if (!visible) return null;

  return (
    <div
      className="reset-modal-bg"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          modalDown.current = true;
        }
      }}
      onMouseUp={(e) => {
        if (e.target === e.currentTarget && modalDown.current) {
          onClose();
        }
        modalDown.current = false;
      }}
    >
      <div
        className="reset-modal"
        onMouseDown={() => (modalDown.current = false)}
      >
        <div className="reset-modal-title">Page Reset</div>
        <div className="reset-modal-content">
          <p className="reset-modal-description">
            해당 페이지의 정보를 초기화 합니다
          </p>
          <p className="reset-modal-item">프리셋</p>
          <p className="reset-modal-item">옵션 내용 및 위치</p>
        </div>
        <button className="reset-modal-confirm" onClick={onConfirm}>
          초기화
        </button>
      </div>
    </div>
  );
}
