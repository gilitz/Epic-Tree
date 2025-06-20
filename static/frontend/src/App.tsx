import React from 'react';
import styled from 'styled-components';
import { VerticalTreeChart } from './components/charts/vertical-tree-chart';
import { ParentSize } from "@visx/responsive";
import { OptimisticUpdatesProvider } from './contexts/optimistic-updates-context';
import { ThemeProvider, useTheme } from './theme/theme-context';
import { GlobalStyle } from './theme/global-styles';
import '@atlaskit/css-reset';

interface ParentSizeProps {
  width: number;
  height: number;
}

const AppContent: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <>
      <GlobalStyle colors={colors} />
      <AppContainer>
        <ParentSize>
          {(parent: ParentSizeProps) => (
            <VerticalTreeChart width={parent.width} height={250} />
          )}	
        </ParentSize>
      </AppContainer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider initialTheme={true}>
      <OptimisticUpdatesProvider>
        <AppContent />
      </OptimisticUpdatesProvider>
    </ThemeProvider>
  );
};

export default App;

const AppContainer = styled.div`
  display: block;
  width: 100%;
  height: 100vh;
  position: relative;
`; 