import React from 'react';
import { useFetchLabels } from './hooks/use-fetch-labels';
import { VerticalTreeChart } from './components/charts/vertical-tree-chart';
import { ParentSize } from "@visx/responsive";
import '@atlaskit/css-reset';
import Button from '@atlaskit/button/new';
import Tooltip from '@atlaskit/tooltip';

function App() {
	// const { labels } = useFetchLabels();

	// if (!labels) {
	// 	return <div>Loading...</div>;
	// }
 
	return (
		<div>
				<Tooltip content="This is a tooltip">

			<Button>Hello world</Button></Tooltip>
			{/* <div>{labels.map(label => <div key={label}>{label}</div>)}</div> */}
			{/* <Tree /> */}
			{/* <TreeChart width={400} height={400} /> */}
			<ParentSize>
				{(parent) => (
					<VerticalTreeChart width={parent.width} height={250} />
				)}	
			</ParentSize>
		</div>
	);
}

export default App;
