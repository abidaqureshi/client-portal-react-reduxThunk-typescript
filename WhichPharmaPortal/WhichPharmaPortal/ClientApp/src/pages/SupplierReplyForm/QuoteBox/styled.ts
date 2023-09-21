import { Card, CardProps, Link, LinkProps, Typography, TypographyProps } from '@material-ui/core';
import styled from 'styled-components';

export const QuoteBoxCard = styled(Card)<CardProps>`
    padding: ${({ theme }) => theme.metrics.space.xs} ${({ theme }) => theme.metrics.space.s};
`;

export const ProductNameRow = styled(Link)<LinkProps>`
    display: block;
    cursor: pointer;
`;

export const ActiveSubstancesRow = styled(Typography)<TypographyProps>`
    display: block;
    color: #aaaaaa;
    margin-bottom: ${({ theme }) => theme.metrics.space.xs};
`;

export const WeAcceptRow = styled.span`
    display: block;
    text-decoration: underline;
    color: #000000;
`;

export const IconsRow = styled.div`
    display: flex;
    margin-bottom: ${({ theme }) => theme.metrics.space.xs};

    > * + * {
        margin-left: ${({ theme }) => theme.metrics.space.s};
    }
`;

export const LastRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
`;

export const EndingDateContainer = styled(Typography)<TypographyProps>`
    display: inline;
    font-size: 0.7rem;
`;

export const RFQNrContainer = styled(Typography)<TypographyProps>`
    display: inline-flex;

    > * + * {
        margin-left: ${({ theme }) => theme.metrics.space.xxs};
    }
`;
