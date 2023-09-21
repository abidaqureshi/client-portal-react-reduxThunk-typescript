import { IconButton, IconButtonProps } from "@material-ui/core";
import styled from "styled-components";

const ToggleIconButton = styled(IconButton)<IconButtonProps & {selected: boolean}>`
    background: ${props => props.selected ? props.theme.colors.lightGrey : 'unset'};
`; 

export default ToggleIconButton;