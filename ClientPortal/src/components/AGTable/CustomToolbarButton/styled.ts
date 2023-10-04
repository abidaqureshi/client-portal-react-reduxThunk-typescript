import styled from "styled-components";
import { IconButton, IconButtonProps } from "@material-ui/core";

export const ColoredIconButton = styled(IconButton)<IconButtonProps & {$iconColor?: 'success'|'error'}>`
    ${props => 
        props.$iconColor === 'success' ? `color: ${props.theme.colors.RBGreen};`
        : props.$iconColor === 'error' ? `color: ${props.theme.colors.error};`
        : ''}
`;