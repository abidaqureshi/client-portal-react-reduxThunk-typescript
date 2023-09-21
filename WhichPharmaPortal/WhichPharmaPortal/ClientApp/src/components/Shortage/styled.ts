import styled from 'styled-components';

interface ShortageProps extends React.HTMLProps<HTMLDivElement> {
    type: 'Temporary' | 'Partial' | 'Permanent';
    isActive: boolean;
}

const colors: { [key: string]: string } = {
    Temporary: 'yellow',
    Partial: 'orange',
    Permanent: 'red',
};

const ShortageFlag = styled('div')<ShortageProps>`
    width: 1rem;
    height: 1rem;
    border-radius: 0.5rem;
    background-color: ${(props): string => props.isActive ? colors[props.type] : 'lightgrey'};
    display: inline-block;
`;

const ShortageTitle = styled('h6')`
    display: inline-block;
    font-size: 1.25rem;
    margin-left: 1rem;
`;

const ShortageList = styled('ul')`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
`;

const ShortageListItem = styled('li')`
    width: 100%;
    padding-bottom: 0.5rem;
    margin-bottom: 0.2rem;
    border-bottom: 1px solid #424242;
    display: flex;
    flex-direction: column;
    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
`;

const ShortageCaption = styled('span')`
    font-variant: small-caps;
    font-size: 0.75rem;
`;

export { ShortageTitle, ShortageFlag, ShortageCaption, ShortageList, ShortageListItem };
export default null;
