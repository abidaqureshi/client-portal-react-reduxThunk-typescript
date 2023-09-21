import styled from 'styled-components';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { IconButton as MUIIconButton } from '@material-ui/core';

interface CommonProps extends React.HTMLProps<HTMLDivElement> {
    $isOpen?: boolean;
}

export const SearchContainerDiv = styled.div`
    ${(props): string => `
        width: 100%;
        padding: ${props.theme.metrics.space.xl} ${props.theme.metrics.space.s} 0;
        margin-bottom: ${props.theme.metrics.space.s};
        text-align: left;
        position: relative;
        background: whitesmoke;
        border-radius: ${props.theme.metrics.border.radius};
    `}
`;

export const Title = styled.h6`
    text-transform: uppercase;
    margin-top: ${(props): string => props.theme.metrics.space.xs};

    font-weight: ${(props): number => props.theme.typography.weights.regular};
    color: ${(props): string => props.theme.colors.RBGreen};
    text-align-last: justify;

    &:before {
        content: '/\/\/';
        color: ${(props): string => props.theme.colors.RBGreen};
        margin-right: ${(props): string => props.theme.metrics.space.xs};
        position: relative;
        top: 0;
        left: 0;
    }
`;

export const ExpandableHeader = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    font-size: ${(props): string => props.theme.typography.fontXXS};
    line-height: ${(props): string => props.theme.typography.lineHeightXS};
    text-transform: uppercase;
    color: ${(props): string => props.theme.colors.grey};
    margin: ${(props): string => props.theme.metrics.space.s} 0;
    transition: color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    cursor: pointer;
    &:before,
    &:after {
        content: '';
        height: 1px;
        flex-grow: 1;
        background-color: #dedede;
    }
    &:before {
        left: 0;
    }
    &:after {
        right: 0;
    }
    > div {
        display: inline-block;
        width: auto;
        padding: 6px ${(props): string => props.theme.metrics.space.xs} 6px
            ${(props): string => props.theme.metrics.space.s};
        border-radius: ${(props) => props.theme.metrics.border.radius};
        background: transparent;
    }
    &:hover {
        color: ${(props): string => props.theme.colors.darkGreen};
        > div {
            box-shadow: 0px 0px 12px -6px rgba(0, 0, 0, 0.75);
            background: #f8f8f8;
        }
    }
`;

export const ExpandableContainer = styled.div<CommonProps>`
    height: ${(props): string => (props.$isOpen ? 'auto' : '0')};
    visibility: ${(props): string => (props.$isOpen ? 'auto' : 'hidden')};
    min-height: 0;
    margin-top: 15px;
    width: 95%;
    transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`;

export const NotificationIcon = styled.div<CommonProps>`
    display: inline-block;
    vertical-align: middle;
    height: 10px;
    width: 10px;
    margin: 0 ${({ theme }) => theme.metrics.space.xs};
    border-radius: 10px;
    background-color: ${({ theme }) => theme.colors.RBGreen};
`;

export const ExpandIcon = styled(ExpandMoreIcon)<CommonProps>`
    ${(props): string => {
        const openValue = props.$isOpen ? '180deg' : '0';
        return `transform: rotate(${openValue});`;
    }};
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`;

export const IconButton = styled(MUIIconButton)`
    height: 1rem;
    width: 1rem;
`;
