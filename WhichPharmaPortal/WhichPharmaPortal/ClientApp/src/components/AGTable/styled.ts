import { Paper, PaperProps } from '@material-ui/core';
import styled from 'styled-components';

export const GridPaper = styled(Paper)<PaperProps>`
height: 400, width: 600
`;

export const PaginationWrapper = styled.div`
    display: flex;
    justify-content: end;
    width: 100%;
`;
