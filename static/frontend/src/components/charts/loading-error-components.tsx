import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme, CSSThemeColors } from '../../theme/theme-context';
import { LargeLoadingSpinner } from '../loading-spinner';

export const LoadingComponent: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <LoadingContainer colors={colors}>
      <LargeLoadingSpinner margin="0 0 16px 0" />
      <LoadingTitle colors={colors}>Loading Epic Tree...</LoadingTitle>
      <LoadingSubtitle colors={colors}>
        Fetching epic and issue data...
      </LoadingSubtitle>
    </LoadingContainer>
  );
};

export const NetworkErrorComponent: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <ErrorContainer colors={colors}>
      <ErrorIcon colors={colors}>⚠️</ErrorIcon>
      <ErrorTitle colors={colors}>Network Error</ErrorTitle>
      <ErrorMessage colors={colors}>
        Unable to load epic data. Please check your connection and try refreshing the page.
      </ErrorMessage>
      <ErrorSubtitle colors={colors}>
        Please refresh the page to try again.
      </ErrorSubtitle>
      <RetryButton colors={colors} onClick={() => window.location.reload()}>
        Retry
      </RetryButton>
    </ErrorContainer>
  );
};

export const LoadingIssuesComponent: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <LoadingContainer colors={colors}>
      <LargeLoadingSpinner margin="0 0 16px 0" />
      <LoadingTitle colors={colors}>Loading Epic Tree...</LoadingTitle>
      <LoadingSubtitle colors={colors}>
        Loading issues for epic...
      </LoadingSubtitle>
    </LoadingContainer>
  );
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const LoadingContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  min-height: 200px;
  background-color: ${props => props.colors.background.primary};
  border: 1px solid var(--color-border-container);
  border-radius: var(--border-radius-container);
  margin: 20px;
  animation: ${fadeIn} 0.3s ease-out;
`;



const LoadingTitle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.colors.text.primary};
  margin-bottom: 8px;
`;

const LoadingSubtitle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  font-size: 14px;
  color: ${props => props.colors.text.secondary};
`;

const ErrorContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  min-height: 200px;
  background-color: ${props => props.colors.background.primary};
  border: 1px solid ${props => props.colors.status.errorBorder};
  border-radius: var(--border-radius-container);
  margin: 20px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ErrorIcon = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  font-size: 48px;
  margin-bottom: 16px;
  filter: sepia(1) saturate(2) hue-rotate(20deg);
`;

const ErrorTitle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.colors.status.error};
  margin-bottom: 8px;
`;

const ErrorMessage = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  font-size: 14px;
  color: ${props => props.colors.text.secondary};
  max-width: 400px;
  line-height: 1.5;
  margin-bottom: 8px;
`;

const ErrorSubtitle = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  font-size: 12px;
  color: ${props => props.colors.text.tertiary};
  margin-bottom: 16px;
`;

const RetryButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'colors',
})<{ colors: CSSThemeColors }>`
  background-color: ${props => props.colors.interactive.primary};
  color: ${props => props.colors.text.inverse};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.colors.shadow.sm};

  &:hover {
    background-color: ${props => props.colors.interactive.primaryHover};
    box-shadow: ${props => props.colors.shadow.md};
    transform: translateY(-1px);
  }

  &:active {
    background-color: ${props => props.colors.interactive.primaryActive};
    transform: translateY(0);
    box-shadow: ${props => props.colors.shadow.sm};
  }

  &:focus {
    outline: 2px solid ${props => props.colors.border.focus};
    outline-offset: 2px;
  }
`; 