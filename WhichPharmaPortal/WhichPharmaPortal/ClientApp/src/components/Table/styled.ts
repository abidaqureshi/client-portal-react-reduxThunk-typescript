import { Paper, PaperProps } from '@material-ui/core';
import styled from 'styled-components';

export const GridPaper = styled(Paper)<PaperProps>`
    
    tbody {
        td {
            padding-top: unset;
            padding-bottom: unset;
            height: 3rem;

            & > * {
                padding: unset;
            }
        }
    }
`;
