import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';
const resolver = new Resolver();


resolver.define('fetchLabels', async (req) => {
	const key = req.context.extension.issue.key;

	const res = await api.asUser().requestJira(route`/rest/api/3/issue/${key}?fields=labels`);

	const data = await res.json();
	const label = data.fields.labels;

	if (label == undefined) {
		console.warn(`${key}: Failed to find labels`);
		return [];
	}

	return label;
});


resolver.define('fetchIssueById', async (data) => {
	const res = await api.asUser().requestJira(route`/rest/api/3/issue/${data.payload.issueId}`);
  
	const result = await res.json();
  
	return result;
});

resolver.define('fetchIssuesByEpicId', async (data) => {
	const jql = `parent=${data.payload.epicId}`;
	const res = await api.asUser().requestJira(route`/rest/api/3/search?jql=${jql}`);
	// const res = await api.asUser().requestJira(route`/rest/api/3/search`); // fetch all issues
  
	const result = await res.json();
  
	return result;
});

export const handler = resolver.getDefinitions();
