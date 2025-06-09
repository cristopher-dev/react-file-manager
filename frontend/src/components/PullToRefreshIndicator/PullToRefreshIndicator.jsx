import PropTypes from 'prop-types';
import { MdRefresh } from 'react-icons/md';
import './PullToRefreshIndicator.scss';

const PullToRefreshIndicator = ({ 
  isVisible, 
  isRefreshing, 
  progress = 0,
  style = {} 
}) => {
  if (!isVisible) return null;

  return (
    <div className={`pull-to-refresh-indicator ${isRefreshing ? 'refreshing' : ''}`} style={style}>
      <div className="refresh-container">
        <div 
          className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}
          style={{ 
            transform: `rotate(${progress * 360}deg)`,
            opacity: Math.max(0.3, progress)
          }}
        >
          <MdRefresh size={24} />
        </div>
        <span className="refresh-text">
          {isRefreshing ? 'Actualizando...' : 'Tire para actualizar'}
        </span>
      </div>
    </div>
  );
};

PullToRefreshIndicator.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  isRefreshing: PropTypes.bool.isRequired,
  progress: PropTypes.number,
  style: PropTypes.object,
};

export default PullToRefreshIndicator;
