import "../../styles/modal.css";

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  const handleContentClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-window" onClick={handleContentClick}>
        {children}
      </div>
    </div>
  );
}