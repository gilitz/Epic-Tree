import React from 'react';
import styled from 'styled-components';

export const LoadingComponent: React.FC = () => (
  <LoadingContainer>
    <LoadingTitle>Loading Epic Tree...</LoadingTitle>
    <LoadingSubtitle>
      Fetching epic and issue data...
    </LoadingSubtitle>
  </LoadingContainer>
);

export const NetworkErrorComponent: React.FC = () => (
  <ErrorContainer>
    <ErrorTitle>⚠️ Network Error</ErrorTitle>
    <ErrorMessage>
      Unable to load epic data. Please check your connection and try refreshing the page.
    </ErrorMessage>
    <ErrorSubtitle>
      Epic ID: ET-2
    </ErrorSubtitle>
  </ErrorContainer>
);

export const LoadingIssuesComponent: React.FC = () => (
  <LoadingContainer>
    <LoadingTitle>Loading Epic Tree...</LoadingTitle>
    <LoadingSubtitle>
      Loading issues for epic...
    </LoadingSubtitle>
  </LoadingContainer>
);

// Styled Components
const LoadingContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const LoadingTitle = styled.div`
  display: block;
`;

const LoadingSubtitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 8px;
`;

const ErrorContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const ErrorTitle = styled.div`
  color: #d32f2f;
  font-weight: bold;
`;

const ErrorMessage = styled.div`
  font-size: 14px;
  margin-top: 8px;
`;

const ErrorSubtitle = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 8px;
`; 