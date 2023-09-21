import { Chip, ChipProps } from '@material-ui/core';
import styled from 'styled-components';

export const StatusChip = styled(Chip)<ChipProps & { $size: 'small' | 'medium' | 'big' }>`
    width: ${(props) => (props.$size === 'small' ? '1.5rem' : props.$size === 'medium' ? '5rem' : '10rem')};
    height: ${(props) => (props.$size === 'small' ? '1.5rem' : props.$size === 'medium' ? '1.4rem' : '2rem')};
    font-weight: 700;
    color: white;
    margin-top: 0px;
`;
