import { MdClose } from "react-icons/md";
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "../../contexts/TranslationProvider";
import { useResponsive } from "../../hooks/useResponsive";
import "./Modal.scss";

const Modal = ({
  children,
  show,
  setShow,
  heading,
  dialogWidth = "25%",
  contentClassName = "",
  closeButton = true,
}) => {
  const modalRef = useRef(null);
  const t = useTranslation();
  const { isMobile, isTablet } = useResponsive();

  // Determine responsive width
  const getResponsiveWidth = () => {
    if (isMobile) return "95vw";
    if (isTablet) return "80vw";
    return dialogWidth;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShow(false);
    }
  };

  useEffect(() => {
    if (show) {
      modalRef.current.showModal();
    } else {
      modalRef.current.close();
    }
  }, [show]);

  return (
    <dialog
      ref={modalRef}
      className={`fm-modal dialog ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
      style={{ width: getResponsiveWidth() }}
      onKeyDown={handleKeyDown}
    >
      <div className="fm-modal-header">
        <span className="fm-modal-heading">{heading}</span>
        {closeButton && (
          <MdClose
            size={isMobile ? 20 : 24}
            onClick={() => setShow(false)}
            className="close-icon"
            title={t("close")}
          />
        )}
      </div>
      <div className={`fm-modal-content ${contentClassName}`}>
        {children}
      </div>
    </dialog>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  heading: PropTypes.string,
  dialogWidth: PropTypes.string,
  contentClassName: PropTypes.string,
  closeButton: PropTypes.bool,
};

export default Modal;
