import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { events, invoke } from '@forge/bridge';

interface Label {
  id: string;
  name: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<Label[] | null>(null);

  const handleFetchSuccess = (data: unknown) => {
    const labels = data as Label[];
    setData(labels);
    if (labels.length === 0) {
      throw new Error('No labels returned');
    }
  };
  
  const handleFetchError = () => {
    console.error('Failed to get label2');
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
  
  if (!data) {
    return <LoadingContainer>Loading...</LoadingContainer>;
  }
  
  const labels = data.map((label) => <LabelItem key={label.id}>{label.name}</LabelItem>);
  
  return (
    <AppContainer>
      <LabelTitle>Issue labels3222:</LabelTitle>
      <LabelsContainer>{labels}</LabelsContainer>
    </AppContainer>
  );
};

export default App;

// Styled Components
const AppContainer = styled.div`
  display: block;
`;

const LoadingContainer = styled.div`
  display: block;
`;

const LabelTitle = styled.span`
  display: inline;
`;

const LabelsContainer = styled.div`
  display: block;
`;

const LabelItem = styled.div`
  display: block;
`; 