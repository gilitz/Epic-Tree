import React from 'react';
import styled from 'styled-components';
import { useFetchIssuesByEpicId } from '../hooks/use-fetch-issues-by-epic';
import { useFetchIssueById } from '../hooks/use-fetch-issue-by-id';

export const Tree = ({ epicId = 'ET-2' }) => {
	const { issuesByEpic } = useFetchIssuesByEpicId({ epicId });
	const { issue: rootEpicIssue } = useFetchIssueById({ issueId: epicId });
	console.log('Epic Node:', rootEpicIssue);
	return (
		<div>
			<EpicNode {...rootEpicIssue} epicKey={rootEpicIssue.key}/>
			<div>{issuesByEpic.map(issue => <TaskNode {...issue} key={issue.id} issueKey={issue.key} />)}</div>
		</div>
	);
};

const TaskNode = ({ type, issueKey, id, fields,...props }) => {
	return (
		<Node {...props} data-type={NODE_TYPES.TASK}>{issueKey}</Node>
	);
};

const EpicNode = ({ epicKey, data, ...props }) => {
	return (
		<Node {...props} data-type={NODE_TYPES.EPIC}>{epicKey}</Node>
	);
};

export const NODE_TYPES = {
	EPIC: 'Epic',
	TASK: 'Task'
};

const Node = styled.div`
	width: 80px;
	height: 80px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	border-radius: 100%;
	background-color: green;
	border: 1px solid black;
	text-align: center;

	&[data-type=${NODE_TYPES.EPIC}] {
		background-color: purple;
	}
`;

