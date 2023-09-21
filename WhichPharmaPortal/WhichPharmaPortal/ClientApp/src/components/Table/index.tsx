import React, { useState, useRef, useCallback, useMemo } from 'react';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import { saveAs } from 'file-saver';
import Excel from 'exceljs';
import CustomToolbarButton from './CustomToolbarButton';
import { GridExporter } from '@devexpress/dx-react-grid-export';
import ClearIcon from '@material-ui/icons/Clear';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import WebIcon from '@material-ui/icons/Web';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import {
    Grid,
    DragDropProvider,
    TableHeaderRow,
    TableColumnReordering,
    TableColumnResizing,
    TableSelection,
    PagingPanel,
    TableColumnVisibility,
    Toolbar,
    ColumnChooser,
    TableFixedColumns,
    VirtualTable,
    ExportPanel,
    GroupingPanel,
    TableGroupRow,
    TableFilterRow,
    SearchPanel,
    TableInlineCellEditing,
    TableRowDetail,
} from '@devexpress/dx-react-grid-material-ui';

import { Item, ColumnDefinition } from './types';
import { FilterPredicatesMap } from './Filters';
import Loading from '../Loading';
import DataTypeFormatter from './DataTypeFormatter';
import {
    Column,
    PagingState,
    SelectionState,
    IntegratedSelection,
    Sorting,
    SortingState,
    IntegratedSorting,
    TableColumnWidthInfo,
    CustomPaging,
    IntegratedGrouping,
    GroupingState,
    Grouping,
    FilteringState,
    IntegratedFiltering,
    Filter,
    SearchState,
    EditingState,
    ChangeSet,
} from '@devexpress/dx-react-grid';
import { GridPaper } from './styled';

export interface TableSettings {
    pageSize: number;
    fixedColumns?: (string | symbol)[];
    columnOrder?: string[];
    hiddenColumnNames?: string[];
    columnWidths?: TableColumnWidthInfo[];
    grouping?: Grouping[];
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

const pageSizes = [25, 50, 100, 1000, 10000];

const MyTable: React.FC<TableProps<Item>> = ({
    columnsDefinition,
    data,
    selectedItems,
    isLoading,
    total,
    page,
    sortBy,
    sortDirection = 'asc',
    exportFileName = 'data',
    settings,
    hideSelectionColumn,
    onChangeData,
    onChangePage,
    onChangeItemsSelection,
    onChangeItemSelection,
    onChangeSettings,
    onChangeSorting,
    onResetSettings,
}) => {
    const t = useTranslations();
    const exporterRef = useRef<typeof GridExporter>();
    const [internalSelected, setInternalSelected] = React.useState<Array<number | string>>([]);
    const [internalSorting, setInternalSorting] = React.useState<Sorting[]>([]);
    const [showFiltersRow, setShowFiltersRow] = React.useState<boolean>(false);
    const [rows, setRows] = React.useState(data);

    const [f3] = useState([TableSelection.COLUMN_TYPE, 'name']);
    const {
        pageSize = 10,
        fixedColumns = [],
        hiddenColumnNames = [],
        grouping = [],
        expandedGroups = [],
        columnOrder = [],
        columnWidths: _columnWidths,
    } = settings;
    //fixedC2.push(fixedColumns);
    fixedColumns.push(TableSelection.COLUMN_TYPE);
    React.useEffect(() => setRows(data), [setRows, data]);
    fixedColumns.push();
    const [columns] = useState<Column[]>(
        columnsDefinition.map((c) => ({
            name: c.columnName,
            title: t(c.labelTK),
            getCellValue: c.getCellValue,
        })),
    );

    const [sortingStateColumnExtensions] = useState<SortingState.ColumnExtension[]>(
        columnsDefinition
            .filter((c) => !c.canBeSorted)
            .map((c) => ({ columnName: c.columnName, sortingEnabled: false })),
    );

    const [filteringStateColumnExtensions] = useState<FilteringState.ColumnExtension[]>(
        columnsDefinition
            .filter((c) => !c.canBeFiltered)
            .map((c) => ({ columnName: c.columnName, filteringEnabled: false })),
    );

    const [tableColumnExtensions] = useState<VirtualTable.ColumnExtension[]>(
        columnsDefinition.filter((c) => !!c.align).map((c) => ({ columnName: c.columnName, align: c.align })),
    );

    const [filteringColumnExtensions] = useState(
        columnsDefinition
            .filter((c) => !!c.templateType)
            .map((c) => ({
                columnName: c.columnName,
                predicate: (value: any, filter: Filter, row: any) => {
                    if (!filter.value?.length) return true;
                    const filtersPredicates = c.templateType && FilterPredicatesMap[c.templateType];
                    const filterPredicate = filtersPredicates && filtersPredicates[filter.operation || ''];
                    if (filterPredicate) return filterPredicate(value, filter.value);
                    return IntegratedFiltering.defaultPredicate(value, filter, row);
                },
            })),
    );

    const [groupingStateColumnExtensions] = useState<GroupingState.ColumnExtension[]>(
        columnsDefinition.map((c) => ({
            columnName: c.columnName,
            groupingEnabled: !!c.canBeGrouped,
        })),
    );

    const [tableGroupColumnExtension] = useState<TableGroupRow.ColumnExtension[]>(
        columnsDefinition.map((c) => ({
            columnName: c.columnName,
            showWhenGrouped: true,
        })),
    );

    const [integratedGroupingColumnExtensions] = useState<IntegratedGrouping.ColumnExtension[]>(
        columnsDefinition.map((c) => ({
            columnName: c.columnName,
            criteria: (val: any) => ({
                key: (c.getGroupValue ? c.getGroupValue(val) : val) || t(TK.empty),
            }),
        })),
    );

    const [editStateColumnExtensions] = useState<EditingState.ColumnExtension[]>(
        columnsDefinition.map((c) => ({
            columnName: c.columnName,
            editingEnabled: !!c.canBeEdited,
        })),
    );

    const groupCellContent = useMemo<React.FC<TableGroupRow.ContentProps>>(
        () => (props: TableGroupRow.ContentProps) => {
            var definition = columnsDefinition.find((c) => c.columnName === props.column.name);
            var groupedData = rows
                .map((d) =>
                    !!definition?.getCellValue
                        ? definition.getCellValue(d)
                        : !!definition && !!d
                        ? d[definition.columnName]
                        : undefined,
                )
                .filter((val) => (definition?.getGroupValue ? definition.getGroupValue(val) : val) === props.row.value);

            return (
                <span>
                    <strong>{props.column.title}</strong>
                    {': '}
                    {!!definition?.renderGroupCell
                        ? definition.renderGroupCell(groupedData, props.row.value, t)
                        : props.row.value}
                </span>
            );
            // eslint-disable-next-line
        },
        [rows],
    );

    const [filters, setFilters] = useState<Filter[]>([]);
    const [searchValue, setSearchState] = useState('');

    const setPageSize = (pageSize: number) => onChangeSettings({ ...settings, pageSize });
    const setColumnOrder = (columnOrder: string[]) => onChangeSettings({ ...settings, columnOrder });
    const setColumnWidths = (columnWidths: TableColumnWidthInfo[]) => onChangeSettings({ ...settings, columnWidths });
    const setHiddenColumnNames = (hiddenColumnNames: string[]) => onChangeSettings({ ...settings, hiddenColumnNames });
    const setGrouping = (grouping: Grouping[]) => onChangeSettings({ ...settings, grouping });
    const setExpandedGroups = (expandedGroups: string[]) => onChangeSettings({ ...settings, expandedGroups });

    const columnWidths = useMemo<TableColumnWidthInfo[]>(() => {
        return columnsDefinition.map(
            (c) =>
                _columnWidths?.find((w) => w.columnName === c.columnName) || {
                    columnName: c.columnName,
                    width: c.defaultWidth || 180,
                },
        );
        // eslint-disable-next-line
    }, [_columnWidths]);

    const sorting = useMemo<Sorting[]>(() => {
        return sortBy ? [{ columnName: sortBy, direction: sortDirection }] : internalSorting;
        // eslint-disable-next-line
    }, [internalSorting, sortBy, sortDirection]);

    const selection = useMemo<Array<number | string>>(() => {
        return (
            (!selectedItems
                ? internalSelected
                : selectedItems.map((id) => rows.findIndex((d: Item) => d.id === id)).filter((idx) => idx !== -1)) || []
        );
        // eslint-disable-next-line
    }, [internalSelected, selectedItems, rows]);

    const setSorting = useCallback(
        (sorting: Sorting[]) => {
            return !onChangeSorting
                ? setInternalSorting(sorting)
                : sorting.length
                ? onChangeSorting(sorting[0].columnName, sorting[0].direction)
                : onChangeSorting(undefined, undefined);
            // eslint-disable-next-line
        },
        [sorting],
    );

    const setSelection = useCallback(
        (selected: Array<number | string>) => {
            if (!onChangeItemSelection && !onChangeItemsSelection) {
                setInternalSelected(selected);
            } else {
                const newSelected = selected
                    .map((idx) => idx as number)
                    .filter((idx) => !selection.includes(idx))
                    .map((idx) => rows[idx].id);
                const newDeselected = selection
                    .filter((idx) => !selected.includes(idx))
                    .map((idx) => rows[idx as any].id);
                if (onChangeItemSelection) {
                    newSelected.forEach((id) => onChangeItemSelection(id, true));
                    newDeselected.forEach((id) => onChangeItemSelection(id, false));
                }
                if (onChangeItemsSelection) {
                    onChangeItemsSelection(selected);
                }
            }
            // eslint-disable-next-line
        },
        [rows, selection],
    );

    const startExport = useCallback(() => {
        exporterRef.current?.exportGrid();
    }, [exporterRef]);

    const onSave = useCallback(
        (workbook: Excel.Workbook) => {
            workbook.xlsx.writeBuffer().then((buffer: Excel.Buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${exportFileName}.xlsx`);
            });
        },
        [exportFileName],
    );

    const commitChanges = (changes: ChangeSet) => {
        const { changed } = changes;
        if (changed) {
            setRows((prev) => prev.map((row, i) => (changed[i] ? { ...row, ...changed[i] } : row)));
        }
    };

    return (
        <GridPaper>
            {isLoading && <Loading isLoading={isLoading} />}
            <Grid rows={rows} columns={columns}>
                <DragDropProvider />

                {columnsDefinition
                    .filter((c) => c.renderTableCell)
                    .map((c) => (
                        <DataTypeFormatter
                            key={c.columnName}
                            t={t}
                            column={c}
                            renderTableCell={c.renderTableCell as any}
                        />
                    ))}

                <FilteringState
                    filters={filters}
                    onFiltersChange={setFilters}
                    columnExtensions={filteringStateColumnExtensions}
                />
                <SearchState value={searchValue} onValueChange={setSearchState} />
                <SelectionState selection={selection} onSelectionChange={setSelection} />
                <PagingState
                    currentPage={page}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    onCurrentPageChange={onChangePage}
                    defaultPageSize={25}
                />
                <SortingState
                    sorting={sorting}
                    onSortingChange={setSorting}
                    columnExtensions={sortingStateColumnExtensions}
                />
                <GroupingState
                    grouping={grouping}
                    expandedGroups={expandedGroups}
                    onGroupingChange={setGrouping}
                    onExpandedGroupsChange={setExpandedGroups}
                    columnExtensions={groupingStateColumnExtensions}
                />
                <EditingState onCommitChanges={commitChanges} columnExtensions={editStateColumnExtensions} />

                <IntegratedFiltering columnExtensions={filteringColumnExtensions} />
                <CustomPaging totalCount={total} />
                <IntegratedGrouping columnExtensions={integratedGroupingColumnExtensions} />
                <IntegratedSorting />
                <IntegratedSelection />

                <VirtualTable
                    height="28rem"
                    columnExtensions={tableColumnExtensions}
                    messages={{
                        noData: t(TK.noData),
                    }}
                />
                <TableColumnVisibility
                    hiddenColumnNames={hiddenColumnNames}
                    onHiddenColumnNamesChange={setHiddenColumnNames}
                    messages={{
                        noColumns: t(TK.noColumns),
                    }}
                />
                <TableColumnResizing columnWidths={columnWidths} onColumnWidthsChange={setColumnWidths} />
                <TableColumnReordering order={columnOrder} onOrderChange={setColumnOrder} />
                <TableHeaderRow
                    showSortingControls
                    messages={{
                        sortingHint: t(TK.sort),
                    }}
                />
                {showFiltersRow && (
                    <TableFilterRow
                        showFilterSelector
                        messages={{
                            contains: t(TK.contains),
                            notContains: t(TK.notContains),
                            startsWith: t(TK.startsWith),
                            endsWith: t(TK.endsWith),
                            equal: t(TK.equal),
                            notEqual: t(TK.notEqual),
                            greaterThan: t(TK.greaterThan),
                            greaterThanOrEqual: t(TK.greaterThanOrEqual),
                            lessThan: t(TK.lessThan),
                            lessThanOrEqual: t(TK.lessThanOrEqual),
                        }}
                    />
                )}
                <TableSelection showSelectAll highlightRow showSelectionColumn={!hideSelectionColumn} />
                <TableGroupRow
                    columnExtensions={tableGroupColumnExtension}
                    contentComponent={groupCellContent}
                    messages={
                        {
                            /* TODO when required */
                        }
                    }
                />
                <TableFixedColumns leftColumns={fixedColumns} rightColumns={[]} />

                <Toolbar />
                <TableInlineCellEditing startEditAction="doubleClick" selectTextOnEditStart />
                <GroupingPanel
                    showGroupingControls
                    // showSortingControls
                    messages={{
                        groupByColumn: t(TK.dragColumnToGroup),
                    }}
                />
                {!!total && (
                    <PagingPanel
                        pageSizes={pageSizes}
                        messages={{
                            info: ({ from, to, count }) => t(TK.fromToOf, from, to, count),
                            rowsPerPage: t(TK.rowsPerPage),
                            showAll: t(TK.showAll),
                        }}
                    />
                )}
                {data !== rows && onChangeData && (
                    <CustomToolbarButton
                        icon={SaveAltIcon}
                        color="success"
                        title={t(TK.saveChanges)}
                        onClick={() => onChangeData && onChangeData(rows)}
                    />
                )}
                {(!!filters.length || !!searchValue.length) && (
                    <CustomToolbarButton
                        icon={ClearIcon}
                        color="error"
                        title={t(TK.clearAllFilters)}
                        onClick={() => {
                            setFilters([]);
                            setSearchState('');
                        }}
                    />
                )}
                <SearchPanel
                    messages={{
                        searchPlaceholder: t(TK.search),
                    }}
                />
                {onResetSettings && (
                    <CustomToolbarButton
                        icon={RotateLeftIcon}
                        title={t(TK.resetTableSettings)}
                        onClick={() => onResetSettings()}
                    />
                )}
                <CustomToolbarButton
                    icon={WebIcon}
                    title={t(TK.showHideTablePageFilters)}
                    onClick={() => setShowFiltersRow(!showFiltersRow)}
                />
                <ColumnChooser
                    messages={{
                        showColumnChooser: t(TK.hideColumns),
                    }}
                />
                {exportFileName && (
                    <ExportPanel
                        startExport={startExport}
                        messages={{
                            showExportMenu: t(TK.export),
                            exportAll: t(TK.exportVisibleItems),
                            exportSelected: t(TK.exportSelectedItems),
                        }}
                    />
                )}
            </Grid>
            <GridExporter
                ref={exporterRef}
                rows={rows}
                columns={columns}
                selection={selection}
                sorting={sorting}
                columnOrder={columnOrder}
                hiddenColumnNames={hiddenColumnNames}
                onSave={onSave}
            />
        </GridPaper>
    );
};

export default MyTable;
