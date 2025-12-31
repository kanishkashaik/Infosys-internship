import React from "react";
import "./InfoModal.css";

interface InfoModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export default function InfoModal({ visible, title, message, onClose }: InfoModalProps) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-box">
        {title && <div className="modal-title">{title}</div>}
        <div className="modal-message">{message}</div>
        <div className="modal-actions">
          <button className="action-btn recommendations-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
