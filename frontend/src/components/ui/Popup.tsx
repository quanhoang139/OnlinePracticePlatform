import { useEffect } from 'react';
import '../../assets/styles/Popup.css'; // CSS riêng cho Popup

interface PopupProps {
  status: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
}

const Popup = ({ status, message, onClose }: PopupProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Tự động đóng sau 3 giây

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`popup ${status}`}>
      <span>{message}</span>
    </div>
  );
};

export default Popup;