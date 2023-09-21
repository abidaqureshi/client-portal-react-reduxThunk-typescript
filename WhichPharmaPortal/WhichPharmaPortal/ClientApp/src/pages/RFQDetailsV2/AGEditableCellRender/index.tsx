import React, { Component } from 'react';
import { ICellRendererParams } from 'ag-grid-community';
import { IconButton } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { RFQQuoteState } from '../../../models/RFQQuoteState';
import { parseEuDecimalToDecimal, parseNumber } from '../../../utils/utils';

export default function AGEditableCellRender(props: ICellRendererParams) {
    const handleClick = () => {
        props.api.startEditingCell({
            rowIndex: props.rowIndex,
            colKey: props.column!.getId(),
        });
    };

    return props.data.state === RFQQuoteState.Open ? (
        <span style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ paddingLeft: '4px' }}>{props.value}</span>
            <IconButton
                style={{ marginTop: '6px' }}
                aria-label="edit"
                size="small"
                color="primary"
                onClick={handleClick}
            >
                <EditIcon fontSize="small" />
            </IconButton>
        </span>
    ) : (
        <span style={{ paddingLeft: '4px' }}>
            {props.column?.getColId() === 'exwNetPriceEuro'
                ? Number(props.value ? props.value : props.data.exwNetPriceEuro).toFixed(2) +
                  props.data.currency +
                  ' (' +
                  parseEuDecimalToDecimal(
                      props.data.priceCurrencyToEuro ? props.data.priceCurrencyToEuro : props.data.exwNetPriceEuro,
                  ) +
                  '€)'
                : props.value}
        </span>
    );
}
