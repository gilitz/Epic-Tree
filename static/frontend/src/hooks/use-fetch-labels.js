import  { useEffect, useState } from 'react';
import { events, invoke } from '@forge/bridge';

export const useFetchLabels = () => {
	const [labels, setLables] = useState([]);

	const handleFetchSuccess = (data) => {
		setLables(data);
		console.log('labels after fetch: ', data);
		if (data.length === 0) {
			throw new Error('No labels returned');
		}
	};

	const handleFetchError = (error) => {
		console.error('Failed to get label11', error);
	};

	useEffect(() => {
		const fetchLabels = async () => invoke('fetchLabels');
		fetchLabels().then(handleFetchSuccess).catch(handleFetchError);

		const subscribeForIssueChangedEvent = () =>
			events.on('JIRA_ISSUE_CHANGED', () => {
				fetchLabels().then(handleFetchSuccess).catch(handleFetchError);
			});
		const subscription = subscribeForIssueChangedEvent();

		return () => {
			subscription.then((subscription) => subscription.unsubscribe());
		};
	}, []);

	return { labels };
};