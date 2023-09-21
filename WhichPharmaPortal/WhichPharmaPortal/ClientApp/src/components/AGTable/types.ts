import { CellStyle, CellStyleFunc } from 'ag-grid-community';
import { ITranslate } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';

type FilterButtonType = 'apply' | 'clear' | 'reset' | 'cancel';

export interface TableSettings {
    pageSize: number;
    fixedColumns?: (string | symbol)[];
    columnOrder?: string[];
    hiddenColumnNames?: string[];
    columnWidths?: string[];
    grouping?: string[];
    expandedGroups?: string[];
}
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

export interface ITextMatcher {
    filter: any;
    value: any;
    filterText: string;
}

export interface ColumnDefinition<T> {
    labelTK?: TK;
    pinned?: string;
    field?: string;
    colId?: string;
    initialWidth?: number;
    headerName?: string;
    menuTabs?: string[];
    filter?: boolean | string;
    width?: number;
    sort?: string;
    type?: string;
    colspan?: number;
    floatingFilter?: boolean;
    hide?: boolean;
    initialHide?: boolean;
    wrapText?: boolean;
    autoHeight?: boolean;
    wrapHeaderText?: boolean;
    autoHeaderHeight?: boolean;
    headerHeight?: number;
    headerTooltip?: string;
    cellStyle?: CellStyle;
    headerClass?: string | string[];
    filterParams?: {
        textMatcher?: ({ filter, value, filterText }: ITextMatcher) => boolean;
        applyMiniFilterWhileTyping?: boolean;
        filters?: any;
        buttons?: FilterButtonType[];
        closeOnApply?: boolean;
    };
    minWidth?: number;
    maxWidth?: number;
    headerCheckboxSelection?: boolean;
    checkboxSelection?: boolean;

    canBeSorted?: boolean;
    canBeFiltered?: boolean;
    canBeGrouped?: boolean;
    canBeEdited?: boolean;
    templateType?: ColumnTypeTemplate;
    cellClass?: (param: T) => string;
    valueFormatter?: (param: T) => string | number;
    editable?: (param: T) => boolean;
    valueSetter?: (param: T) => boolean;
    comparator?: (valueA: number, valueB: number, nodeA: any, nodeB: any, isInverted: any) => number;
    getCellValue?: (data: T) => string | undefined;
    getGroupValue?: (value: any | undefined) => string | undefined;
    valueGetter?: (data: T, t: ITranslate<TK>) => string | number;
    cellRenderer?: (data: T, t: ITranslate<TK>) => string | React.ReactNode;
    cellRendererSelector?: (data: T, t: ITranslate<TK>) => string | React.ReactNode;
    renderGroupCell?: (data: T[], groupValue: string, t: ITranslate<TK>) => string | React.ReactNode;

    align?: 'left' | 'right' | 'center';
    defaultWidth?: number;
}
