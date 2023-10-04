import { HtmlHTMLAttributes, HTMLProps } from 'react';
import styled from 'styled-components';

interface CircleBoxProps extends HTMLProps<HTMLDivElement> {
    isActive: boolean | undefined;
    lineHeight?: number;
    isShadow?: boolean;
    bgColor?: string;
}

const SqaureBox = styled.div`
    width: 10rem;
    height: 4rem;
    background-color: white;
`;

const TriangleBox = styled.div<CircleBoxProps>`
    background-color: ${(props) => (props.bgColor ? props.bgColor : 'black')};
    width: 1.5rem;
    height: 1.5rem;
    clip-path: polygon(18.1% 29%, 77.9% 31%, 46% 84%);
`;

const CircleBox = styled.div<CircleBoxProps>`
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.75rem;
    ${(props) => (props.lineHeight ? 'line-height:' + props.lineHeight : '')}
    ${(props) => (props.isActive ? '' : 'display : none')};
    text-align: center;
    background-color: ${(props) => (props.isActive ? props.theme.colors.RBGreen : props.isActive === undefined ? 'yellow' : 'gray')};
    font-size: SMALL;
    font-weight: 900;
    color: white;
    ${(props) => (props.isShadow ? 'box-shadow:2px 2px 2px 0px#000000bf' : '')};
`;

const SectionHeading = styled.div`
    margin: 40px 0 10px 0px;
    flex: wrap;
    display: flex;
    height: 32px;
    width: 100%;
`;
const RowHeading = styled.div`
    margin-top: 20px;
    flex: wrap;
    display: flex;
    height: 32px;
    width: 100%;
`;

const Row = styled.div`
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
    font-size: 1rem;
    font-weight: bold;
    display: flex;
    justify-content: center;
`;

const Value = styled.div`
    flex: 1;
    font-size: 0.8rem;
    display: flex;
    justify-content: center;
`;

const Collumn3 = styled.div`
    display: block;
    margin: 0px 5px 0px;
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

const CardPriceColumn = styled.div`
    flex: 1;
    font-size: 0.8rem;
    font-weight: bold;
    display: flex;
`;

const CardSubHeading = styled.div`
    flex: wrap;
    display: flex;
    height: 32px;
    width: 100%;
`;

const CardFieldValue = styled.div`
    flex: 1;
    font-size: 0.8rem;
    display: flex;
`;

const ShortageDetailTitle = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    font-size: 1.25rem;
    margin-top: 10px;
`;

export {
    SqaureBox,
    Row,
    RowHeading,
    Collumn2,
    LineSeparator,
    CircleBox,
    TriangleBox,
    ButtonDocs,
    Collumn3,
    Value,
    SectionHeading,
    CardPriceColumn,
    CardSubHeading,
    CardFieldValue,
    ShortageDetailTitle,
};
export default null;
