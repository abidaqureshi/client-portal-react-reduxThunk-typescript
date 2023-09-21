import styled from "styled-components";

export const NumericList = styled.ol`
    counter-reset: item;
`;

export const ListItem = styled.li`
    before { 
        content: counters(item, ".") " "; 
        counter-increment: item 
    }
`;