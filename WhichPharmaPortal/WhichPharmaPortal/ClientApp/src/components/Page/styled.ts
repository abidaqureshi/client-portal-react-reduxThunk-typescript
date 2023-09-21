import styled from 'styled-components';
import { Typography, TypographyProps, Button, ButtonProps } from '@material-ui/core';
import { breakpoints } from '../../app/Mixins/breakpoints';

export const PageContainer = styled.div`
    min-width: 100%;
    min-height: 100%;
    padding: ${({ theme }) => theme.metrics.space.s};

    & > * {
        margin-bottom: var(--spacer-S);
    }
`;

export const PageHeader = styled.div`
    display: flex;
    margin-bottom: ${({ theme }) => theme.metrics.space.m};
    flex-direction: column;
    align-items: normal;
    padding-top: 60px;
    @media ${breakpoints.sm} {
        align-items: center;
        flex-direction: row;
    }
`;

export const Title = styled(Typography)<TypographyProps>`
    -webkit-text-stroke: medium;
    -webkit-text-decoration: ${({ theme }) => theme.colors.RBGreen} solid underline;
    text-decoration: ${({ theme }) => theme.colors.RBGreen} solid underline;
`;

export const Spacer = styled.span`
    flex-grow: 1;
`;

export const BackButton = styled(Button)<ButtonProps>`
    min-width: 0;
`;

export const PageActionPanel = styled.div`
    display: flex;
    justify-content: right;
    > * + * {
        margin-left: ${({ theme }) => theme.metrics.space.xs};
    }
`;
