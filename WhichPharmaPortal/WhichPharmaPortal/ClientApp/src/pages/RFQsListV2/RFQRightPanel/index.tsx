import { Badge, Box, Link, Tooltip } from '@material-ui/core';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';

import MailIcon from '@material-ui/icons/Mail';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import React from 'react';
import { RFQDetails } from '../../../models/RFQDetails';
import { RFQEntryState } from '../../../models/RFQEntryState';
import { useTranslations } from '../../../store/Translations/hooks';

import { IRfqProps } from '../interface';
import { RFQItemActionsPanel } from '../styled';
import { TK } from '../../../store/Translations/translationKeys';
import { RFQState } from '../../../models/RFQState';
import { RFQQuoteInfo } from '../../../models/RFQQuoteInfo';
import { RFQQuoteState } from '../../../models/RFQQuoteState';
import { RFQCountChip, RFQQuoteChip } from '../../../components/RFQQuoteAvatar';
import { StatusRoundChip } from '../../../components/RFQQuoteAvatar/styled';

export const RFQRightPanel: React.FC<{
    rfq: IRfqProps;
    onClickStateHandler: (rfq: IRfqProps) => void;
    details?: RFQDetails;
}> = ({ rfq, onClickStateHandler, details }) => {
    const t = useTranslations();
    //console.log('the details', details);

    const dataTables = React.useMemo(() => {
        const dataTables: RFQQuoteInfo[] | undefined = details?.suppliersDetails
            .map((item) => item.dataTable)
            .reduce((prev, curr) => [...prev, ...curr], []);
        return dataTables;
    }, [details]);

    const openQuotes = React.useMemo(() => {
        let count = 0;
        if (dataTables) {
            dataTables.forEach((item) => {
                if (item.state === RFQQuoteState.Open || item.state === RFQQuoteState.InProgress) {
                    count++;
                }
            });
        }
        return count;
    }, [dataTables]);

    const quotedQuotes = React.useMemo(() => {
        let count = 0;
        if (dataTables) {
            dataTables.forEach((item) => {
                if (item.state === RFQQuoteState.Quoted) {
                    count++;
                }
            });
        }
        return count;
    }, [dataTables]);

    const declinedQuotes = React.useMemo(() => {
        let count = 0;
        if (dataTables) {
            dataTables.forEach((item) => {
                if (item.state === RFQQuoteState.Declined) {
                    count++;
                }
            });
        }
        return count;
    }, [dataTables]);

    const alterntveQuotes = React.useMemo(() => {
        let count = 0;
        if (dataTables) {
            dataTables.forEach((item) => {
                if (item.state === RFQQuoteState.Alternative) {
                    count++;
                }
            });
        }
        return count;
    }, [dataTables]);

    return (
        <RFQItemActionsPanel>
            {!!openQuotes && (
                <Tooltip title={RFQQuoteState.Open}>
                    <StatusRoundChip state={RFQQuoteState.Open}>{openQuotes}</StatusRoundChip>
                </Tooltip>
            )}
            {!!quotedQuotes && (
                <Tooltip title={RFQQuoteState.Quoted}>
                    <StatusRoundChip state={RFQQuoteState.Quoted}>{quotedQuotes}</StatusRoundChip>
                </Tooltip>
            )}
            {!!declinedQuotes && (
                <Tooltip title={RFQQuoteState.Declined}>
                    <StatusRoundChip state={RFQQuoteState.Declined}>{declinedQuotes}</StatusRoundChip>
                </Tooltip>
            )}
            {!!alterntveQuotes && (
                <Tooltip title={RFQQuoteState.Alternative}>
                    <StatusRoundChip state={RFQQuoteState.Alternative}>{alterntveQuotes}</StatusRoundChip>
                </Tooltip>
            )}

            {/* <Tooltip title={t(TK.openQuotes)}>
                <Badge badgeContent={open || '...'}>
                    <AssignmentLateIcon />
                </Badge>
            </Tooltip>
            <Tooltip title={t(TK.closedQuotes)}>
                <Badge badgeContent={closed.toString()}>
                    <AssignmentTurnedInIcon />
                </Badge>
            </Tooltip> */}
            <Box width={70}>
                <Link
                    component="button"
                    variant="body2"
                    color="secondary"
                    style={{ fontSize: 'medium' }}
                    onClick={() => onClickStateHandler(rfq)}
                >
                    {rfq.state == RFQState.Open ? (
                        <span>
                            <CancelIcon /> Close
                        </span>
                    ) : (
                        <span>
                            <CheckCircleIcon />
                            Open
                        </span>
                    )}
                </Link>
            </Box>
        </RFQItemActionsPanel>
    );
};
