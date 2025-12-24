import "../../styles/modal.css";

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  const handleContentClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window" onClick={handleContentClick}>
        {children}
      </div>
    </div>
  );
}