import React, { useState, useRef, useCallback, useMemo, MutableRefObject } from 'react';

import {
    ColDef,
    ColGroupDef,
    RowClassRules,
    RowNode,
    RowSelectedEvent,
    FirstDataRenderedEvent,
    RowDataUpdatedEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';
import { LicenseManager } from 'ag-grid-enterprise';
import { useTranslations } from '../../store/Translations/hooks';

import { Item, TableSettings } from './types';
import { INavigationProps, AGCustomPagination } from './AGCustomPagination';
import { AppContext } from '../../app/App';
import { AppContextType } from '../../context/@types/types';
import { setTimeout } from 'timers';
import { AGSearch } from './AGSearch';
import { ProductV2 } from '../../models/ProductV2';
import { AGToolbar } from './AGToolbar';

import '../../app/css/agridCustom.css';
import '../../app/css/quotesGrid.css';
import { RFQQuoteTableItem } from '../../pages/RFQDetailsV2';

LicenseManager.setLicenseKey(
    'For_Trialing_ag-Grid_Only-Not_For_Real_Development_Or_Production_Projects-Valid_Until-1_October_2022_[v2]_MTY2NDU3ODgwMDAwMA==5f7c547bfa346b114d2e599f9df6045b',
);

type SelectionTypes = 'single' | 'multiple' | undefined;

export interface TableProps<T extends Item> {
    columnsDefinition: ColDef[] | ColGroupDef[];
    data: T[];
    selectedItems?: (string | number)[];
    total?: number;
    timeInSeconds?: number;
    rowHeight?: number;
    pageSize?: number;
    pagination?: boolean;
    isLoading?: boolean;
    sortBy?: string;
    isCreateRfq?: boolean;
    isExportable: boolean;
    suppressClickEdit?: boolean;
    stopEditingWhenCellsLoseFocus?: boolean;
    enablePagination?: boolean;
    suppressRowClickSelection?: boolean;
    captionAnalytics?: string | undefined;
    selectedQuotes?: RFQQuoteTableItem[];
    sortDirection?: 'asc' | 'desc';
    exportFileName?: string;
    settings?: TableSettings;
    hideSelectionColumn?: boolean;
    rowSelection?: SelectionTypes;
    searchColumns?: string[];
    deselectRow?: string;
    defaultColDef?: {
        sortable: boolean;
        wrapHeaderText: boolean;
        resizable: boolean;
        autoHeaderHeight: boolean;
        suppressMovable: boolean;
    };
    rowClassRules?: RowClassRules<any>;
    onChangeData?: (data: T) => void;
    onRowSelected?: (event: RowSelectedEvent) => void;
    onChangePage?: (page: number) => void;
    onChangeItemsSelection?: (selectedItems: Array<number | string>) => void;
    onChangeItemSelection?: (itemId: number | string, isSelected: boolean) => void;
    onChangeSettings?: (settings: TableSettings) => void;
    onChangeSorting?: (sortBy?: string, sortDirection?: 'asc' | 'desc') => void;
    onResetSettings?: () => void;
    onFirstDataRendered?: (event: FirstDataRenderedEvent) => void;
    onRowDataUpdated?: (event: RowDataUpdatedEvent) => void;
    onCreateRfq?: () => void;
}

const AGTable: React.FC<TableProps<Item>> = ({
    columnsDefinition,
    data,
    total,
    defaultColDef,
    searchColumns,
    deselectRow,
    pageSize,
    timeInSeconds,
    rowSelection,
    isExportable,
    captionAnalytics,
    enablePagination,
    isCreateRfq,
    rowHeight,
    suppressClickEdit,
    suppressRowClickSelection,
    stopEditingWhenCellsLoseFocus,
    selectedQuotes,
    onCreateRfq,
    onRowSelected,
    onFirstDataRendered,
    onRowDataUpdated,
    onChangeData,
}) => {
    const [searchText, setSearchText] = useState('');
    const colDefs = useMemo(() => columnsDefinition, []);
    const t = useTranslations();
    const { isOpen } = React.useContext(AppContext) as AppContextType;
    let gridRef = useRef<AgGridReact>(null);

    const [navigation, setNavigation] = useState<INavigationProps>({
        prevBtn: false,
        nextBtn: true,
        currentPage: 1,
        pageSize: pageSize,
        totalPages: 0,
    });

    const [rows, setRows] = React.useState(data);
    const [gridRowsCount, setGridRowsCount] = React.useState(0);
    const [gridTimeInSeconds, setGridTimeInSeconds] = React.useState(0);

    React.useEffect(() => {
        const controller = new AbortController();
        return () => {
            controller.abort();
        };
    }, []);

    React.useEffect(() => {
        setGridRowsCount(total || 0);
        setGridTimeInSeconds(timeInSeconds || 0);
    }, [setGridRowsCount, total, timeInSeconds, setGridTimeInSeconds]);

    React.useEffect(() => setRows(data), [setRows, data]);

    React.useEffect(() => {
        setTimeout(function () {
            window.dispatchEvent(new Event('resize'));
        }, 200);
    }, [isOpen]);

    React.useEffect(() => {
        gridRef.current!.api?.forEachNode(function (node) {
            const itemIdArray = deselectRow?.split('_');
            const itemId = (itemIdArray && itemIdArray[0]) || 0;
            const supplierId = (itemIdArray && itemIdArray[1]) || 0;
            if (node.isSelected() && node.data.id === itemId && node.data.supplierId === supplierId) {
                node.setSelected(false);
            }
        });
    }, [deselectRow]);

    React.useEffect(() => {
        gridRef.current!.api?.forEachNode(function (node) {
            selectedQuotes?.forEach((item) => {
                if (node.data.id === item.id && node.data.supplierId === item.supplierId) {
                    node.setSelected(true);
                }
            });
        });
    }, [selectedQuotes]);

    const onGridReady = useCallback((params) => {
        params.api?.sizeColumnsToFit();
        //}, 500);

        window.addEventListener('resize', function () {
            setTimeout(function () {
                params.api?.sizeColumnsToFit();
            }, 100);
        });
    }, []);

    const onPageSizeChanged = useCallback((val) => {
        if (gridRef.current) {
            gridRef.current.api.paginationSetPageSize(Number(val));
        }
    }, []);

    const onPaginationChanged = useCallback(() => {
        if (gridRef.current) {
            setNavigation({
                ...navigation,
                pageSize: gridRef.current.api.paginationGetPageSize(),
                currentPage: gridRef.current.api.paginationGetCurrentPage() + 1,
                totalPages: gridRef.current.api.paginationGetTotalPages(),
                prevBtn:
                    gridRef.current.api.paginationGetCurrentPage() + 1 > 1 &&
                    gridRef.current.api.paginationGetCurrentPage() <= gridRef.current.api.paginationGetTotalPages()
                        ? false
                        : true,
                nextBtn:
                    gridRef.current.api.paginationGetCurrentPage() + 1 === gridRef.current.api.paginationGetTotalPages()
                        ? true
                        : false,
            });
        }
    }, []);

    const onBtnFirst = useCallback(() => {
        gridRef.current?.api.paginationGoToFirstPage();
    }, []);

    const onBtnLast = useCallback(() => {
        gridRef.current?.api.paginationGoToLastPage();
    }, []);

    const onBtnNext = useCallback(() => {
        gridRef.current?.api.paginationGoToNextPage();
    }, []);

    const onBtnPrevious = useCallback(() => {
        gridRef.current?.api.paginationGoToPreviousPage();
    }, []);

    const onPgNumberChange = useCallback((pgNumber) => {
        gridRef.current?.api.paginationGoToPage(pgNumber);
    }, []);

    const onInputSearchChange = useCallback(
        (val: string) => {
            if (gridRef.current) {
                setSearchText(val);
                setTimeout(() => {
                    gridRef.current!.api.onFilterChanged();
                    if (val.length > 0) {
                        const searchedRecordsCount = gridRef.current!.api.getDisplayedRowCount();
                        setGridRowsCount(searchedRecordsCount);
                        setGridTimeInSeconds(300 / 1000);
                    }
                }, 300);

                //console.log(' total rows ', gridRef.current?.api.getDisplayedRowCount());
            }
        },
        [setSearchText, setGridRowsCount],
    );

    const isExternalFilterPresent = useCallback((): boolean => {
        // if ageType is not everyone, then we are filtering
        if (searchText.length > 0 && searchColumns) {
            return true;
        }
        return false;
    }, [searchText, searchColumns]);

    const doesExternalFilterPass = useCallback(
        (node: RowNode<Item>): boolean => {
            let sourceString = '';
            let count = 0;
            let wordsList = [];
            let isWords = false;

            //Triming space from the searchString
            let searchString = searchText.trim();

            // Making source string to perform search
            searchColumns?.forEach((element) => {
                if (node.data && node.data[element]) {
                    if (element == 'activeSubstances' || element == 'pharmaceuticalFormCategories') {
                        if (Array.isArray(node.data[element])) {
                            sourceString = sourceString.concat(node.data[element].join(' ') + ' ');
                        }
                    }
                    sourceString = sourceString.concat(node.data[element] + ' ');
                }
            });

            // Breaking search string into words if space found
            if (searchString.indexOf(' ') > -1) {
                isWords = true;
                wordsList = searchString.split(' ');
                wordsList.forEach((word) => {
                    if (word && sourceString.toLowerCase().includes(word.toLowerCase())) {
                        count++;
                    }
                });
                // Check if the user typed a single word
            } else if (sourceString.toLowerCase().includes(searchString.toLowerCase())) {
                isWords = false;
                count = 1;
            }

            //Record ready for the grid if filter passed
            if (searchString.length > 0 && count === 1 && !isWords) {
                return true;
            } else if (isWords && count === wordsList.length) {
                return true;
            } else if (searchString.length === 0) {
                return true;
            }
            return false;
        },
        [searchText, searchColumns],
    );

    const onBtnExport = useCallback(() => {
        gridRef.current!.api.exportDataAsExcel({
            onlySelected: true,
        });
    }, []);

    const onCellValueChanged = (event: { data: Item }) => {
        if (gridRef) {
            gridRef.current!.api.stopEditing(true);
        }

        onChangeData && onChangeData(event.data);
        return;
    };

    const statusBar = {
        statusPanels: [
            {
                statusPanel: 'agTotalAndFilteredRowCountComponent',
                align: 'left',
            },
        ],
    };

    return (
        <div className="ag-theme-alpine" style={{ width: '100%', height: 'auto' }}>
            <AGToolbar
                onBtnExport={onBtnExport}
                data={data}
                isExportable={isExportable}
                onInputSearchChange={onInputSearchChange}
                searchColumns={searchColumns || []}
                isCreateRfq={isCreateRfq}
                onCreateRfq={onCreateRfq}
            />

            <AgGridReact
                ref={gridRef}
                className="ag-theme-alpine"
                defaultColDef={defaultColDef}
                animateRows={true}
                rowData={rows}
                rowHeight={rowHeight ? rowHeight : 60}
                domLayout="autoHeight"
                suppressPaginationPanel={true}
                isExternalFilterPresent={isExternalFilterPresent}
                doesExternalFilterPass={doesExternalFilterPass}
                onCellValueChanged={onCellValueChanged}
                suppressRowClickSelection={suppressRowClickSelection ? true : false}
                stopEditingWhenCellsLoseFocus={stopEditingWhenCellsLoseFocus ? true : false}
                rowMultiSelectWithClick={true}
                columnDefs={colDefs}
                paginationPageSize={pageSize}
                tooltipShowDelay={100}
                valueCache={true}
                suppressClickEdit={suppressClickEdit || false}
                valueCacheNeverExpires={true}
                pagination={true}
                rowSelection={rowSelection}
                onGridReady={onGridReady}
                onFirstDataRendered={onFirstDataRendered}
                onRowDataUpdated={onRowDataUpdated}
                onRowSelected={onRowSelected}
                onPaginationChanged={onPaginationChanged}
            />
            {data && data.length > 0 ? (
                <AGCustomPagination
                    {...navigation}
                    caption={captionAnalytics}
                    enablePagination={enablePagination}
                    totalRecords={gridRowsCount}
                    timeInSeconds={gridTimeInSeconds}
                    onBtnFirst={onBtnFirst}
                    onBtnLast={onBtnLast}
                    onBtnNext={onBtnNext}
                    onBtnPrevious={onBtnPrevious}
                    onPageSizeChanged={onPageSizeChanged}
                    onPgNumberChange={onPgNumberChange}
                />
            ) : (
                ''
            )}
        </div>
    );
};

export default AGTable;
