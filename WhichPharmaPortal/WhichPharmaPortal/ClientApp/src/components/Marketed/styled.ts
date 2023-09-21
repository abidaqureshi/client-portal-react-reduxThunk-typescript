import styled from 'styled-components';
import { TK } from '../../store/Translations/translationKeys';

interface AvailabilityProps extends React.HTMLProps<HTMLDivElement> {
    type:
        | 'ShortageFuture'
        | 'Shortage3M'
        | 'Shortage3to6M'
        | 'Shortage6M'
        | 'NotAuthorised'
        | 'NotMarketed'
        | 'Marketed'
        | 'Unknown'
        | 'Shortage'
        | TK;
    isActive: boolean;
}

const colors: { [key: string]: string } = {
    NotAuthorised: 'black',
    NotMarketed: 'black',
    ShortageFuture: 'blue',
    // NotMarketed: 'lightgrey',
    Shortage3M: 'yellow',
    Shortage3to6M: 'orange',
    Shortage6M: 'red',
    Shortage: 'red',
    Marketed: 'green',
    Unknown: 'lightgrey',
    //Unknown: 'blue',
};

const AvailabilityFlag = styled('div')<AvailabilityProps>`
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 0.5rem;
    background-color: ${(props): string => (props.isActive ? colors[props.type] : 'lightgrey')};
`;

const AvailabilityTitle = styled('h6')`
    display: inline-block;
    font-size: 1.25rem;
    margin-left: 1rem;
`;

const AvailabilityList = styled('ul')`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
`;

const AvailabilityListItem = styled('li')`
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

const AvailabilityCaption = styled('span')`
    font-variant: small-caps;
    font-size: 0.75rem;
`;

export { AvailabilityTitle, AvailabilityFlag, AvailabilityCaption, AvailabilityList, AvailabilityListItem };
export default null;
