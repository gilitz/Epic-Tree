import React from 'react';
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
  //   return <div>Loading...</div>;
  // }

  return (
    <div>
      <Tooltip content="This is a tooltip">
        <Button>Hello world</Button>
      </Tooltip>
      {/* <div>{labels.map(label => <div key={label}>{label}</div>)}</div> */}
      {/* <Tree /> */}
      {/* <TreeChart width={400} height={400} /> */}
      <ParentSize>
        {(parent: ParentSizeProps) => (
          <VerticalTreeChart width={parent.width} height={250} />
        )}	
      </ParentSize>
    </div>
  );
};

export default App; 