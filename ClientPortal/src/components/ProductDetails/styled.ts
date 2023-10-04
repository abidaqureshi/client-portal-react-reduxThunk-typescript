import styled from 'styled-components';
import { breakpoints } from '../../app/Mixins/breakpoints';

export const ProductDetailsContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
`;

export const ProductDetailsColumn = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    flex-direction: column;

    @media ${breakpoints.md} {
        width: 50%;
    }
`;

export const ProductField = styled.div`
    width: 100%;
    margin: ${({ theme }) => theme.metrics.space.xs};

    > :first-child {
        margin-right: ${({ theme }) => theme.metrics.space.xs};
    }
`;
export const Box2 = styled.div`
    background-color: #20c19e;
    font-weight: 700;

    > :first-child {
        margin-right: ${({ theme }) => theme.metrics.space.xs};
    }
`;
