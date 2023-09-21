import styled from 'styled-components';

export const StikyDiv = styled.div`
    position: sticky;
    top: 0;
`;

export const RFQHeader = styled.div`
    & > * + * {
        margin-top: ${({ theme }) => theme.metrics.space.s};
    }
`;

export const RFQLabel = styled.label`
    margin: 1px 5px 0px 0px;
`;
