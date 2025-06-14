import PropTypes from 'prop-types';
import { MdStarBorder, MdCloudOff, MdFolderOpen } from 'react-icons/md';
import { useTranslation } from '../../contexts/TranslationProvider';
import { useResponsive } from '../../hooks/useResponsive';
import './EmptyState.scss';

const EmptyState = ({ 
  type = 'default', 
  title, 
  subtitle, 
  icon, 
  actions,
  illustration 
}) => {
  const t = useTranslation();
  const { isMobile } = useResponsive();

  const getEmptyStateConfig = () => {
    const iconSize = isMobile ? 60 : 80;
    
    switch (type) {
      case 'starred':
        return {
          icon: <MdStarBorder size={iconSize} />,
          title: title || t('noStarredFiles'),
          subtitle: subtitle || t('addStarsToFindFilesEasily'),
          illustration: (
            <div className="starred-illustration">
              <div className="star-container">
                <div className="star main-star">⭐</div>
                <div className="star star-1">⭐</div>
                <div className="star star-2">⭐</div>
                <div className="star star-3">⭐</div>
              </div>
              <div className="character">
                <div className="character-head"></div>
                <div className="character-body"></div>
                <div className="character-arm left"></div>
                <div className="character-arm right"></div>
              </div>
            </div>
          )
        };
      case 'folder':
        return {
          icon: <MdFolderOpen size={iconSize} />,
          title: title || t('emptyFolder'),
          subtitle: subtitle || t('dragFilesHere'),
          illustration: null
        };
      case 'search':
        return {
          icon: <MdCloudOff size={iconSize} />,
          title: title || t('noResultsFound'),
          subtitle: subtitle || t('tryDifferentKeywords'),
          illustration: null
        };
      default:
        return {
          icon: icon || <MdFolderOpen size={iconSize} />,
          title: title || t('nothingHereYet'),
          subtitle: subtitle || t('uploadOrCreateFiles'),
          illustration: illustration || (
            <div className="empty-illustration">
              <div className="folder-stack">
                <div className="folder folder-1"></div>
                <div className="folder folder-2"></div>
                <div className="folder folder-3"></div>
              </div>
              <div className="floating-elements">
                <div className="element element-1">📄</div>
                <div className="element element-2">📁</div>
                <div className="element element-3">🖼️</div>
              </div>
            </div>
          )
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <div className={`empty-state ${isMobile ? 'mobile' : ''}`}>
      <div className="empty-state-content">
        {config.illustration && (
          <div className="empty-state-illustration">
            {config.illustration}
          </div>
        )}
        
        {!config.illustration && (
          <div className="empty-state-icon">
            {config.icon}
          </div>
        )}
        
        <div className="empty-state-text">
          <h2 className="empty-state-title">{config.title}</h2>
          <p className="empty-state-subtitle">{config.subtitle}</p>
        </div>
        
        {actions && (
          <div className="empty-state-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  type: PropTypes.oneOf(['default', 'starred', 'folder', 'search']),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.element,
  actions: PropTypes.element,
  illustration: PropTypes.element,
};

export default EmptyState;
