import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme, CSSThemeColors } from '../theme/theme-context';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  inline?: boolean;
  className?: string;
  margin?: string;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['colors', '$size', '$inline', '$margin'].includes(prop),
})<{ 
  colors: CSSThemeColors; 
  $size: 'small' | 'medium' | 'large';
  $inline: boolean;
  $margin?: string;
}>`
  display: ${props => props.$inline ? 'inline-block' : 'block'};
  width: ${props => {
    switch (props.$size) {
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '32px';
      default: return '14px';
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '32px';
      default: return '14px';
    }
  }};
  border: ${props => {
    const borderWidth = props.$size === 'large' ? '3px' : '2px';
    return `${borderWidth} solid ${props.colors.border.primary}`;
  }};
  border-top: ${props => {
    const borderWidth = props.$size === 'large' ? '3px' : '2px';
    return `${borderWidth} solid ${props.colors.interactive.primary}`;
  }};
  border-radius: 50%;
  animation: ${spin} ${props => props.$size === 'large' ? '1s' : '0.6s'} linear infinite;
  margin: ${props => props.$margin || (props.$inline ? '0 0 0 6px' : '0')};
  flex-shrink: 0;
`;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  inline = true,
  className,
  margin
}) => {
  const { colors } = useTheme();

  return (
    <SpinnerContainer
      colors={colors}
      $size={size}
      $inline={inline}
      $margin={margin}
      className={className}
    />
  );
};

// Legacy compatibility exports for different sizes used throughout the codebase
export const SmallLoadingSpinner: React.FC<{ className?: string; margin?: string }> = (props) => (
  <LoadingSpinner size="small" {...props} />
);

export const MediumLoadingSpinner: React.FC<{ className?: string; margin?: string }> = (props) => (
  <LoadingSpinner size="medium" {...props} />
);

export const LargeLoadingSpinner: React.FC<{ className?: string; margin?: string }> = (props) => (
  <LoadingSpinner size="large" inline={false} {...props} />
); 