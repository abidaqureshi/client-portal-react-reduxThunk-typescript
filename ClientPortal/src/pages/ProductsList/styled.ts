import styled from 'styled-components';
import colors from '../../theme/colors';

export const DialogTitleContainer = styled.div`
    display: inline-flex;
    background-color: ${colors.brightGreen};
    padding: 30px 20px 15px;
    font-weight: 200;
    color: ${colors.textRBGreen};
    width: 100%;
`;

export const CloseIconWrapper = styled.div`
    position: absolute;
    right: 0px;
    top: 0px;
`;
