import { createGlobalStyle } from 'styled-components';
import { ThemeColors } from './colors';

interface GlobalStyleProps {
  colors: ThemeColors;
}

export const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
  /* CSS Reset and Base Styles */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: ${props => props.colors.background.primary};
    color: ${props => props.colors.text.primary};
    font-size: 14px;
    line-height: 1.5;
    transition: background-color 0.3s ease, color 0.3s ease;
    overflow-x: hidden;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 600;
    line-height: 1.2;
    color: ${props => props.colors.text.primary};
  }

  h1 { font-size: 2rem; }
  h2 { font-size: 1.75rem; }
  h3 { font-size: 1.5rem; }
  h4 { font-size: 1.25rem; }
  h5 { font-size: 1.125rem; }
  h6 { font-size: 1rem; }

  p {
    margin: 0 0 1rem 0;
    color: ${props => props.colors.text.secondary};
  }

  /* Links */
  a {
    color: ${props => props.colors.text.link};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${props => props.colors.text.linkHover};
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid ${props => props.colors.border.focus};
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  /* Form Elements */
  button, input, optgroup, select, textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }

  input, textarea, select {
    background-color: ${props => props.colors.surface.primary};
    border: 1px solid ${props => props.colors.border.primary};
    border-radius: 6px;
    padding: 8px 12px;
    color: ${props => props.colors.text.primary};
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${props => props.colors.border.focus};
      box-shadow: 0 0 0 3px ${props => props.colors.border.focus}20;
    }

    &:disabled {
      background-color: ${props => props.colors.surface.disabled};
      color: ${props => props.colors.text.disabled};
      cursor: not-allowed;
    }

    &::placeholder {
      color: ${props => props.colors.text.tertiary};
    }
  }

  /* Custom scrollbars */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.colors.surface.secondary};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.colors.border.secondary};
    border-radius: 4px;
    transition: background 0.2s ease;

    &:hover {
      background: ${props => props.colors.text.tertiary};
    }
  }

  ::-webkit-scrollbar-corner {
    background: ${props => props.colors.surface.secondary};
  }

  /* Firefox scrollbars */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${props => props.colors.border.secondary} ${props => props.colors.surface.secondary};
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid ${props => props.colors.border.focus};
    outline-offset: 2px;
  }

  *:focus:not(:focus-visible) {
    outline: none;
  }

  *:focus-visible {
    outline: 2px solid ${props => props.colors.border.focus};
    outline-offset: 2px;
  }

  /* Selection styles */
  ::selection {
    background-color: ${props => props.colors.interactive.primary}30;
    color: ${props => props.colors.text.primary};
  }

  ::-moz-selection {
    background-color: ${props => props.colors.interactive.primary}30;
    color: ${props => props.colors.text.primary};
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .text-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  /* Animation utilities */
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }

  .animate-scale-in {
    animation: scaleIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.95);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Smooth transitions for theme changes */
  * {
    transition: background-color 0.3s ease, 
                border-color 0.3s ease, 
                color 0.3s ease,
                box-shadow 0.3s ease;
  }

  /* Print styles */
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    a, a:visited {
      text-decoration: underline;
    }

    a[href]:after {
      content: " (" attr(href) ")";
    }

    abbr[title]:after {
      content: " (" attr(title) ")";
    }

    .no-print {
      display: none !important;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    * {
      border-width: 2px !important;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`; 