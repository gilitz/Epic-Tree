import  { useEffect, useState } from 'react';
import { events, invoke } from '@forge/bridge';

export const useFetchIssuesByEpicId = ({ epicId }) => {
	const [issues, setIssues] = useState([]);
	
	const handleFetchSuccess = (data) => {
		setIssues(data.issues);
		if (data.length === 0) {
			throw new Error('No issues for this epic returned');
		}
	};

	const handleFetchError = (error) => {
		console.error('Failed to get issue by epic', error);
	};

	useEffect(() => {
		const fetchIssuesByEpicId = async () => invoke('fetchIssuesByEpicId', { epicId });
		fetchIssuesByEpicId().then(handleFetchSuccess).catch(handleFetchError);

		const subscribeForIssueChangedEvent = () =>
			events.on('JIRA_ISSUE_CHANGED', () => {
				fetchIssuesByEpicId().then(handleFetchSuccess).catch(handleFetchError);
			});
		const subscription = subscribeForIssueChangedEvent();
		
		return () => {
			subscription.then((subscription) => subscription.unsubscribe());
		};
	}, []);

	return { issuesByEpic: issues };
};