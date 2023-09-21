import React from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Box, IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { RFQQuoteState } from '../../../models/RFQQuoteState';

export default function AGEditableExpDateRender(props: ICellRendererParams) {
    const handleClick = () => {
        props.api.startEditingCell({
            rowIndex: props.rowIndex,
            colKey: props.column!.getId(),
        });
    };

    return props.data.state === RFQQuoteState.Open ? (
        <Box component="span" display="flex" justifyContent="space-between">
            {props.value ? (
                <span style={{ paddingLeft: '4px' }}>{props.value}</span>
            ) : (
                <span style={{ color: '#dddddd' }}>MM/YYYY</span>
            )}
            <IconButton aria-label="edit" size="small" color="primary" onClick={handleClick}>
                <EditIcon fontSize="small" />
            </IconButton>
        </Box>
    ) : (
        <Box paddingLeft="4px" component="span">
            {props.value}
        </Box>
    );
}
