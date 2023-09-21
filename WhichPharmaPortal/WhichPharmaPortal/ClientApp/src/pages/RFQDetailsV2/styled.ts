import styled from "styled-components";
import { Typography, TypographyProps } from "@material-ui/core";
import { RFQEntryState } from "../../models/RFQEntryState";

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

export const StateLabel = styled(Typography)<TypographyProps & { $rfqEntryState: RFQEntryState }>`
    color: ${props => 
        props.$rfqEntryState === RFQEntryState.Open ? props.theme.colors.RBGreen 
        : props.$rfqEntryState === RFQEntryState.SupplierWaitingReply ? props.theme.colors.error
        : props.theme.colors.grey};
`;