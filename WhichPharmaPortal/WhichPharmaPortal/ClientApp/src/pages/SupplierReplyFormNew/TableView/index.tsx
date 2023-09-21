import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { RFQQuote } from '../../../models/RFQQuote';
import { RFQQuoteState } from '../../../models/RFQQuoteState';
import { MapOf } from '../../../utils/Types';

import { TableCell } from '@material-ui/core';
import RenderTableRows, { IRfqFunctions } from './RenderTableRows';
import { TK } from '../../../store/Translations/translationKeys';
import { useTranslations } from '../../../store/Translations/hooks';

interface ITableView extends IRfqFunctions {
    dataRows: RFQQuote[];
    responsibles: MapOf<string>;
}

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

const QuotesTableView: React.FC<ITableView> = ({ dataRows, handleQuoteBoxClick, responsibles }) => {
    const classes = useStyles();
    const t = useTranslations();

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="rfq table">
                <TableHead>
                    <TableRow>
                        <TableCell size="small">Card</TableCell>
                        <TableCell align="center">Rfq</TableCell>
                        <TableCell align="center">Pack size</TableCell>
                        <TableCell align="center">Requested quantity</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">{t(TK.price)}</TableCell>
                        <TableCell align="center">Availability</TableCell>
                        <TableCell align="center">Lead time (days)</TableCell>
                        <TableCell align="center">Exp date</TableCell>
                        <TableCell align="center">Due date</TableCell>
                        <TableCell align="center">Last changed</TableCell>
                        <TableCell align="center">Changed by</TableCell>
                        <TableCell align="left">Created by</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <RenderTableRows
                        data={dataRows}
                        filterBy={RFQQuoteState.Open}
                        responsibles={responsibles}
                        handleQuoteBoxClick={handleQuoteBoxClick}
                    />

                    <RenderTableRows
                        data={dataRows}
                        filterBy={RFQQuoteState.Quoted}
                        responsibles={responsibles}
                        handleQuoteBoxClick={handleQuoteBoxClick}
                    />

                    <RenderTableRows
                        data={dataRows}
                        filterBy={RFQQuoteState.Alternative}
                        responsibles={responsibles}
                        handleQuoteBoxClick={handleQuoteBoxClick}
                    />

                    <RenderTableRows
                        data={dataRows}
                        filterBy={RFQQuoteState.Declined}
                        responsibles={responsibles}
                        handleQuoteBoxClick={handleQuoteBoxClick}
                    />

                    <RenderTableRows
                        data={dataRows}
                        filterBy={RFQQuoteState.Closed}
                        responsibles={responsibles}
                        handleQuoteBoxClick={handleQuoteBoxClick}
                    />
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default QuotesTableView;
