import { Button, ButtonProps, Typography, TypographyProps } from '@material-ui/core';
import styled from 'styled-components';
import { breakpoints } from '../../app/Mixins/breakpoints';
import TextInput, { TextInputProps } from '../../components/inputs/TextInput';

interface DnD {
    $isDraggingOver: boolean;
}

export const WhiteButton = styled(Button)<ButtonProps>`
    color: white;
`;

export const ColumnsPanel = styled.div`
    display: flex;
    flex-direction: column;
    width: ${({ theme }) => `calc(100% + 2 * ${theme.metrics.space.xs})`};
    margin-left: -${({ theme }) => theme.metrics.space.xs};

    @media ${breakpoints.md} {
        flex-direction: row;
    }
`;

export const QuotesColumn = styled.div<{ widthPercentage: number }>`
    width: 100%;
    height: fit-content;
    min-height: 300px;
    margin: ${({ theme }) => theme.metrics.space.xs};
    padding: ${({ theme }) => theme.metrics.space.xs};
    border-radius: ${({ theme }) => theme.metrics.border.radius};
    background: ${({ theme }) => theme.colors.vLightGrey};
    overflow: visible;
    padding: 0;

    @media ${breakpoints.md} {
        width: ${(props) => props.widthPercentage}%;
        max-width: unset;
        margin: 0 ${({ theme }) => theme.metrics.space.xs};
    }
`;

export const QuotesBoxesContainer = styled.div<DnD>`
    height: 100%;
    padding: ${({ theme }) => theme.metrics.space.xs};
    overflow: auto;
    flex-grow: 1;
    background: ${(p) => (p.$isDraggingOver ? '#e4eded' : 'unset')};

    > * + * {
        margin-top: ${({ theme }) => theme.metrics.space.xs};
    }
`;

export const QuoteColumnTitle = styled(Typography)<TypographyProps>`
    padding: ${({ theme }) => theme.metrics.space.s};
    padding-bottom: ${({ theme }) => theme.metrics.space.xxs};
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: ${({ theme }) => theme.colors.vLightGrey};
    border-radius: ${({ theme }) => theme.metrics.border.radius};
`;

export const WhiteTypography = styled(Typography)<TypographyProps>`
    color: ${({ theme }) => theme.colors.white};
`;

export const FiltersContainer = styled.div`
    position: absolute;
    background-color: ${({ theme }) => theme.colors.white};
    top: 150px;
    z-index: 100000000;
    width: 30%;
    padding: 5px;
    border: 1px solid ${({ theme }) => theme.colors.lightGrey};
    border-radius: 5px;
`;
