import React, { FC } from 'react';
import { ITranslate } from '../../../store/Translations/hooks';
import { TK } from '../../../store/Translations/translationKeys';
import { DataTypeProvider } from '@devexpress/dx-react-grid';
import { ColumnDefinition, ColumnTypeTemplate } from '../types';
import { FiltersAvailableMap } from '../Filters';

export const DateFormat = 'YYYY-MM-DD';
export const DateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

export interface DataTypeFormatterProps<T> {
    t: ITranslate<TK>;
    column: ColumnDefinition<T>;
    renderTableCell: (data: any, t: ITranslate<TK>) => string | React.ReactNode;
}

const DataTypeFormatter: FC<DataTypeFormatterProps<any>> = ({ t, column, renderTableCell }) => (
    <DataTypeProvider
        formatterComponent={({ row, value }) => <>{row ? renderTableCell(row, t) : value}</>}
        for={[column.columnName]}
        availableFilterOperations={FiltersAvailableMap[column.templateType || ColumnTypeTemplate.Unspecified]}
    />
);

export default DataTypeFormatter;
