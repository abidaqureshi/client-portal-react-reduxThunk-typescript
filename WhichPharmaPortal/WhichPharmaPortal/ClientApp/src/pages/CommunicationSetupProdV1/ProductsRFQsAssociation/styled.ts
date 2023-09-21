import styled from "styled-components";

export const StikyDiv = styled.div`
    position:sticky;
    top:0;
`;

export const RFQHeader = styled.div`
    & > * + * {
        margin-top: ${({theme}) => theme.metrics.space.s};
    }
`;