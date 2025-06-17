import React from 'react';
import styled from 'styled-components';

export interface TagProps {
  children: React.ReactNode;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  size?: 'small' | 'medium';
  className?: string;
}

export const Tag: React.FC<TagProps> = ({
  children,
  bgColor,
  borderColor,
  textColor,
  size = 'medium',
  className
}) => {
  return (
    <StyledTag
      $bgColor={bgColor}
      $borderColor={borderColor}
      $textColor={textColor}
      $size={size}
      className={className}
    >
      {children}
    </StyledTag>
  );
};

const StyledTag = styled.span<{
  $bgColor?: string;
  $borderColor?: string;
  $textColor?: string;
  $size: 'small' | 'medium';
}>`
  background-color: ${props => props.$bgColor || '#f0f9ff'};
  color: ${props => props.$textColor || '#0369a1'};
  border: 1px solid ${props => props.$borderColor || '#bae6fd'};
  padding: ${props => props.$size === 'small' ? '2px 6px' : '2px 6px'};
  border-radius: 6px;
  font-size: ${props => props.$size === 'small' ? '10px' : '11px'};
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: inline-block;
  text-align: center;
  
  &:hover {
    opacity: 0.8;
  }
`; 