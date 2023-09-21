import * as React from 'react';
import { RFQQuote } from '../../../models/RFQQuote';
import { useTranslations } from '../../../store/Translations/hooks';
import { TK } from '../../../store/Translations/translationKeys';
import moment from 'moment';
import { RFQQuoteState } from '../../../models/RFQQuoteState';
import {
    ActiveSubstancesRow,
    EndingDateContainer,
    IconsRow,
    LastRow,
    ProductNameRow,
    QuoteBoxCard,
    RFQNrContainer,
    WeAcceptRow,
} from './styled';
import PacksQuantityIcon from '@material-ui/icons/DynamicFeed';
import PackSizeIcon from '@material-ui/icons/DragIndicator';
import { Box, Tooltip, Typography } from '@material-ui/core';
import UserAvatar from '../../../components/UserAvatar';
import { Assign } from '../types';

export interface QuoteBoxProps {
    quote: RFQQuote & Assign;
    onClick: () => void;
}

const QuoteBox: React.FC<QuoteBoxProps> = ({ quote, onClick }) => {
    const t = useTranslations();

    return (
        <QuoteBoxCard variant="outlined" onClick={onClick}>
            <Box display="flex" justifyContent="space-between">
                <ProductNameRow noWrap>
                    <b>{quote.name}</b>
                </ProductNameRow>
                {quote.isAlternative && (
                    <WeAcceptRow>
                        <b>{TK.weAcceptAlt}</b>
                    </WeAcceptRow>
                )}
            </Box>
            <ActiveSubstancesRow noWrap variant="subtitle2">
                {quote.activeSubstances}
            </ActiveSubstancesRow>
            <IconsRow>
                {quote.packSize && (
                    <Tooltip title={t(TK.packSize)}>
                        <Typography>
                            <PackSizeIcon /> {quote.packSize}
                        </Typography>
                    </Tooltip>
                )}
                {quote.unitQuant && (
                    <Tooltip title={t(TK.packsTotal)}>
                        <Typography>
                            <PacksQuantityIcon /> {quote.unitQuant}
                        </Typography>
                    </Tooltip>
                )}
            </IconsRow>
            <LastRow>
                <EndingDateContainer variant="subtitle2">
                    {quote.state !== RFQQuoteState.Closed && quote.endingDate && (
                        <i>
                            {t(TK.expires)} {moment(quote.endingDate).fromNow()}
                        </i>
                    )}
                </EndingDateContainer>
                <RFQNrContainer>
                    <b>{quote.rfqNr}</b> {quote.username && <UserAvatar size="small" username={quote.username} />}
                </RFQNrContainer>
            </LastRow>
        </QuoteBoxCard>
    );
};

export default QuoteBox;
