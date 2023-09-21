import { ITranslate } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';

export enum ColumnTypeTemplate {
    Unspecified,
    Date,
    DateTime,
    Bool,
}

export interface Item {
    id: string | number;
    [column: string]: any;
}

export interface ColumnDefinition<T> {
    labelTK: TK;
    columnName: string;
    canBeSorted?: boolean;
    canBeFiltered?: boolean;
    canBeGrouped?: boolean;
    canBeEdited?: boolean;
    templateType?: ColumnTypeTemplate;

    getCellValue?: (data: T) => string | undefined;
    getGroupValue?: (value: any | undefined) => string | undefined;
    renderTableCell?: (data: T, t: ITranslate<TK>) => string | React.ReactNode;
    renderGroupCell?: (data: T[], groupValue: string, t: ITranslate<TK>) => string | React.ReactNode;

    align?: 'left' | 'right' | 'center';
    defaultWidth?: number;
}
