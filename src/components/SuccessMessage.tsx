import React from "react";
import "./SuccessMessage.css";

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  onDismiss,
}) => {
  return (
    <div className="success-message">
      <div className="success-icon">✓</div>
      <div className="success-text">{message}</div>
      {onDismiss && (
        <button className="success-close" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;
