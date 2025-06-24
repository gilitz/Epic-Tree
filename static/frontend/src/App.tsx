import React from 'react';
import styled from 'styled-components';
import { VerticalTreeChart } from './components/charts/vertical-tree-chart';
import { ParentSize } from "@visx/responsive";
import { OptimisticUpdatesProvider } from './contexts/optimistic-updates-context';
import { FilterProvider } from './contexts/filter-context';
import { ThemeProvider } from './theme/theme-context';
import { GlobalStyle } from './theme/global-styles';
import '@atlaskit/css-reset';

interface ParentSizeProps {
  width: number;
  height: number;
}

const AppContent: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <ParentSize>
          {(parent: ParentSizeProps) => (
            <VerticalTreeChart 
              width={parent.width} 
              height={Math.max(parent.height, 300)} 
            />
          )}	
        </ParentSize>
      </AppContainer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider initialTheme={true}>
      <FilterProvider>
        <OptimisticUpdatesProvider>
          <AppContent />
        </OptimisticUpdatesProvider>
      </FilterProvider>
    </ThemeProvider>
  );
};

export default App;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  position: relative;
  border: 1px solid var(--color-border-container);
  border-radius: var(--border-radius-container);
  transition: border-color 0.3s ease;
  overflow: hidden;
  max-width: 100vw;
  box-sizing: border-box;
`; 