import React, { ReactNode, ReactElement } from 'react';
import TippyImport from "@tippyjs/react";
import styled from "styled-components";

const Tippy = TippyImport as React.ComponentType<Record<string, unknown>>;

interface TooltipProps {
  content: ReactNode;
  interactive?: boolean;
  disabled?: boolean;
  delay?: [number, number];
  children: ReactElement;
  onShow?: () => void;
  onHide?: () => void;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, delay, interactive, disabled, children, onShow, onHide, className, ...props }) => {
  // Always append to document.body to ensure it's above everything
  return (
    <Tippy 
      {...props}
      delay={delay ?? [300, 100]}
      appendTo={() => document.body}
      animation={false}
      disabled={disabled}
      interactive={interactive}
      zIndex={99999}
      content={<UnifiedTooltipContainer className={className}>{content}</UnifiedTooltipContainer>}
      boundary="viewport"
      placement="auto"
      onShow={onShow}
      onHide={onHide}
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
  width: fit-content;
  max-width: 400px;
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

export const NodeTooltip = styled(Tooltip)`
  min-width: 400px;
`;
