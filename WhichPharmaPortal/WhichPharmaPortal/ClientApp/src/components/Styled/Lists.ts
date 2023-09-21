import styled from 'styled-components';

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const ListItem = styled.li`
    width: 100%;
    padding: ${({theme}) => theme.metrics.space.xs} ${({theme}) => theme.metrics.space.s};
    font-family: ${({theme}) => theme.typography.fontFamily};
    font-size: ${({theme}) => theme.typography.fontSizeBase};
`;

export { List, ListItem };
export default null;
