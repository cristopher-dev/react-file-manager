import { useEffect, useRef } from "react";
import { FaCheck } from "react-icons/fa6";
import PropTypes from "prop-types";

const SubMenu = ({ subMenuRef, list, position = "right" }) => {
  const internalRef = useRef(null);
  
  useEffect(() => {
    // Apply intelligent positioning if ref is available
    const element = subMenuRef || internalRef;
    if (element && element.current) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Reset any previous manual positioning
      element.current.style.left = '';
      element.current.style.top = '';
      element.current.style.transform = '';
      
      // Get updated rect after reset
      const updatedRect = element.current.getBoundingClientRect();
      
      // Adjust horizontal position if overflowing
      if (updatedRect.right > viewportWidth - 8) {
        if (position === "right") {
          element.current.style.left = 'calc(-100% + 2px)';
        } else {
          element.current.style.transform = `translateX(${viewportWidth - updatedRect.right - 8}px)`;
        }
      } else if (updatedRect.left < 8) {
        if (position === "left") {
          element.current.style.left = 'calc(100% - 2px)';
        } else {
          element.current.style.transform = `translateX(${8 - updatedRect.left}px)`;
        }
      }
      
      // Adjust vertical position if overflowing
      if (updatedRect.bottom > viewportHeight - 8) {
        const overflow = updatedRect.bottom - (viewportHeight - 8);
        element.current.style.transform = `${element.current.style.transform || ''} translateY(-${overflow}px)`;
      } else if (updatedRect.top < 8) {
        const overflow = 8 - updatedRect.top;
        element.current.style.transform = `${element.current.style.transform || ''} translateY(${overflow}px)`;
      }
    }
  }, [subMenuRef, list, position]);

  return (
    <ul ref={subMenuRef || internalRef} className={`sub-menu ${position}`}>
      {list?.map((item) => (
        <li key={item.title} onClick={item.onClick}>
          <span className="item-selected">{item.selected && <FaCheck size={13} />}</span>
          {item.icon}
          <span>{item.title}</span>
        </li>
      ))}
    </ul>
  );
};

SubMenu.propTypes = {
  subMenuRef: PropTypes.object,
  list: PropTypes.array,
  position: PropTypes.oneOf(['left', 'right']),
};

export default SubMenu;
