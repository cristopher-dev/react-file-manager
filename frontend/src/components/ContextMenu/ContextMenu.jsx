import { useEffect, useRef, useState, useCallback } from "react";
import { FaChevronRight } from "react-icons/fa6";
import PropTypes from "prop-types";
import SubMenu from "./SubMenu";
import "./ContextMenu.scss";

const ContextMenu = ({ filesViewRef, contextMenuRef, menuItems, visible, clickPosition }) => {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [activeSubMenuIndex, setActiveSubMenuIndex] = useState(null);
  const [subMenuPosition, setSubMenuPosition] = useState("right");

  const subMenuRef = useRef(null);

  const contextMenuPosition = useCallback(() => {
    const { clickX, clickY } = clickPosition;

    const container = filesViewRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollBarWidth = container.offsetWidth - container.clientWidth;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Context menu size
    const contextMenuContainer = contextMenuRef.current.getBoundingClientRect();
    const menuWidth = contextMenuContainer.width || 220; // fallback to min-width
    const menuHeight = contextMenuContainer.height || 300; // reasonable fallback

    // Calculate position relative to viewport
    const leftToCursor = clickX - containerRect.left;
    const topToCursor = clickY - containerRect.top;

    // Calculate optimal position considering both container and viewport boundaries
    let finalLeft = leftToCursor;
    let finalTop = topToCursor + container.scrollTop;

    // Horizontal positioning with viewport awareness
    const spaceOnRight = Math.min(
      containerRect.width - leftToCursor - scrollBarWidth,
      viewportWidth - clickX
    );
    const spaceOnLeft = Math.min(leftToCursor, clickX);

    // Handle case where menu is wider than available space
    if (menuWidth > Math.max(spaceOnRight, spaceOnLeft)) {
      // Center the menu horizontally within the container
      finalLeft = Math.max(0, (containerRect.width - menuWidth - scrollBarWidth) / 2);
      setSubMenuPosition("right");
    } else if (spaceOnRight >= menuWidth) {
      // Enough space on the right
      finalLeft = leftToCursor;
      setSubMenuPosition("right");
    } else if (spaceOnLeft >= menuWidth) {
      // Not enough space on right, try left
      finalLeft = leftToCursor - menuWidth;
      setSubMenuPosition("left");
    } else {
      // Not enough space on either side, clamp to container bounds
      if (spaceOnRight > spaceOnLeft) {
        finalLeft = Math.max(0, containerRect.width - menuWidth - scrollBarWidth);
        setSubMenuPosition("right");
      } else {
        finalLeft = 0;
        setSubMenuPosition("right");
      }
    }

    // Vertical positioning with viewport awareness
    const spaceBelow = Math.min(
      containerRect.height - topToCursor,
      viewportHeight - clickY
    );
    const spaceAbove = Math.min(topToCursor, clickY - containerRect.top);

    // Handle case where menu is taller than available space
    if (menuHeight > Math.max(spaceBelow, spaceAbove)) {
      // Position at top of container for maximum visibility
      finalTop = container.scrollTop + 8; // Small offset from top
    } else if (spaceBelow >= menuHeight) {
      // Enough space below
      finalTop = topToCursor + container.scrollTop;
    } else if (spaceAbove >= menuHeight) {
      // Not enough space below, try above
      finalTop = topToCursor + container.scrollTop - menuHeight;
    } else {
      // Not enough space above or below, position for maximum visibility
      if (spaceBelow > spaceAbove) {
        // More space below, align to bottom of available space
        finalTop = Math.max(
          container.scrollTop,
          topToCursor + container.scrollTop + spaceBelow - menuHeight
        );
      } else {
        // More space above, align to top of available space
        finalTop = container.scrollTop;
      }
    }

    // Ensure the menu doesn't go outside the container bounds
    finalLeft = Math.max(0, Math.min(finalLeft, containerRect.width - Math.min(menuWidth, containerRect.width) - scrollBarWidth));
    finalTop = Math.max(container.scrollTop, finalTop);

    // Additional viewport constraint checks
    const maxLeft = Math.min(finalLeft, viewportWidth - menuWidth - 16);
    const maxTop = Math.min(finalTop, viewportHeight - Math.min(menuHeight, viewportHeight - 32));
    
    setLeft(`${Math.max(0, maxLeft)}px`);
    setTop(`${Math.max(0, maxTop)}px`);
  }, [clickPosition, filesViewRef, contextMenuRef]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseOver = (index) => {
    setActiveSubMenuIndex(index);
  };

  useEffect(() => {
    if (visible && contextMenuRef.current) {
      contextMenuPosition();
      // Add class to body to hide resize handles
      document.body.classList.add('context-menu-open');
    } else {
      setTop(0);
      setLeft(0);
      setActiveSubMenuIndex(null);
      // Remove class from body
      document.body.classList.remove('context-menu-open');
    }
  }, [visible, contextMenuPosition, contextMenuRef]);

  // Handle window resize and scroll events to reposition menu
  useEffect(() => {
    if (!visible) return;

    const handleResize = () => {
      if (contextMenuRef.current) {
        contextMenuPosition();
      }
    };

    const handleScroll = () => {
      if (contextMenuRef.current) {
        contextMenuPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [visible, contextMenuPosition, contextMenuRef]);

  // Cleanup body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('context-menu-open');
    };
  }, []);

  if (visible) {
    return (
      <div
        ref={contextMenuRef}
        onContextMenu={handleContextMenu}
        onClick={(e) => e.stopPropagation()}
        className={`fm-context-menu ${top ? "visible" : "hidden"}`}
        style={{
          top: top,
          left: left,
        }}
      >
        <div className="file-context-menu-list">
          <ul>
            {menuItems
              .filter((item) => !item.hidden)
              .map((item, index) => {
                const hasChildren = Object.prototype.hasOwnProperty.call(item, "children");
                const activeSubMenu = activeSubMenuIndex === index && hasChildren;
                return (
                  <div key={item.title}>
                    <li
                      onClick={item.onClick}
                      className={`${item.className ?? ""} ${activeSubMenu ? "active" : ""}`}
                      onMouseOver={() => handleMouseOver(index)}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      {hasChildren && (
                        <>
                          <FaChevronRight size={14} className="list-expand-icon" />
                          {activeSubMenu && (
                            <SubMenu
                              subMenuRef={subMenuRef}
                              list={item.children}
                              position={subMenuPosition}
                            />
                          )}
                        </>
                      )}
                    </li>
                    {item.divider &&
                      index !== menuItems.filter((item) => !item.hidden).length - 1 && (
                        <div className="divider"></div>
                      )}
                  </div>
                );
              })}
          </ul>
        </div>
      </div>
    );
  }
};

ContextMenu.propTypes = {
  filesViewRef: PropTypes.object.isRequired,
  contextMenuRef: PropTypes.object.isRequired,
  menuItems: PropTypes.array.isRequired,
  visible: PropTypes.bool.isRequired,
  clickPosition: PropTypes.shape({
    clickX: PropTypes.number.isRequired,
    clickY: PropTypes.number.isRequired,
  }).isRequired,
};

export default ContextMenu;
