import styled from "styled-components";
import { SelectProps, Select } from "@material-ui/core";

export const UserSelect = styled(Select)<SelectProps>`
    > :first-child {
        padding-top: ${({theme}) => theme.metrics.space.xs};
        padding-bottom: ${({theme}) => theme.metrics.space.xs};
    }
`;