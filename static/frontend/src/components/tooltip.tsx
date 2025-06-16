import React, { ReactNode, ReactElement } from 'react';
import { createPortal } from 'react-dom';
import TippyImport from "@tippyjs/react";
import styled from "styled-components";

const Tippy = TippyImport as any;

interface TooltipProps {
  content: ReactNode;
  interactive?: boolean;
  disabled?: boolean;
  children: ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, interactive, disabled, children }) => {
  const rootElement = document.getElementById('root');
  
  return (
    <Tippy 
      delay={[300, 100]}
      appendTo={() => rootElement || document.body}
      animation={false}
      disabled={disabled}
      interactive={interactive}
      zIndex={999999}
      content={<TooltipBox>{content}</TooltipBox>}
      boundary="viewport"
      placement="auto"
    >
      {children}
    </Tippy>
  );
};

const TooltipBox = styled.div`
  min-width: fit-content;
  display: flex;
  flex-wrap: wrap;
  background-color: #ffffff;
  border: 1px solid grey;
  border-radius: 8px;
  color: blue;
`; 