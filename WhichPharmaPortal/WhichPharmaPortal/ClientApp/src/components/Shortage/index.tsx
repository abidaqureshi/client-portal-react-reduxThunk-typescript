import React from 'react';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import { ShortageTitle, ShortageFlag, ShortageList, ShortageListItem, ShortageCaption } from './styled';
import { Tooltip, Typography } from '@material-ui/core';
import moment from 'moment';

export interface ShortageProps {
    start: string;
    end: string;
    isActive: boolean;
    type: 'Temporary' | 'Partial' | 'Permanent';
    additionalNotes: string;
    lastUpdate: string;
}

interface ShortageItemProps {
    name: string;
    value: string;
}

const ShortageItem: React.FC<ShortageItemProps> = ({ name, value }: ShortageItemProps) => {
    return (
        <ShortageListItem>
            <ShortageCaption>{name}</ShortageCaption>
            <Typography variant="body1">{value}</Typography>
        </ShortageListItem>
    );
};

const ShortageCell: React.FC<ShortageProps> = (props: ShortageProps) => {
    const { 
        type,
        start, 
        end, 
        isActive,
        additionalNotes, 
        lastUpdate 
    } = props;

    const t = useTranslations();

    return (
        <div>
            <Tooltip
                title={
                    <>
                        <ShortageFlag alt={type} type={type} isActive={isActive} />
                        <ShortageTitle>{type}</ShortageTitle>
                        <ShortageList>
                            <ShortageItem
                                name={t(TK.from)}
                                value={moment(start).format('DD/MM/YYYY')}
                            />
                            { end && 
                                <ShortageItem
                                    name={t(TK.until)}
                                    value={moment(end).format('DD/MM/YYYY')}
                                />
                            }
                            { additionalNotes && 
                                <ShortageItem name={t(TK.additionalNotes)} value={additionalNotes} /> 
                            }
                            <ShortageItem name={t(TK.lastUpdate)} value={moment(lastUpdate).fromNow()} />
                        </ShortageList>
                    </>
                }
            >
                <ShortageFlag alt={type} type={type} isActive={isActive} />
            </Tooltip>
        </div>
    );
};

export default ShortageCell;
