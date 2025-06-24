import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../theme/theme-context';
import { CSSThemeColors } from '../../theme/theme-context';

interface ToggleButtonsProps {
  orientation: 'vertical' | 'horizontal';
  isDarkTheme: boolean;
  toggleOrientation: () => void;
  toggleTheme: () => void;
  toggleFullScreen: () => void;
}

export const ToggleButtons: React.FC<ToggleButtonsProps> = ({
  orientation,
  isDarkTheme,
  toggleOrientation,
  toggleTheme,
  toggleFullScreen
}) => {
  const { colors } = useTheme();
  
  return (
    <ToggleButtonsContainer colors={colors} $orientation={orientation}>
      <ToggleButton isActive={orientation === 'vertical'} colors={colors} onClick={toggleOrientation}>
        {orientation === 'vertical' ? '↕️' : '↔️'}
      </ToggleButton>
      <ToggleButton isActive={isDarkTheme} colors={colors} onClick={toggleTheme}>
        {isDarkTheme ? '☀️' : '🌙'}
      </ToggleButton>
      <ToggleButton isActive={false} colors={colors} onClick={toggleFullScreen}>
        ⛶
      </ToggleButton>
    </ToggleButtonsContainer>
  );
};

// Styled Components
const ToggleButtonsContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors' && prop !== '$orientation',
})<{ colors: CSSThemeColors; $orientation: 'vertical' | 'horizontal' }>`
  position: absolute;
  top: ${props => props.$orientation === 'horizontal' ? 'clamp(8px, 2vh, 16px)' : 'clamp(12px, 3vh, 20px)'};
  right: ${props => props.$orientation === 'horizontal' ? 'clamp(16px, 3vw, 24px)' : 'clamp(12px, 3vw, 20px)'};
  display: flex;
  gap: clamp(4px, 1vw, 8px);
  align-items: center;
  z-index: 100;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const ToggleButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['isActive', 'colors'].includes(prop),
})<{ isActive: boolean; colors: CSSThemeColors }>`
  background-color: ${props => props.isActive 
    ? props.colors.interactive.primary 
    : props.colors.background.secondary};
  color: ${props => props.isActive 
    ? props.colors.text.inverse 
    : props.colors.text.primary};
  border: 1px solid ${props => props.isActive 
    ? props.colors.interactive.primary 
    : props.colors.border.secondary};
  border-radius: 8px;
  padding: clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px);
  font-size: clamp(12px, 2.5vw, 14px);
  font-weight: 500;
  cursor: pointer;
  box-shadow: ${props => props.colors.shadow.sm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: clamp(32px, 6vw, 40px);
  min-height: clamp(28px, 5vw, 36px);
  white-space: nowrap;
  flex-shrink: 0;
  
  &:hover {
    background-color: ${props => props.isActive 
      ? props.colors.interactive.primaryHover 
      : props.colors.surface.primary};
    border-color: ${props => props.colors.interactive.primary};
    box-shadow: ${props => props.colors.shadow.md};
  }
  
  &:active {
    background-color: ${props => props.isActive 
      ? props.colors.interactive.primaryActive 
      : props.colors.surface.secondary};
    box-shadow: ${props => props.colors.shadow.sm};
    transform: translateY(1px);
  }
`;

 