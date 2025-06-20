import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
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
    background-color: var(--color-background-primary);
    color: var(--color-text-primary);
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
    color: var(--color-text-primary);
  }

  h1 { font-size: 2rem; }
  h2 { font-size: 1.75rem; }
  h3 { font-size: 1.5rem; }
  h4 { font-size: 1.25rem; }
  h5 { font-size: 1.125rem; }
  h6 { font-size: 1rem; }

  p {
    margin: 0 0 1rem 0;
    color: var(--color-text-secondary);
  }

  /* Links */
  a {
    color: var(--color-text-link);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--color-text-link-hover);
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid var(--color-border-focus);
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
    background-color: var(--color-surface-primary);
    border: 1px solid var(--color-border-primary);
    border-radius: 6px;
    padding: 8px 12px;
    color: var(--color-text-primary);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--color-border-focus);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-border-focus) 20%, transparent);
    }

    &:disabled {
      background-color: var(--color-surface-disabled);
      color: var(--color-text-disabled);
      cursor: not-allowed;
    }

    &::placeholder {
      color: var(--color-text-tertiary);
    }
  }

  /* Custom scrollbars */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-surface-secondary);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-border-secondary);
    border-radius: 4px;
    transition: background 0.2s ease;

    &:hover {
      background: var(--color-text-tertiary);
    }
  }

  ::-webkit-scrollbar-corner {
    background: var(--color-surface-secondary);
  }

  /* Firefox scrollbars */
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--color-border-secondary) var(--color-surface-secondary);
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  *:focus:not(:focus-visible) {
    outline: none;
  }

  *:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  /* Selection styles */
  ::selection {
    background-color: color-mix(in srgb, var(--color-interactive-primary) 30%, transparent);
    color: var(--color-text-primary);
  }

  ::-moz-selection {
    background-color: color-mix(in srgb, var(--color-interactive-primary) 30%, transparent);
    color: var(--color-text-primary);
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