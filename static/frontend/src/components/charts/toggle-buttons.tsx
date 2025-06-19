import React from 'react';
import styled from 'styled-components';

interface ToggleButtonsProps {
  orientation: 'vertical' | 'horizontal';
  linkType: 'diagonal' | 'step' | 'curve' | 'line';
  isDarkTheme: boolean;
  toggleOrientation: () => void;
  toggleLinkType: () => void;
  toggleTheme: () => void;
  toggleFullScreen: () => void;
}

export const ToggleButtons: React.FC<ToggleButtonsProps> = ({
  orientation,
  linkType,
  isDarkTheme,
  toggleOrientation,
  toggleLinkType,
  toggleTheme,
  toggleFullScreen
}) => {
  return (
    <ToggleButtonsContainer>
      <ToggleButton onClick={toggleOrientation}>
        {orientation === 'vertical' ? '↕️' : '↔️'}
      </ToggleButton>
      <ToggleButton onClick={toggleLinkType}>
        {linkType === 'line' ? '─' : linkType === 'diagonal' ? '╱' : '└'}
      </ToggleButton>
      <ToggleButton onClick={toggleTheme}>
        {isDarkTheme ? '☀️' : '🌙'}
      </ToggleButton>
      <ToggleButton onClick={toggleFullScreen}>
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
`;

const ToggleButton = styled.button`
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &:active {
    background-color: rgba(0, 0, 0, 0.9);
  }
`; 