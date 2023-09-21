import styled from 'styled-components';

export const PriceTitle = styled('h6')`
    display: inline-block;
    font-size: 1.25rem;
    margin-left: 1rem;
`;

export const PriceList = styled('ul')`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
`;

export const PriceListItem = styled('li')`
    width: 100%;
    padding-bottom: 0.5rem;
    margin-bottom: 0.2rem;
    border-bottom: 1px solid #424242;
    display: flex;
    flex-direction: column;
    font-size: 0.75rem;
    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
`;

export const PriceCaption = styled('span')`
    font-variant: small-caps;
    font-size: 0.75rem;
`;
