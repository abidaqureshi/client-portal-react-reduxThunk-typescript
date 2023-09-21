import React, { useState } from 'react';
import { Paper, Grid, makeStyles, createStyles, Theme, Box, IconButton, Typography } from '@material-ui/core';
import NavigateNextRoundedIcon from '@material-ui/icons/NavigateNextRounded';
import NavigateBeforeRoundedIcon from '@material-ui/icons/NavigateBeforeRounded';
import LastPageRoundedIcon from '@material-ui/icons/LastPageRounded';
import FirstPageRoundedIcon from '@material-ui/icons/FirstPageRounded';
import Pagination from '@material-ui/lab/Pagination';

import PageSize from '../PageSize';
import { PaginationControlsWrapper } from './styled';
import { GridAnalystic } from '../GridAnalytics';

export interface INavigationProps {
    nextBtn: boolean;
    prevBtn: boolean;
    currentPage: number;
    totalPages: number;
    pageSize: number | undefined;
    enablePagination?: boolean;
}

interface ICustomPaginationProps extends INavigationProps {
    caption: string | undefined;
    totalRecords?: number;
    timeInSeconds?: number;
    onBtnFirst: () => void;
    onBtnLast: () => void;
    onBtnNext: () => void;
    onBtnPrevious: () => void;
    onPageSizeChanged: (val: number) => void;
    onPgNumberChange: (value: number) => void;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            paddingRight: '10px',
            textAlign: 'center',
            color: theme.palette.text.secondary,
            borderRadius: '1px',
        },
        pgContentBox: {
            width: 'auto',
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-evenly',
            fontWeight: 'bold',
            justifyItems: 'space-between',
            cursor: 'pointer',
        },
    }),
);

export const AGCustomPagination: React.FC<ICustomPaginationProps> = ({
    onBtnFirst,
    onBtnLast,
    onBtnNext,
    onBtnPrevious,
    onPageSizeChanged,
    onPgNumberChange,
    enablePagination,
    caption,
    timeInSeconds,
    totalRecords,
    pageSize,
    nextBtn,
    prevBtn,
    currentPage,
    totalPages,
}) => {
    const classes = useStyles();
    const onPgChange = (event: React.ChangeEvent<unknown>, pgNumber: number) => {
        onPgNumberChange(pgNumber <= 1 ? 0 : pgNumber - 1);
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Paper className={classes.paper}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" ml={2} height={50}>
                        <GridAnalystic
                            caption={caption}
                            showRecords={true}
                            totalRecords={totalRecords || 0}
                            timeInSeconds={timeInSeconds || 0}
                        />
                        {enablePagination && (
                            <PaginationControlsWrapper>
                                <div>
                                    <PageSize onHandleChange={onPageSizeChanged} initialPageSize={pageSize} />
                                </div>
                                <Box>
                                    <IconButton
                                        onClick={onBtnFirst}
                                        aria-label="First page"
                                        color="primary"
                                        disabled={prevBtn}
                                    >
                                        <FirstPageRoundedIcon />
                                    </IconButton>
                                </Box>
                                <Box>
                                    <IconButton
                                        onClick={onBtnPrevious}
                                        aria-label="Previous page"
                                        color="primary"
                                        disabled={prevBtn}
                                    >
                                        <NavigateBeforeRoundedIcon />
                                    </IconButton>
                                </Box>
                                <Box className={classes.pgContentBox}>
                                    <Pagination
                                        count={totalPages}
                                        page={currentPage}
                                        shape="rounded"
                                        onChange={onPgChange}
                                        hidePrevButton
                                        hideNextButton
                                        color="primary"
                                    />
                                </Box>
                                <Box>
                                    <IconButton
                                        onClick={onBtnNext}
                                        aria-label="Next page"
                                        color="primary"
                                        disabled={nextBtn}
                                    >
                                        <NavigateNextRoundedIcon />
                                    </IconButton>
                                </Box>
                                <Box>
                                    <IconButton
                                        onClick={onBtnLast}
                                        aria-label="Last page"
                                        color="primary"
                                        disabled={nextBtn}
                                    >
                                        <LastPageRoundedIcon />
                                    </IconButton>
                                </Box>
                            </PaginationControlsWrapper>
                        )}
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};
