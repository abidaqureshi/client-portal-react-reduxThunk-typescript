import * as React from 'react';
import { Tooltip } from '@material-ui/core';
import GradeIcon from '@material-ui/icons/Grade';
import { RFQQuoteState } from '../../models/RFQQuoteState';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { Avatar, StatusChip } from './styled';

export const getColor = (state: RFQQuoteState): string => {
    switch (state) {
        case RFQQuoteState.Open:
            return '#ffc000';
        case RFQQuoteState.InProgress:
            return '#ffc000';
        case RFQQuoteState.Declined:
            return '#f00';
        case RFQQuoteState.Quoted:
            return '#92d050';
        case RFQQuoteState.Alternative:
            return '#dc02dcd9';
        case RFQQuoteState.Closed:
            return '#b0b0b0';
        default:
            return '#b0b0b0';
    }
};

const getTK = (state: RFQQuoteState): TK => {
    switch (state) {
        case RFQQuoteState.Open:
            return TK.new;
        case RFQQuoteState.InProgress:
            return TK.interested;
        case RFQQuoteState.Declined:
            return TK.skipped;
        case RFQQuoteState.Alternative:
            return TK.alternative;
        case RFQQuoteState.Quoted:
            return TK.quoted;
        case RFQQuoteState.Closed:
            return TK.closed;
        default:
            return TK.unknown;
    }
};

export const RFQQuoteAvatar: React.FC<{ state: RFQQuoteState; size?: 'small' | 'big' }> = ({ state, size = 'big' }) => {
    const t = useTranslations();
    const text = t(getTK(state));

    return (
        <Tooltip title={text}>
            <Avatar $size={size} style={{ background: getColor(state), display: 'inline-flex' }}>
                {text[0]}
            </Avatar>
        </Tooltip>
    );
};

export const RFQQuoteChip: React.FC<{ state: RFQQuoteState; label?: string; size?: 'small' | 'medium' | 'big' }> = ({
    state,
    label,
    size = 'big',
}) => {
    const t = useTranslations();
    const text = label ? label : t(getTK(state));

    return (
        <Tooltip title={text}>
            {state === RFQQuoteState.InProgress ? (
                <StatusChip
                    label={text}
                    icon={<GradeIcon fontSize="small" style={{ color: '#FFFFFF' }} />}
                    $size={size}
                    style={{ background: getColor(state), display: 'inline-flex' }}
                />
            ) : (
                <StatusChip label={text} $size={size} style={{ background: getColor(state), display: 'inline-flex' }} />
            )}
        </Tooltip>
    );
};

export const RFQCountChip: React.FC<{ state: RFQQuoteState; label?: string; size?: 'small' | 'medium' | 'big' }> = ({
    state,
    label,
    size = 'big',
}) => {
    const t = useTranslations();
    const text = t(getTK(state));

    return (
        <Tooltip title={text}>
            {state === RFQQuoteState.InProgress ? (
                <StatusChip
                    label={text}
                    icon={<GradeIcon fontSize="small" style={{ color: '#FFFFFF' }} />}
                    $size={size}
                    style={{ background: getColor(state), display: 'inline-flex' }}
                />
            ) : (
                <StatusChip
                    label={label}
                    $size={size}
                    style={{
                        background: getColor(state),
                        display: 'inline-flex',
                        paddingLeft: '0px',
                        paddingRight: '0px',
                    }}
                />
            )}
        </Tooltip>
    );
};
