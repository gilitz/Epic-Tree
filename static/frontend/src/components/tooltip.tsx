import React, { ReactNode, ReactElement } from 'react';
import TippyImport from "@tippyjs/react";
import styled from "styled-components";
import { useTheme } from '../theme/theme-context';

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
  const { colors } = useTheme();
  
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
      content={<UnifiedTooltipContainer colors={colors} className={className}>{content}</UnifiedTooltipContainer>}
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
const UnifiedTooltipContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: any }>`
  width: fit-content;
  max-width: 400px;
  max-height: 70vh;
  background-color: ${props => props.colors.surface.elevated};
  border: 1px solid ${props => props.colors.border.primary};
  border-radius: 12px;
  padding: 16px;
  box-shadow: ${props => props.colors.shadow.xl};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${props => props.colors.text.primary};
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 2147483647;
  backdrop-filter: blur(8px);
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.colors.surface.secondary};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.colors.border.secondary};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.colors.text.tertiary};
  }
  
  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.colors.border.secondary} ${props => props.colors.surface.secondary};
`;

export const NodeTooltip = styled(Tooltip)`
  min-width: 400px;
`;

// Secondary tooltip container with grayer background for nested tooltips
const SecondaryTooltipContainer = styled(UnifiedTooltipContainer)`
  background-color: ${props => props.colors.surface.secondary};
  border-color: ${props => props.colors.border.secondary};
  color: ${props => props.colors.text.secondary};
`;

// Secondary tooltip component for tooltips that appear over other tooltips
export const SecondaryTooltip: React.FC<TooltipProps> = ({ content, delay, interactive, disabled, children, onShow, onHide, className, ...props }) => {
  const { colors } = useTheme();
  
  return (
    <Tippy 
      {...props}
      delay={delay ?? [300, 100]}
      appendTo={() => document.body}
      animation={false}
      disabled={disabled}
      interactive={interactive}
      zIndex={99999}
      content={<SecondaryTooltipContainer colors={colors} className={className}>{content}</SecondaryTooltipContainer>}
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
