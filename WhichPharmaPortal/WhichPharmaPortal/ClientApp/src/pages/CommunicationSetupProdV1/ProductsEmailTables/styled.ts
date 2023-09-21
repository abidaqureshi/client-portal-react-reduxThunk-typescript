import styled from "styled-components";
import { Typography, TypographyTypeMap } from "@material-ui/core";
import { DefaultComponentProps } from "@material-ui/core/OverridableComponent";

export const SendingToParagraph = styled(Typography)<DefaultComponentProps<TypographyTypeMap>>`
    width: 100%;
    margin-bottom: ${({theme}) => theme.metrics.space.s};

    > li {
        margin-left: ${({theme}) => theme.metrics.space.s};
    }
`;

export const ScrollableContainer = styled.div`
    width: 100%;
    overflow: auto;
`;