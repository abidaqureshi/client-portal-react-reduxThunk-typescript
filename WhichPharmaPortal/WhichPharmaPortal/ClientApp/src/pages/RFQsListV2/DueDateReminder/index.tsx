import React, { useCallback } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import '../../../app/css/Dialog.scss';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Box, InputLabel, MenuItem, Select } from '@material-ui/core';
import { IRfqProps } from '../interface';

interface IDueDateReminder {
    isOpenDialog: boolean;
    rfqItem: IRfqProps;
    closeDialogBox: () => void;
    saveReminder: (rfqNumber: string, reminder: number, dueDate: string) => void;
}

const DueDateReminder: React.FC<IDueDateReminder> = ({ isOpenDialog, rfqItem, saveReminder, closeDialogBox }) => {
    const [open, setOpen] = React.useState(false);
    const [reminder, setReminder] = React.useState(0);

    const dateObject = new Date(rfqItem.endingDate);

    const [selectedDate, setSelectedDateChange] = React.useState<string>('');

    React.useEffect(() => {
        const dateString =
            dateObject.getFullYear() +
            '-' +
            (dateObject.getMonth() + 1 < 10 ? '0' + (dateObject.getMonth() + 1) : dateObject.getMonth() + 1) +
            '-' +
            (dateObject.getDate() + 1 < 10 ? '0' + dateObject.getDate() : dateObject.getDate());
        setSelectedDateChange(dateString);

        setOpen(isOpenDialog);
    }, [isOpenDialog, setOpen, setSelectedDateChange]);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setReminder(event.target.value as number);
    };

    const handleDateChange = (event: any) => {
        setSelectedDateChange(event.target.value);
    };

    const saveHandler = useCallback(() => {
        const { number } = rfqItem;
        saveReminder(number, reminder, selectedDate);
        closeDialogBox();
    }, [saveReminder, closeDialogBox, reminder, rfqItem, selectedDate]);

    return (
        <div>
            <Dialog open={open} onClose={closeDialogBox} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title" className="dialogTitle">
                    Change due date and Reminder
                </DialogTitle>
                <DialogContent>
                    <Box padding={2}>
                        <InputLabel id="due-change-date-label">Change date</InputLabel>
                        <TextField
                            autoFocus
                            onChange={handleDateChange}
                            defaultValue={selectedDate}
                            margin="dense"
                            id="name"
                            type="date"
                        />
                    </Box>
                    <Box padding={2}>
                        <InputLabel id="due-reminder-label">Reminder</InputLabel>
                        <Select
                            labelId="due-date-select-filled-label"
                            id="due-date-select-filled"
                            label="Reminder"
                            value={reminder}
                            onChange={handleChange}
                        >
                            <MenuItem value={0}>
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value={5}>Before 5 minutes</MenuItem>
                            <MenuItem value={10}>Before 10 minutes</MenuItem>
                            <MenuItem value={15}>Before 15 minutes</MenuItem>
                            <MenuItem value={60}>Before 1 hour</MenuItem>
                            <MenuItem value={120}>Before 2 hours</MenuItem>
                            <MenuItem value={1440}>Before 1 day</MenuItem>
                            <MenuItem value={2880}>Before 2 days</MenuItem>
                        </Select>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={saveHandler} color="primary" variant="contained">
                        Save
                    </Button>
                    <Button onClick={closeDialogBox} color="primary" variant="contained">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default DueDateReminder;
