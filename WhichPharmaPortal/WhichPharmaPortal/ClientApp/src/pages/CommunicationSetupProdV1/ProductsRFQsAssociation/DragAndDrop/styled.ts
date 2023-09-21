import styled from "styled-components";
import { Card, CardProps, Chip, ChipProps } from "@material-ui/core";

interface Draggable {
    $isDraggingOver: boolean,
}

export const RFQCard = styled(Card)<CardProps & Draggable>`
    background: ${p => p.$isDraggingOver ? p.theme.colors.lightRBGreen : 'unset'};
    width: 100%;
    padding: ${({theme}) => theme.metrics.space.xs};
    margin: ${({theme}) => theme.metrics.space.xs} 0;
    & > * + * {
        margin-top: ${({theme}) => theme.metrics.space.xxs};
        width: 100%;
    }
`;

export const ProductChip = styled(Chip)<ChipProps>`
    justify-content: space-between;
    padding-left: ${(props) => props.theme.metrics.space.xs};
`;
