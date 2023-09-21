import React, { useCallback } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import '../../../app/css/Dialog.scss';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Box, InputLabel, MenuItem, Select } from '@material-ui/core';
import { RFQSummary } from '../../../models/RFQSummary';
import { RFQState } from '../../../models/RFQState';

interface IReasonDialog {
    isOpenRDialog: boolean;
    rfqItem: RFQSummary;
    saveRDialogBox: (reason: string, rfqNumber: string, state: RFQState) => void;
    closeRDialogBox: () => void;
}

const ReasonDialog: React.FC<IReasonDialog> = ({ isOpenRDialog, rfqItem, saveRDialogBox, closeRDialogBox }) => {
    const [open, setOpen] = React.useState(false);
    const [reason, setReason] = React.useState<string>('');

    const { number, state } = rfqItem;

    React.useEffect(() => {
        setReason(rfqItem?.reason || '');
    }, [rfqItem?.reason]);

    React.useEffect(() => {
        setOpen(isOpenRDialog);
    }, [isOpenRDialog, setOpen]);

    const onChangeHandler = (reason: string) => {
        setReason(reason);
    };

    const handleClickSave = useCallback(() => {
        saveRDialogBox(number, reason, state);
    }, [saveRDialogBox, reason]);

    const handleClose = () => {
        closeRDialogBox();
    };

    return (
        <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title" className="dialogTitle">
                    RFQ: {number}
                </DialogTitle>
                <DialogContent>
                    <Box padding={2}>
                        <InputLabel id="reason-select-label">Reason to change status:</InputLabel>
                        <TextField
                            style={{ width: '400px' }}
                            autoFocus
                            multiline
                            rows={2}
                            value={reason}
                            fullWidth
                            onChange={(evt) => onChangeHandler(evt.target.value)}
                            margin="dense"
                            id="reason"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" variant="contained">
                        Cancel
                    </Button>
                    <Button onClick={handleClickSave} color="primary" variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ReasonDialog;
