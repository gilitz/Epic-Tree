import React from 'react';
import styled from 'styled-components';
import { VerticalTreeChart } from './components/charts/vertical-tree-chart';
import { ParentSize } from "@visx/responsive";
import '@atlaskit/css-reset';

interface ParentSizeProps {
  width: number;
  height: number;
}

const App: React.FC = () => {
  return (
    <AppContainer>
      <ParentSize>
        {(parent: ParentSizeProps) => (
          <VerticalTreeChart width={parent.width} height={250} />
        )}	
      </ParentSize>
    </AppContainer>
  );
};

export default App;

const AppContainer = styled.div`
  display: block;
`; 