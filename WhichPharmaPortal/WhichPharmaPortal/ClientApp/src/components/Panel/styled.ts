import styled from 'styled-components';
import { Paper, PaperProps, IconButton, IconButtonProps } from '@material-ui/core';

export const PanelContainer = styled(Paper)<PaperProps>`
    position: relative;
    padding: var(--spacer-S);
    width: 100%;
    background-color: white;

    & > * {
        margin-top: var(--spacer-S);
    }

    .subtitle {
        font-style: italic;
    }
`;

export const OptionsIconButton = styled(IconButton)<IconButtonProps>`
    position: absolute;
    z-index: 999;
    right: 0;
`;

export const PanelButtonsContainer = styled.div<{ nomargin?: boolean }>`
    margin-top: ${(props) => (props.nomargin ? 0 : props.theme.metrics.space.s)};
    margin-right: ${(props) => (props.nomargin ? 0 : props.theme.metrics.space.s)};
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    border-radius: 12px;
    > * {
        margin-left: ${({ theme }) => theme.metrics.space.s};
    }
`;

export const PanelButtonsContainerKanban = styled.div<{ nomargin?: boolean }>`
    margin-top: ${(props) => (props.nomargin ? 0 : props.theme.metrics.space.s)};
    margin-right: ${(props) => (props.nomargin ? 0 : props.theme.metrics.space.s)};
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 12px;
    > * {
        margin-left: ${({ theme }) => theme.metrics.space.s};
    }
`;
