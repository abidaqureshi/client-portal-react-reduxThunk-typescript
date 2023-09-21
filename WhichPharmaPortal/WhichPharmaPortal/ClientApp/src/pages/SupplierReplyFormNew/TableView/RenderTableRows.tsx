import React from 'react';
import { ActiveSubstancesRow, EndingDateContainer, ProductNameRow, WeAcceptRow } from '../QuoteBox/styled';
import moment from 'moment';
import { useTranslations } from '../../../store/Translations/hooks';
import UserAvatar from '../../../components/UserAvatar';
import { Box, TableCell, TableRow } from '@material-ui/core';
import { RFQQuote } from '../../../models/RFQQuote';
import { RFQQuoteState } from '../../../models/RFQQuoteState';
import { RFQQuoteChip } from '../../../components/RFQQuoteAvatar';
import { MapOf } from '../../../utils/Types';
import { MyTooltip } from '../EditQuoteForm/styled';
import { TK } from '../../../store/Translations/translationKeys';
import { convertUTCDatetoDate } from '../../../utils/utils';

export interface IRfqFunctions {
    handleQuoteBoxClick: (quote: RFQQuote) => void;
}

interface ITableRowProps extends IRfqFunctions {
    data: RFQQuote[];
    filterBy: string;
    responsibles: MapOf<string>;
}

const RenderTableRows = ({ data, filterBy, responsibles, handleQuoteBoxClick }: ITableRowProps) => {
    const t = useTranslations();

    return (
        <>
            {data
                .filter((item: RFQQuote) => item.state === filterBy)
                .map((row: RFQQuote, index) => (
                    <TableRow
                        key={index + '_' + Math.random()}
                        onClick={() => {
                            handleQuoteBoxClick(row);
                        }}
                    >
                        <TableCell component="th" scope="row">
                            <Box display="flex" justifyContent="space-between">
                                <ProductNameRow noWrap>
                                    <b>
                                        {row.name}{' '}
                                        {row.isAlternative ? (
                                            <MyTooltip title={t(TK.weAcceptAlt)}>
                                                <svg className="MuiSvgIcon-root" viewBox="0 0 100 100" width="30">
                                                    <g>
                                                        <g>
                                                            <path d="M31.9,61.2h6.8L27.9,50.5L17.1,61.2h6.8c1,12.3,11.4,22,23.9,22v-7.9C39.7,75.3,32.9,69.1,31.9,61.2z" />
                                                            <path d="M65.2,38.2h-6.7L69.2,49L80,38.2h-6.8c-1-12.3-11.4-22-24-22v7.9C57.3,24.2,64.1,30.3,65.2,38.2z" />
                                                            <path d="M6,8.2v35.6h35.6V8.2H6z M23.8,37.3c-6.2,0-11.2-5-11.2-11.2s5-11.2,11.2-11.2S35,19.8,35,26C35,32.3,30,37.3,23.8,37.3z" />
                                                        </g>
                                                        <g>
                                                            <g>
                                                                <path d="M31.9,61.2h6.8L27.9,50.5L17.1,61.2h6.8c1,12.3,11.4,22,23.9,22v-7.9C39.7,75.3,32.9,69.1,31.9,61.2z" />
                                                                <path d="M65.2,38.2h-6.7L69.2,49L80,38.2h-6.8c-1-12.3-11.4-22-24-22v7.9C57.3,24.2,64.1,30.3,65.2,38.2z" />
                                                                <path d="M6,8.2v35.6h35.6V8.2H6z M23.8,37.3c-6.2,0-11.2-5-11.2-11.2s5-11.2,11.2-11.2S35,19.8,35,26C35,32.3,30,37.3,23.8,37.3z" />
                                                            </g>
                                                            <g>
                                                                <path d="M58.4,56.3V92H94V56.3H58.4z M64.8,82.7l11.4-18.7l11.3,18.7H64.8z" />
                                                            </g>
                                                        </g>
                                                    </g>
                                                </svg>
                                            </MyTooltip>
                                        ) : (
                                            ''
                                        )}
                                    </b>
                                </ProductNameRow>
                            </Box>
                            <ActiveSubstancesRow noWrap variant="subtitle2">
                                {row.activeSubstances}
                            </ActiveSubstancesRow>
                        </TableCell>
                        <TableCell align="center">{row.rfqNr}</TableCell>
                        <TableCell align="center">{row.packSize}</TableCell>
                        <TableCell align="center">{row.unitQuant}</TableCell>
                        <TableCell align="center">
                            <RFQQuoteChip state={row.state} size="medium" />
                        </TableCell>
                        <TableCell align="center">
                            {row.exwNetPriceEuro ? row.exwNetPriceEuro + '' + row.currency : '-'}
                        </TableCell>
                        <TableCell align="center">{row.availabilityPacks ? row.availabilityPacks : '-'}</TableCell>
                        <TableCell align="center">{row.leadTimeToDeliver ? row.leadTimeToDeliver : '-'}</TableCell>
                        <TableCell align="center">{row.expDate ? row.expDate : '-'}</TableCell>
                        <TableCell align="center">
                            {row.state !== RFQQuoteState.Closed && row.endingDate && (
                                <>
                                    {convertUTCDatetoDate(row.endingDate)}
                                    <i>({moment(row.endingDate).fromNow()})</i>
                                </>
                            )}
                        </TableCell>
                        <TableCell align="center">
                            {row.lastUpdateDate ? convertUTCDatetoDate(row.lastUpdateDate) : '-'}
                        </TableCell>
                        <TableCell align="center">
                            {row.updatedBy && row.updatedBy.includes('supplier') ? 'Supplier' : ''}
                        </TableCell>
                        <TableCell align="right">
                            <Box display="flex" justifyContent="left">
                                {responsibles[row.rfqNr] && (
                                    <UserAvatar size="small" username={responsibles[row.rfqNr]} />
                                )}
                            </Box>
                        </TableCell>
                    </TableRow>
                ))}
        </>
    );
};

export default RenderTableRows;
