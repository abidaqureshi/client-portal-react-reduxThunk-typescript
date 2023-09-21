import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import WarningIcon from '@material-ui/icons/Warning';
import './ConfirmDialog.scss';
import '../../app/css/Dialog.scss';
import Box from '@material-ui/core/Box';
import { TK } from '../../store/Translations/translationKeys';

interface IConfirmDialogProps {
    getUserAcknowledgement?: (isAgree: boolean) => void;
    onClickYesFunction?: () => void;
    onClickNoFunction?: () => void;
    showAlert: boolean;
    title?: string;
}

export default function ConfirmDialog({
    getUserAcknowledgement,
    onClickYesFunction,
    onClickNoFunction,
    showAlert,
    title,
}: IConfirmDialogProps) {
    const [open, setOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        setOpen(showAlert);
    }, [showAlert, setOpen]);

    return (
        <div>
            <Dialog open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title" className="dialogTitle">
                    <Box display="flex" position="bottom">
                        <Box marginRight="10px">
                            <WarningIcon />
                        </Box>
                        <Box marginTop="3px">Alert</Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" className="alertDialogDescription">
                        {title ? title : TK.confirmDialogMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            getUserAcknowledgement
                                ? getUserAcknowledgement(false)
                                : onClickNoFunction && onClickNoFunction();
                            setOpen(false);
                        }}
                        color="primary"
                        variant="contained"
                    >
                        No
                    </Button>
                    <Button
                        onClick={() => {
                            getUserAcknowledgement
                                ? getUserAcknowledgement(true)
                                : onClickYesFunction && onClickYesFunction();
                            setOpen(false);
                        }}
                        color="primary"
                        variant="contained"
                        autoFocus
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
