import Tippy from "@tippyjs/react";
import styled from "styled-components";

export const Tooltip = ({ content, interactive, disabled, children }) => {
	return (
		<Tippy delay={[300, 100]}
			appendTo={document.body}
			animation={false}
			disabled={disabled}
			interactive={interactive}
			zIndex={999999}
			content={<TooltipBox>{content}</TooltipBox>}>
			{children}
		</Tippy >
	)
}

const TooltipBox = styled.div`
	min-width: fit-content;
	display: flex;
	flex-wrap: wrap;
	background-color: red;
	padding: 4px 8px;
	border-radius: 8px;
	color: blue;
`;