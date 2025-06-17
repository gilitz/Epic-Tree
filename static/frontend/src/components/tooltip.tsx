import React, { ReactNode, ReactElement } from 'react';
import { createPortal } from 'react-dom';
import TippyImport from "@tippyjs/react";
import styled from "styled-components";

const Tippy = TippyImport as any;

interface TooltipProps {
  content: ReactNode;
  interactive?: boolean;
  disabled?: boolean;
  children: ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, interactive, disabled, children }) => {
  // Always append to document.body to ensure it's above everything
  return (
    <Tippy 
      delay={[300, 100]}
      appendTo={() => document.body}
      animation={false}
      disabled={disabled}
      interactive={interactive}
      zIndex={2147483647} // Maximum z-index value
      content={<UnifiedTooltipContainer>{content}</UnifiedTooltipContainer>}
      boundary="viewport"
      placement="auto"
      popperOptions={{
        strategy: 'fixed',
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
              padding: 16,
              altAxis: true,
              altBoundary: true,
            },
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
              allowedAutoPlacements: ['top', 'bottom', 'left', 'right'],
            },
          },
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      }}
      maxWidth="none"
      hideOnClick={false}
      trigger="mouseenter focus"
    >
      {children}
    </Tippy>
  );
};

// Unified container style for ALL tooltips
const UnifiedTooltipContainer = styled.div`
  width: 400px;
  min-width: 400px;
  max-width: 400px;
  max-height: 80vh;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 2147483647;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f8f9fa;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #dee2e6;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #adb5bd;
  }
  
  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #dee2e6 #f8f9fa;
`;

// Legacy TooltipBox for backward compatibility (now just passes through)
const TooltipBox = styled.div`
  display: block;
  background-color: transparent;
  padding: 0;
  border: none;
  border-radius: 0;
  color: inherit;
  overflow: visible;
  position: relative;
`; 