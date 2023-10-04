
import { Grid, GridTypeMap } from '@material-ui/core';
import styled from 'styled-components';
import { DefaultComponentProps } from '@material-ui/core/OverridableComponent';

export const FormContainer = styled(Grid)<DefaultComponentProps<GridTypeMap>>`
    max-width: ${({theme}) => theme.metrics.breakpoints.md}px;
    padding-bottom: ${({theme}) => theme.metrics.space.s};
    width: 100%;
`;