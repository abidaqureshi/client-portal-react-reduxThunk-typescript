import styled from 'styled-components';
import { breakpoints } from '../../app/Mixins/breakpoints';
import {
    Typography,
    TypographyTypeMap,
    AccordionDetails,
    AccordionDetailsProps,
    AccordionProps,
    AccordionSummary,
} from '@material-ui/core';
import { DefaultComponentProps } from '@material-ui/core/OverridableComponent';

export const AccordionHeader = styled(AccordionSummary)<AccordionProps & { $isExpanded: boolean }>`
    background-color: ${(p) => (p.$isExpanded ? p.theme.colors.lightGrey : 'unset')};
    padding: 0 ${({ theme }) => theme.metrics.space.s};
    border-radius: ${({ theme }) => theme.metrics.border.radius};
    margin-bottom: ${(p) => (p.$isExpanded ? p.theme.metrics.space.s : 0)};
`;

export const ItemHeader = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    cursor: ${(props) => (props.onClick ? 'pointer' : 'unset')};
    :hover {
        background-color: ${(props) => (props.onClick ? props.theme.colors.lightGrey : 'inherit')};
    }
    & > * {
        flex-grow: 0;
        margin-right: var(--spacer-S);
    }
`;

export const ItemSummary = styled(Typography)<DefaultComponentProps<TypographyTypeMap>>`
    margin-left: var(--spacer-S);
    opacity: 0.8;
`;

export const Spacer = styled.span`
    flex-grow: 1;
`;

export const DetailsContainer = styled(AccordionDetails)<AccordionDetailsProps>`
    display: flex;
    flex-wrap: wrap;
    padding-top: 0;
    > * {
        width: 100%;
        @media ${breakpoints.md} {
            width: 50%;
        }
        @media ${breakpoints.xl} {
            width: 33%;
        }
    }
`;
