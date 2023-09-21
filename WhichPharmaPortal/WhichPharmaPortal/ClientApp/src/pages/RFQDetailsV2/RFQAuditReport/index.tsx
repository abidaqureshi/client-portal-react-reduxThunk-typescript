import * as React from 'react';
import { Dialog, DialogTitle, List, ListItem, Button } from '@material-ui/core';
import { PanelButtonsContainer } from '../../../components/Panel/styled';
import { useTranslations } from '../../../store/Translations/hooks';
import { TK } from '../../../store/Translations/translationKeys';
import { useDispatch } from 'react-redux';
import { fetchRFQHistory } from '../../../store/RFQs/actions';

export interface FormDialogProps {
    title: string;
    open: boolean;
    rfqNr: string;
    onClose: () => void;
}

const RFQAuditReport: React.FC<FormDialogProps> = ({ title, open, rfqNr, onClose }) => {
    const t = useTranslations();
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (open) {
            dispatch(fetchRFQHistory(rfqNr));
        }
    }, [open, rfqNr]);

    return (
        <Dialog onClose={onClose} open={open}>
            <DialogTitle>{title}</DialogTitle>
            <List>
                <hr />
                <ListItem>
                    <PanelButtonsContainer nomargin>
                        <Button variant="contained" onClick={onClose}>
                            {' '}
                            {t(TK.close)}
                        </Button>
                    </PanelButtonsContainer>
                </ListItem>
            </List>
        </Dialog>
    );
};

export default RFQAuditReport;
