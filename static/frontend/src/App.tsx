import React from 'react';
import styled from 'styled-components';
import { VerticalTreeChart } from './components/charts/vertical-tree-chart';
import { ParentSize } from "@visx/responsive";
import { OptimisticUpdatesProvider } from './contexts/optimistic-updates-context';
import '@atlaskit/css-reset';

interface ParentSizeProps {
  width: number;
  height: number;
}

const App: React.FC = () => {
  return (
    <OptimisticUpdatesProvider>
      <AppContainer>
        <ParentSize>
          {(parent: ParentSizeProps) => (
            <VerticalTreeChart width={parent.width} height={250} />
          )}	
        </ParentSize>
      </AppContainer>
    </OptimisticUpdatesProvider>
  );
};

export default App;

const AppContainer = styled.div`
  display: block;
`; 