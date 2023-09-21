import { HtmlHTMLAttributes, HTMLProps } from 'react';
import styled from 'styled-components';

interface CircleBoxProps extends HTMLProps<HTMLDivElement> {
    isActive: boolean | undefined;
    lineHeight?: number;
    isShadow?: boolean;
}

const SqaureBox = styled.div`
    width: 10rem;
    height: 4rem;
    background-color: green;
`;


const TriangleBox = styled.div`
    background-color: black;
    width: 1.5rem;
    height: 1.5rem;
    clip-path: polygon(21.1% 25%, 78.9% 25%, 50% 75%);

`;


const CircleBox = styled.div<CircleBoxProps>`
    

    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.75rem;
    ${(props) => (props.lineHeight ? 'line-height:' + props.lineHeight : '')}
    ${(props) => (props.isActive ? '' : 'display : none')};
    text-align: center;
    background-color: ${(props) => (props.isActive ? '#b7e1cd' : props.isActive === undefined ? 'yellow' : 'gray')};
    font-size: SMALL;
    font-weight: 900;
    ${(props) => (props.isShadow ? 'box-shadow: 0px 0px 16px 0px#000000bf' : '')};
`;


const Row2 = styled.div`
    flex: wrap;
    display: flex;
    height: 32px;
    width: 100%;
`;
const LineSeparator = styled.div`
    flex: wrap;
    display: flex;
    width: 100%;
    height: 1px;
    border-bottom: 1px solid #e5e5e5;
`;


const Collumn2 = styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
`;

const Collumn3 = styled.div`
    display: block;
    margin: 20px 16px 0px;
`;

const ButtonDocs = styled.a`
    flex: 1;
    display: flex;
    justify-content: center;
    color: black;
    height: 28px;
    margin: 16px;
    background-color: #b7e1cd;
    position: relative;
    &:hover {
        color: white;
    }
`;


export { SqaureBox, Row2, Collumn2, LineSeparator, CircleBox, TriangleBox, ButtonDocs, Collumn3 };
export default null;
