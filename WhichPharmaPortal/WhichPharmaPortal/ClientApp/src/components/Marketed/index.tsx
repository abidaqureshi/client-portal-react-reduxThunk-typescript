import React from 'react';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import { AvailabilityFlag, AvailabilityListItem, AvailabilityCaption } from './styled';
import { Tooltip, Typography } from '@material-ui/core';
import moment from 'moment';
import { ShortageInfo } from '../../models/ShortageInfo';
import { ShortageType } from '../../models/ShortageType';

export interface AvailabilityProps {
    marketed?: boolean | null | undefined;
    authorised?: boolean;
    shortage?: ShortageInfo;
}

interface AvailabilityItemProps {
    name: string;
    value: string;
}
const message: { [key: string]: string } = {
    Shortage3M: 'In Shortage for less than 3 months',
    Shortage3to6M: 'In Shortage between 3 to 6 months',
    Shortage6M: 'In Shortage for more than 6 months',
    ShortageFuture: 'Future Shortage/Future Discontinued',
    NotAuthorised: 'Not Marketed',
    NotMarketed: 'Not Marketed',
    Marketed: 'Authorised and Marketed',
    Unknown: 'Authorized/Marketed status not confirmed',
};
const AvailabilityItem: React.FC<AvailabilityItemProps> = ({ name, value }: AvailabilityItemProps) => {
    return (
        <AvailabilityListItem>
            <AvailabilityCaption>{name}</AvailabilityCaption>
            <Typography variant="body1">{value}</Typography>
        </AvailabilityListItem>
    );
};

const AvailabilityCell: React.FC<AvailabilityProps> = (props: AvailabilityProps) => {
    const { marketed, shortage, authorised } = props;

    const t = useTranslations();

    let Type:
        | 'ShortageFuture'
        | 'Shortage3M'
        | 'Shortage3to6M'
        | 'Shortage6M'
        | 'NotAuthorised'
        | 'NotMarketed'
        | 'Marketed'
        | 'Unknown';

    Type = 'Marketed';
    if (authorised && marketed) {
        Type = 'Marketed';
    } else if ((authorised && marketed === undefined) || (authorised === undefined && marketed === undefined)) {
        Type = 'Unknown';
    } else if (marketed === false) {
        Type = 'NotMarketed';
    }

    if (shortage) {
        Type = 'Shortage3M';
        var startDate = moment(shortage?.start).toDate().getTime();
        var current = new Date().getTime();
        var interval = current - startDate;
        var months = moment(interval).toDate().getMonth();
        var year = moment(interval).toDate().getFullYear();

        if (months > 2) {
            Type = 'Shortage3to6M';
        }
        if (year > 1970) {
            Type = 'Shortage6M';
        }
        if (months > 5) {
            Type = 'Shortage6M';
        }

        if (startDate > current) {
            Type = 'ShortageFuture';
        }
    }

    return (
        <div style={{ paddingTop: '4px', width: '1rem', marginRight: '0.2rem' }}>
            <Tooltip title={<span>{message[Type]}</span>}>
                <AvailabilityFlag alt={Type} type={Type} isActive={true}></AvailabilityFlag>
            </Tooltip>
        </div>
    );
};

export default AvailabilityCell;
