import React, { useCallback, useMemo, useRef } from 'react';
import moment from 'moment';
import {
    createStyles,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    makeStyles,
    Theme,
    Typography,
} from '@material-ui/core';
import queryString from 'query-string';
import { useSelector, useDispatch } from 'react-redux';
import { ProductV2 } from '../../models/ProductV2';
import { SupplierState } from '../../models/SupplierState';
import {
    supplierSelected,
    supplierDeselected,
    supplierSelectedV3,
    supplierDeselectedV3,
} from '../../store/Suppliers/actions';
import { addOriginByProductId } from '../../store/ProductsV2/actions';
import { getOriginsByProductId } from '../../store/ProductsV2/selectors';
import {
    isLoadingSuppliers,
    getSearchTotalIncludingNotLoaded,
    getSearchResultSuppliers,
    getSelectedSuppliers,
    getProductSelectedSuppliers,
} from '../../store/Suppliers/selectors';
import Table from '../../components/AGTable';
import { columnsAGArray } from '../../pages/SuppliersListV2/columns';
import { ColDef, ColGroupDef, RowSelectedEvent } from 'ag-grid-community';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import SuppliersFilters from '../../pages/SuppliersListV3/SuppliersFilters';
import { Filters } from '../../pages/SuppliersListV3/SuppliersFilters/types';
import ReactCountryFlag from 'react-country-flag';
import { CloseIconWrapper, DialogTitleContainer } from '../../pages/ProductsListV3/styled';
import { RouterAction } from 'connected-react-router';
import { useLocation } from 'react-router-dom';

interface ISuppliersListDialog {
    open: boolean;
    productOpen: ProductV2 | null;
    handleDialogClose: () => void;
    handleFiltersChange: (filters: Filters) => RouterAction;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        typography: {
            padding: theme.spacing(2),
        },
    }),
);

export const SuppliersListDialog: React.FC<ISuppliersListDialog> = ({
    productOpen,
    open,
    handleFiltersChange,
    handleDialogClose,
}) => {
    const t = useTranslations();
    const dispatch = useDispatch();
    const classes = useStyles();
    const location = useLocation();

    const defaultColDef = useMemo(
        () => ({
            sortable: true,
            wrapHeaderText: true,
            resizable: false,
            autoHeaderHeight: true,
            suppressMovable: true,
            showDisabledCheckboxes: true,
        }),
        [],
    );

    const isLoading = useSelector(isLoadingSuppliers);
    const total = useSelector(getSearchTotalIncludingNotLoaded) || 0;
    const suppliersResults = useSelector(getSearchResultSuppliers) || [];
    const selectedSuppliers = useSelector(getSelectedSuppliers) || [];
    const productOrigins = useSelector(getOriginsByProductId) || {};
    const selectedProductSuppliers = useSelector(getProductSelectedSuppliers) || {};

    const supplierResultOhtersFilter = suppliersResults.filter((supplier) => {
        return !(supplier.state === SupplierState.Others && supplier.classification === 0);
    });

    const query = React.useMemo(
        () => {
            return queryString.parse(location.search) as Filters & {
                sortBy: string;
                sortType: 'asc' | 'desc';
            };
        },
        // eslint-disable-next-line
        [location.search],
    );

    // eslint-disable-next-line
    const handleItemSelectionChange = useCallback(
        (id: string, selected: boolean) => {
            if (selected) {
                dispatch(supplierSelectedV3(productOpen?.id || '', id));
            } else {
                dispatch(supplierDeselectedV3(productOpen?.id || '', id));
            }
        },
        [productOpen],
    );

    const onFirstDataRendered = (params: any) => {
        let productSuppliers: any = (productOpen?.id && selectedProductSuppliers[productOpen?.id]) || [];
        if (productSuppliers && productSuppliers.length) {
            params.api.forEachNode((node: any) => {
                //let isSupplierPresent = selectedSuppliers.find((supplier) => supplier.id === node.data.id);
                let isSupplierPresent = null;
                if (productOpen?.id) {
                    isSupplierPresent = selectedProductSuppliers[productOpen?.id].find(
                        (supplierId: any) => supplierId === node.data.id,
                    );
                }
                //const isProductSupplierPresent = selectedProductSuppliers[productOpen?.id].find((supplierId: any)=>supplierId === node.data.id);
                if (isSupplierPresent) {
                    node.setSelected(true);
                }
            });
        }
    };

    const getSuppliersByCountryCode = () => {
        return query && query.countries
            ? supplierResultOhtersFilter.filter((s) => query.countries && query.countries.includes(s.countryCode)) || []
            : [];
    };

    const closeDialog = () => {
        handleDialogClose();
    };

    const onchange = (filters: Filters) => {
        handleFiltersChange(filters);
        const countries = Array.isArray(filters?.countries) ? filters?.countries : [filters?.countries];
        if (countries && countries.length && productOpen) {
            dispatch(addOriginByProductId(productOpen?.id, countries));
        }
    };

    return (
        <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="xl">
            <DialogTitle style={{ padding: 0 }}>
                <DialogTitleContainer>
                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                            <ReactCountryFlag
                                style={{ height: 20, width: 20 }}
                                svg
                                countryCode={productOpen?.countryCode || ''}
                            />
                            <Typography style={{ marginLeft: '5px' }} variant="h5">
                                {productOpen?.originalName || productOpen?.name}
                            </Typography>
                        </div>
                    </div>
                    <CloseIconWrapper>
                        <IconButton onClick={closeDialog} style={{ outline: 'none' }}>
                            <HighlightOffIcon color="primary" fontSize="large" />
                        </IconButton>
                    </CloseIconWrapper>
                </DialogTitleContainer>

                <hr style={{ margin: 0 }} />
            </DialogTitle>
            <DialogContent style={{ width: '100%' }}>
                <SuppliersFilters initialValues={query} onChange={onchange} />
                {supplierResultOhtersFilter && !!supplierResultOhtersFilter.length && (
                    <Table
                        columnsDefinition={columnsAGArray as ColDef[] | ColGroupDef[]}
                        captionAnalytics={''}
                        isLoading={isLoading}
                        defaultColDef={defaultColDef}
                        total={suppliersResults.length}
                        isExportable={false}
                        pageSize={1000}
                        data={getSuppliersByCountryCode()}
                        rowSelection="multiple"
                        onFirstDataRendered={onFirstDataRendered}
                        enablePagination={false}
                        onRowSelected={(event: RowSelectedEvent) => {
                            const {
                                node: {
                                    data: { id: supplierId },
                                },
                            } = event;

                            handleItemSelectionChange(supplierId as string, !!event.node.isSelected());
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};
