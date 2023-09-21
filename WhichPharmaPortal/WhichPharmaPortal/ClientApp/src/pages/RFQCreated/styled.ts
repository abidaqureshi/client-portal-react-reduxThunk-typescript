
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import styled from 'styled-components';
import { Typography, TypographyProps } from '@material-ui/core';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

export const SuccessPanel = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const WarningIcon = styled(ErrorOutlineIcon)`
    fill: ${({theme}) => theme.colors.warning};
    height: 5rem;
    width: 5rem;
`;

export const SuccessIcon = styled(CheckCircleOutlineIcon)`
    fill: ${({theme}) => theme.colors.RBGreen};
    height: 5rem;
    width: 5rem;
`;

export const SuccessParagraph = styled.div`
    display: flex;
    align-items: center;
    margin-top: ${({theme}) => theme.metrics.space.m};
    margin-bottom: ${({theme}) => theme.metrics.space.xl};

    > * + * {
        margin-left: ${({theme}) => theme.metrics.space.s}
    }
`;

export const SenderParagraph = styled(Typography)<TypographyProps>`
    margin-bottom: ${({theme}) => theme.metrics.space.m};
`;