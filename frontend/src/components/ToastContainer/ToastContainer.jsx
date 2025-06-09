import Toast from '../Toast/Toast';
import PropTypes from 'prop-types';
import './ToastContainer.scss';

const ToastContainer = ({ toasts, onRemoveToast, position = 'top-right' }) => {
  return (
    <div className={`toast-container toast-container-${position}`}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={0} // Duration is handled by the hook
          position={position}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.array.isRequired,
  onRemoveToast: PropTypes.func.isRequired,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right'])
};

export default ToastContainer;
