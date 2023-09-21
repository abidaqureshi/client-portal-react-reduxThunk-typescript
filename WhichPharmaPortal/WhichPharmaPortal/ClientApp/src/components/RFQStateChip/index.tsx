import * as React from 'react';
import { Tooltip } from '@material-ui/core';
import GradeIcon from '@material-ui/icons/Grade';
import { RFQQuoteState } from '../../models/RFQQuoteState';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import { StatusChip } from './styled';
import { RFQState } from '../../models/RFQState';

export const getColor = (state: RFQState): string => {
    switch (state) {
        case RFQState.Open:
            return '#ffc000';
        case RFQState.Cancelled:
            return '#f00';
        case RFQState.ClosedWithQuote:
            return '#92d050';

        case RFQState.ClosedWithoutQuote:
            return '#b0b0b0';
        default:
            return '#b0b0b0';
    }
};

const getTK = (state: RFQState): TK => {
    switch (state) {
        case RFQState.Open:
            return TK.new;
        case RFQState.Cancelled:
            return TK.skipped;
        case RFQState.ClosedWithQuote:
            return TK.quoted;
        case RFQState.ClosedWithoutQuote:
            return TK.closed;
        default:
            return TK.unknown;
    }
};

export const RFQStateChip: React.FC<{ state: RFQState; size?: 'small' | 'medium' | 'big' }> = ({
    state,
    size = 'big',
}) => {
    const t = useTranslations();
    const text = t(getTK(state));

    return (
        <Tooltip title={text}>
            {state === RFQState.Open ? (
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
