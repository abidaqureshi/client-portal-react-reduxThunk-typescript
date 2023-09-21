import styled from "styled-components";

export const LoadingContainer = styled.div<{isLoading: boolean}>`
    position: absolute;
    display: ${props => props.isLoading ? 'block' : 'none'};
    margin-left: auto;
    margin-right: ${({theme}) => theme.metrics.space.m};
    right: 0;
    top: 0;
`;

export const LoadingGif = styled.img`
    height: 3rem;
`;