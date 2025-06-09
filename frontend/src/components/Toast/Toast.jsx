import { useEffect, useState } from 'react';
import { MdClose, MdError, MdCheckCircle, MdWarning, MdInfo } from 'react-icons/md';
import PropTypes from 'prop-types';
import './Toast.scss';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  position = 'top-right' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const icons = {
    success: <MdCheckCircle size={20} />,
    error: <MdError size={20} />,
    warning: <MdWarning size={20} />,
    info: <MdInfo size={20} />
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type} toast-${position} ${isVisible ? 'toast-enter' : 'toast-exit'}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {icons[type]}
        </div>
        <div className="toast-message">
          {message}
        </div>
        <button className="toast-close" onClick={handleClose}>
          <MdClose size={16} />
        </button>
      </div>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right'])
};

export default Toast;
