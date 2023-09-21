import styled from "styled-components";
import { Alert, AlertProps } from "@material-ui/lab";

export const CopyNotification = styled(Alert)<AlertProps>`
    position: absolute;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 0;
    text-align: center;
`;