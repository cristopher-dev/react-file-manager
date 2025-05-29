import { ImSpinner2 } from "react-icons/im";
import PropTypes from "prop-types";
import "./Loader.scss";

/**
 * Enhanced Loader component with better performance and accessibility
 * @param {boolean} loading - Controls loader visibility
 * @param {string} className - Additional CSS classes
 * @param {string} text - Optional loading text
 * @param {string} size - Loader size: small, medium, large
 * @param {string} variant - Loader style variant: spinner, dots, pulse
 */
const Loader = ({ 
  loading = false, 
  className = "", 
  text = "", 
  size = "medium",
  variant = "spinner"
}) => {
  // Early return for better performance
  if (!loading) return null;

  const loaderClasses = [
    "loader-container",
    className,
    `loader-${size}`,
    `loader-${variant}`
  ].filter(Boolean).join(" ");

  return (
    <div 
      className={loaderClasses}
      role="status"
      aria-live="polite"
      aria-label={text || "Loading..."}
    >
      {variant === "spinner" && <ImSpinner2 className="spinner" />}
      {variant === "dots" && (
        <div className="dots-loader">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      )}
      {variant === "pulse" && <div className="pulse-loader"></div>}
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
};

Loader.propTypes = {
  loading: PropTypes.bool,
  className: PropTypes.string,
  text: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["spinner", "dots", "pulse"]),
};

export default Loader;
