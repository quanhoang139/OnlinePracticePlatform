import { useEffect } from 'react';
import "../../assets/styles/AuthPage.css"

interface ToastProps {
  status: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
}

const Toast = ({ status, message, onClose }: ToastProps) => {
  useEffect(() => {
    const showTimer = setTimeout(() => {
      const toastElement = document.querySelector(`.toast.${status}`);
      if (toastElement) {
        // toastElement.setAttribute('style', 'animation: hide_slide 1s ease forwards');
      }
    }, 4000);

    // const removeTimer = setTimeout(() => {
    //   onClose();
    // }, 5000);

    return () => {
      clearTimeout(showTimer);
      // clearTimeout(removeTimer);
    };
  }, [status, onClose]);

  const icons = {
    success: '<i class="fas fa-check-circle"></i>',
    error: '<i class="fas fa-exclamation-triangle"></i>',
    warning: '<i class="fas fa-exclamation-circle"></i>',
  };

  return (
    <div className={`toast ${status}`}>
      <span dangerouslySetInnerHTML={{ __html: icons[status] }} />
      <span className="msg">{message}</span>
      <span className="countdown"></span>
    </div>
  );
};

export default Toast;