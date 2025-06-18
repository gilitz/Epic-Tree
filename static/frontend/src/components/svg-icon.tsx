import React from 'react';

/**
 * SvgIcon Component
 * 
 * A reusable component for rendering SVG icons from the public directory.
 * All icons have consistent size (16x16) and default styling.
 * Position and custom styling should be handled by parent components.
 * 
 * Usage Examples:
 * <SvgIcon name="arrow" />
 * <SvgIcon name="settings" onClick={handleClick} />
 * 
 * To add new icons:
 * 1. Place your SVG file in the public/ directory
 * 2. Name it in kebab-case (e.g., user-settings.svg, arrow-down.svg)
 * 3. Use it with <SvgIcon name="userSettings" /> or <SvgIcon name="arrowDown" />
 */

interface SvgIconProps {
  name: string;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export const SvgIcon: React.FC<SvgIconProps> = ({
  name,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  // Convert name to kebab-case for file naming consistency
  const iconFileName = name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2');
  const iconUrl = `/${iconFileName}.svg`;

  const defaultStyle: React.CSSProperties = {
    cursor: onClick ? 'pointer' : 'default',
  };

  return (
    <image
      {...props}
      href={iconUrl}
      style={defaultStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};
