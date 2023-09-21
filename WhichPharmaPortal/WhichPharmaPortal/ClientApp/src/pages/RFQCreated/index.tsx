import React from 'react';
import Page from '../../components/Page';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import { Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@material-ui/core';
import { SuccessParagraph, SuccessIcon, SuccessPanel, WarningIcon } from './styled';
import { useSelector } from 'react-redux';
import { getLatestRFQRequest } from '../../store/RFQs/selectors';
import { RFQRequest } from '../../models/RFQRequest';
import EmailIcon from '@material-ui/icons/Email';
import { useLocation } from 'react-router';
import { CreateRFQResult } from '../../models/CreateRFQResult';

const errorResults = [
    CreateRFQResult.EmailsSentButErrorIntegratingWithStreak,
    CreateRFQResult.EmailsSentButErrorSavingInDatabase,
];

const getResultMessage = (result: CreateRFQResult): TK =>
    result === CreateRFQResult.EmailsSentButErrorIntegratingWithStreak ? TK.emailsSentButErrorIntegrationWithStreak
    : result === CreateRFQResult.EmailsSentButErrorSavingInDatabase ? TK.emailsSentButErrorSavingInDatabase
    : result === CreateRFQResult.ErrorAccessingDatabase ? TK.errorAccessingDatabase
    : result === CreateRFQResult.ErrorSendingEmails ? TK.errorSendingEmails
    : TK.rfqsCreatedAndEmailsSent;

const RFQCreated: React.FC = () => {
    const t = useTranslations();
    const location = useLocation();

    const request = useSelector(getLatestRFQRequest) as RFQRequest;

    const result = React.useMemo(() => location.hash.substr(1) as CreateRFQResult, [location]);

    const error = errorResults.includes(result);

    return (
        <Page title={t(TK.rfqCreated)}>
            <SuccessPanel>
                <SuccessParagraph>
                    { error ? <WarningIcon/> : <SuccessIcon/> }
                    <Typography variant="h5">
                        {t(getResultMessage(result))}. {t(TK.pleaseVerifyYourOutbox)}.
                    </Typography>
                </SuccessParagraph>

                <List>
                    {request?.emailsData.map((emailData, index) => ( 
                        <ListItem key={index}>
                            <ListItemAvatar key={index}>
                                <Avatar>
                                    <EmailIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={emailData.subject} 
                                secondary={`${emailData.recipient}${emailData.cc?.length ? ` (CC: ${emailData.cc.join(', ')})` : ''}`} 
                            />
                        </ListItem>
                    ))}
                </List>
            </SuccessPanel>
        </Page>
    );
};

export default RFQCreated;
