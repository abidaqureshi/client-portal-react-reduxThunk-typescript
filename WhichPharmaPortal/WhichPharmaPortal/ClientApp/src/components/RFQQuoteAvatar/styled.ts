import { Avatar as MUAvatar, AvatarProps, Chip, ChipProps } from '@material-ui/core';
import styled from 'styled-components';
import { getColor } from '.';
import { RFQQuoteState } from '../../models/RFQQuoteState';

interface IBackgroundProps {
    state: RFQQuoteState;
}

export const Avatar = styled(MUAvatar)<AvatarProps & { $size: 'small' | 'big' }>`
    width: ${(props) => (props.$size === 'small' ? '1.5rem' : '3rem')};
    height: ${(props) => (props.$size === 'small' ? '1.5rem' : '3rem')};
`;

export const StatusChip = styled(Chip)<ChipProps & { $size: 'small' | 'medium' | 'big' }>`
    width: ${(props) => (props.$size === 'small' ? '1.5rem' : props.$size === 'medium' ? '5rem' : '10rem')};
    height: ${(props) => (props.$size === 'small' ? '1.5rem' : props.$size === 'medium' ? '1.4rem' : '2rem')};
    font-weight: 700;
    color: white;
    margin-top: 0px;
`;

export const StatusRoundChip = styled.span<IBackgroundProps>`
    height: 22px;
    width: 22px;
    background-color: ${(props) => getColor(props.state)};
    font-weight: 800;
    padding-top: 2px;
    color: #ffffff;
    border-radius: 50%;
    display: inline-block;
`;
