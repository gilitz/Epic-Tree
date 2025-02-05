import  { useEffect, useState } from 'react';
import { events, invoke } from '@forge/bridge';

export const useFetchIssueById = ({ issueId }) => {
	const [issue, setIssue] = useState([]);
	
	const handleFetchSuccess = (data) => {
		setIssue(data);
		if (data.length === 0) {
			throw new Error('No issues for this epic returned');
		}
	};

	const handleFetchError = (error) => {
		console.error('Failed to get issue by epic', error);
	};

	useEffect(() => {
		const fetchIssueById = async () => invoke('fetchIssueById', { issueId });
		fetchIssueById().then(handleFetchSuccess).catch(handleFetchError);

		const subscribeForIssueChangedEvent = () =>
			events.on('JIRA_ISSUE_CHANGED', () => {
				fetchIssueById().then(handleFetchSuccess).catch(handleFetchError);
			});
		const subscription = subscribeForIssueChangedEvent();
		
		return () => {
			subscription.then((subscription) => subscription.unsubscribe());
		};
	}, []);

	return { issue };
};