import { Button, ButtonProps, GridProps, Grid } from "@material-ui/core";
import styled from "styled-components";

export const ExpandableContainer = styled(Grid)<GridProps>`
    margin-bottom: ${(props): string => props.theme.metrics.space.m};
`;

export const SearchButton = styled(Button)<ButtonProps>`
    width: 100%
`;
