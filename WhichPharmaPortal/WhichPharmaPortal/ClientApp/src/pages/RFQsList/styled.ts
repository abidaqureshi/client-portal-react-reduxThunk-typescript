import styled from "styled-components";
import { Typography, TypographyProps } from "@material-ui/core";
import { RFQState } from "../../models/RFQState";

export const RFQItemActionsPanel = styled.div`
    display: flex;
    align-items: center;

    & > * {
        margin: var(--spacer-XS);
    }

    .state {
        margin-left: var(--spacer-S);
    }
`;

export const StateLabel = styled(Typography)<TypographyProps & { $rfqState: RFQState }>`
    color: ${props => props.$rfqState === RFQState.Open ? props.theme.colors.RBGreen : props.theme.colors.grey};
`;

export const PaginationContainer = styled.div`
    display: flex;
    justify-content: center;
`;