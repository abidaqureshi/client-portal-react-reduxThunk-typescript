import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Button, createStyles, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { AGSearch } from '../AGSearch';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { TK } from '../../../store/Translations/translationKeys';
import { useTranslations } from '../../../store/Translations/hooks';
import { getSelectedProducts } from '../../../store/Products/selectors';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            padding: '5px',
            textAlign: 'center',
            color: theme.palette.text.secondary,
            borderRadius: '1px',
        },
    }),
);

interface IAGToolbar {
    data: any[];
    onInputSearchChange: (val: string) => void;
    onBtnExport: () => void;
    isExportable: boolean;
    searchColumns: string[];
    isCreateRfq?: boolean;
    onCreateRfq?: () => void;
}

export const AGToolbar: React.FC<IAGToolbar> = ({
    data,
    isExportable,
    searchColumns,
    onBtnExport,
    isCreateRfq,
    onCreateRfq,
    onInputSearchChange,
}) => {
    const classes = useStyles();
    const selectedProductsIds = useSelector(getSelectedProducts) || [];

    const t = useTranslations();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <Box display="flex" justifyContent="right">
                        {isCreateRfq && !!selectedProductsIds.length && (
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<NavigateNextIcon />}
                                onClick={onCreateRfq}
                            >
                                {t(TK.proceedToRFQCreation)}
                            </Button>
                        )}

                        {data && data.length > 0 && isExportable ? (
                            <Button variant="contained" color="primary" endIcon={<SaveAltIcon />} onClick={onBtnExport}>
                                {t(TK.export)}
                            </Button>
                        ) : (
                            ''
                        )}
                        {data && data.length > 0 && searchColumns.length > 0 ? (
                            <AGSearch onHandleChange={onInputSearchChange} />
                        ) : (
                            ''
                        )}
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};
