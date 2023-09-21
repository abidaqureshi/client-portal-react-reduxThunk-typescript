import React, { useCallback } from 'react';
import { Box, Checkbox, FormControlLabel, IconButton, makeStyles, Typography } from '@material-ui/core';
import UserAvatar from '../../../components/UserAvatar';
import { IFilterMembers } from '../../../models/RFQQuote';
import { FiltersContainer } from '../styled';
import CancelIcon from '@material-ui/icons/Cancel';

interface IKanbanFilters {
    dueDateFilters: {
        label: string;
        value: number;
        checked: boolean;
    }[];
    members: IFilterMembers[];
    onHandleChangeOverDue: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onHandleMemberFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles({
    filtersHeading: {
        backgroundColor: '#00c4aa',
        color: '#ffffff',
        padding: '5px',
        borderRadius: '2px',
    },
});

export const KanbanFilters: React.FC<IKanbanFilters> = ({
    dueDateFilters,
    members,
    onHandleChangeOverDue,
    onHandleMemberFilterChange,
    setShowFilters,
}) => {
    const classes = useStyles();
    console.log('members ', members);
    const onClose = useCallback(() => {
        setShowFilters(false);
    }, [setShowFilters]);

    return (
        <FiltersContainer>
            <Box display="flex" justifyContent="right">
                <IconButton onClick={onClose}>
                    <CancelIcon color="primary" />
                </IconButton>
            </Box>
            <Box textAlign="left" className={classes.filtersHeading}>
                <Typography>Due date</Typography>
            </Box>
            <Box margin={2}>
                {dueDateFilters.map((filterItem) => (
                    <FormControlLabel
                        style={{ width: '100%' }}
                        control={
                            <Checkbox
                                checked={filterItem.checked}
                                onChange={onHandleChangeOverDue}
                                name="checkedB"
                                value={filterItem.value}
                                color="primary"
                            />
                        }
                        label={filterItem.label}
                    />
                ))}
            </Box>
            <Box textAlign="left" className={classes.filtersHeading}>
                <Typography>Created by</Typography>
            </Box>
            <Box margin={2} display="flex" flexDirection="column">
                {members.map((member) => (
                    <>
                        {member.key.includes('supplier') ? (
                            ''
                        ) : (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={member.checked}
                                        name="checkedB"
                                        color="primary"
                                        value={member.key}
                                        onChange={onHandleMemberFilterChange}
                                    />
                                }
                                label={<UserAvatar showName={true} size="small" username={member.key} />}
                            />
                        )}
                    </>
                ))}
            </Box>
        </FiltersContainer>
    );
};
