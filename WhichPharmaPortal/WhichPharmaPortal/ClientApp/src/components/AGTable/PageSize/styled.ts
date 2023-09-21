import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            width: 60,
            fontSize: 13,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    }),
);
