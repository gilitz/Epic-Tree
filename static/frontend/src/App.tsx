import React from 'react';
import styled from 'styled-components';
import { useFetchLabels } from './hooks/use-fetch-labels';
import { VerticalTreeChart } from './components/charts/vertical-tree-chart';
import { ParentSize } from "@visx/responsive";
import '@atlaskit/css-reset';
import ButtonImport from '@atlaskit/button/new';
import TooltipImport from '@atlaskit/tooltip';

const Button = ButtonImport as any;
const Tooltip = TooltipImport as any;

interface ParentSizeProps {
  width: number;
  height: number;
}

const App: React.FC = () => {
  // const { labels } = useFetchLabels();

  // if (!labels) {
  //   return <AppContainer>Loading...</AppContainer>;
  // }

  return (
    <AppContainer>
      <Tooltip content="This is a tooltip">
        <Button>Hello world</Button>
      </Tooltip>
      {/* <AppContainer>{labels.map(label => <AppContainer key={label}>{label}</AppContainer>)}</AppContainer> */}
      {/* <Tree /> */}
      {/* <TreeChart width={400} height={400} /> */}
      <ParentSize>
        {(parent: ParentSizeProps) => (
          <VerticalTreeChart width={parent.width} height={250} />
        )}	
      </ParentSize>
    </AppContainer>
  );
};

export default App;

// Styled Components
const AppContainer = styled.div`
  display: block;
`; 