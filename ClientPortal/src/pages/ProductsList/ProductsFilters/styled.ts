import { Button, ButtonProps, GridProps, Grid } from '@material-ui/core';
import styled from 'styled-components';

export const ExpandableContainer = styled(Grid)<GridProps>`
    margin-bottom: ${(props): string => props.theme.metrics.space.s};
`;
interface ISearchButton extends ButtonProps {
    width?: string;
}

export const SearchButton = styled(Button)<ISearchButton>`
    width: ${(props) => (props.width ? props.width : 10)}%;
    margin: 5px;
`;

export const RbButton = styled(Button)<ISearchButton>`
    width: ${(props) => (props.width ? props.width : 10)}rem;
    margin: 5px;
`;
