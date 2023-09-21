import React, { Component } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { Box, IconButton, Tooltip } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { RFQQuoteState } from '../../../models/RFQQuoteState';

export default function AGEditableCommentsRenderer(props: ICellRendererParams) {
    const handleClick = () => {
        props.api.startEditingCell({
            rowIndex: props.rowIndex,
            colKey: props.column!.getId(),
        });
    };

    return (
        <Box display="flex" justifyContent="space-between">
            {props.value && props.value.length > 0 ? (
                <>
                    <Tooltip title={props.value}>
                        <span>{props.value.substr(0, 12) + '...'}</span>
                    </Tooltip>
                </>
            ) : (
                <span style={{ paddingLeft: '4px' }}>{props.value}</span>
            )}
            {props.data.state === RFQQuoteState.Open ? (
                <IconButton
                    style={{ marginTop: '6px' }}
                    aria-label="edit"
                    size="small"
                    color="primary"
                    onClick={handleClick}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            ) : (
                ''
            )}
        </Box>
    );
}
