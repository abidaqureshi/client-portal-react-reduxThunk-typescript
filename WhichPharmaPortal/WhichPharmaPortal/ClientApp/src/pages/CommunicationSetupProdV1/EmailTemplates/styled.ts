import styled from "styled-components";
import { TextField, TextFieldProps, IconButton, IconButtonProps } from "@material-ui/core";

export const EmailContentTextField = styled(TextField)<TextFieldProps>`
    width: 100%;
`;

export const BookmarkIconButton = styled(IconButton)<IconButtonProps>`
    position: absolute;
    z-index: 999;
    right: ${({theme}) => theme.metrics.space.s};
`;