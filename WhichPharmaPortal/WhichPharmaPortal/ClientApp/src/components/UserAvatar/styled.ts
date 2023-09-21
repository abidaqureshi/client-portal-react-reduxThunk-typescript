import styled from "styled-components";

export const UserItemContainer = styled.div<{size: 'small'|'large', addRightMargin: boolean}>`
    display: flex;

    > :first-child {
        ${props => !props.addRightMargin ? '' : `margin-right: ${props.size === "small" ? props.theme.metrics.space.xs : props.theme.metrics.space.s};`}
        height: ${props => props.size === "small" ? '1.5rem' : '2.8rem'};
        width: ${props => props.size === "small" ? '1.5rem' : '2.8rem'};
    }
`;