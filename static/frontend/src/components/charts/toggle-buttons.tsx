import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../theme/theme-context';
import { StyledComponentColors } from '../../theme/theme-context';

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
    <ToggleButtonsContainer>
      <ToggleButton colors={colors} onClick={toggleOrientation}>
        {orientation === 'vertical' ? '↕️' : '↔️'}
      </ToggleButton>
      <ToggleButton colors={colors} onClick={toggleTheme}>
        {isDarkTheme ? '☀️' : '🌙'}
      </ToggleButton>
      <ToggleButton colors={colors} onClick={toggleFullScreen}>
        ⛶
      </ToggleButton>
    </ToggleButtonsContainer>
  );
};

// Styled Components
const ToggleButtonsContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 1000;
  padding: 8px;
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-container);
  border-radius: var(--border-radius-container);
  box-shadow: var(--color-shadow-sm);
  transition: background-color 0.3s ease, border-color 0.3s ease;
`;

const ToggleButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<StyledComponentColors>`
  background-color: ${props => props.colors.surface.elevated};
  color: ${props => props.colors.text.primary};
  border: 1px solid ${props => props.colors.border.primary};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: ${props => props.colors.shadow.sm};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 36px;
  
  &:hover {
    background-color: ${props => props.colors.surface.hover};
    border-color: ${props => props.colors.border.secondary};
    box-shadow: ${props => props.colors.shadow.md};
    transform: translateY(-1px);
  }
  
  &:active {
    background-color: ${props => props.colors.surface.active};
    transform: translateY(0);
    box-shadow: ${props => props.colors.shadow.sm};
  }
`; 