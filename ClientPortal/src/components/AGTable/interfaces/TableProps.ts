import { Item, ColumnDefinition } from '../types';

export interface TableSettings {
    pageSize: number;
    fixedColumns?: (string | symbol)[];
    columnOrder?: string[];
    hiddenColumnNames?: string[];
    expandedGroups?: string[];
}

export interface TableProps<T extends Item> {
    columnsDefinition: ColumnDefinition<T>[];
    data: T[];
    selectedItems?: (string | number)[];
    total?: number;
    page?: number;
    isLoading?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    exportFileName?: string;
    settings: TableSettings;
    hideSelectionColumn?: boolean;
    onChangeData?: (data: T[]) => void;
    onChangePage?: (page: number) => void;
    onChangeItemsSelection?: (selectedItems: Array<number | string>) => void;
    onChangeItemSelection?: (itemId: number | string, isSelected: boolean) => void;
    onChangeSettings: (settings: TableSettings) => void;
    onChangeSorting?: (sortBy?: string, sortDirection?: 'asc' | 'desc') => void;
    onResetSettings?: () => void;
}
