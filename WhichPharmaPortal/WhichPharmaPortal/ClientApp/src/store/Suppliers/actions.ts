import { AppThunkAction } from '..';
import { Supplier } from '../../models/Supplier';
import { Action } from 'redux';
import { getSuppliersAsync } from '../../fetch/requests';
import {
    SuppliersLoadedAction,
    SupplierAction,
    SupplierByProductAction,
    SupplierContactAction,
    SupplierContactSelectedAction,
    SupplierActionV3,
    SupplierContactSelectedActionV3,
    SupplierContactActionV3,
} from './types';
import { SearchResult } from '../../models/SearchResult';
import { alertGenericError, requestServer } from '../Session/actions';

export const Actions = {
    suppliersLoading: '@@whichpharma.suppliers.loading',
    suppliersLoaded: '@@whichpharma.suppliers.loaded',
    suppliersLoadError: '@@whichpharma.suppliers.loadError',
    supplierSelected: '@@whichpharma.suppliers.supplierSelected',
    supplierSelectedV3: '@@whichpharma.suppliers.supplierSelectedV3',
    supplierDeselectedV3: '@@whichpharma.suppliers.supplierDeselectedV3',
    supplierSelectedByProductId: '@@whichpharma.suppliers.supplierSelectedByProductId',
    supplierDeselected: '@@whichpharma.suppliers.supplierDeselected',
    supplierContactSelected: '@@whichpharma.suppliers.supplierContactSelected',
    supplierContactSelectedV3: '@@whichpharma.suppliers.supplierContactSelectedV3',
    supplierContactDeselected: '@@whichpharma.suppliers.supplierContactDeselected',
    supplierContactDeselectedV3: '@@whichpharma.suppliers.supplierContactDeselectedV3',
    suppliersDeselectAll: '@@whichpharma.suppliers.suppliersDeselectAll',
};

const suppliersLoading = (): Action => ({
    type: Actions.suppliersLoading,
});

const suppliersLoaded = (result: SearchResult<Supplier>): SuppliersLoadedAction => ({
    type: Actions.suppliersLoaded,
    result,
});

const suppliersLoadError = (): Action => ({
    type: Actions.suppliersLoadError,
});

export const supplierSelected = (supplierId: string): SupplierAction => ({
    type: Actions.supplierSelected,
    supplierId,
});

export const supplierSelectedV3 = (productId: string, supplierId: string): SupplierActionV3 => ({
    type: Actions.supplierSelectedV3,
    productId,
    supplierId,
});

export const supplierSelectedByProductId = (supplierId: string, productId: string): SupplierByProductAction => ({
    type: Actions.supplierSelectedByProductId,
    supplierId,
    productId,
});

export const supplierDeselected = (supplierId: string): SupplierAction => ({
    type: Actions.supplierDeselected,
    supplierId,
});

export const supplierDeselectedV3 = (productId: string, supplierId: string): SupplierActionV3 => ({
    type: Actions.supplierDeselectedV3,
    productId,
    supplierId,
});

export const supplierContactSelected = (email: string, isCC: boolean): SupplierContactSelectedAction => ({
    type: Actions.supplierContactSelected,
    email,
    isCC,
});

export const supplierContactSelectedV3 = (
    productId: string,
    email: string,
    isCC: boolean,
): SupplierContactSelectedActionV3 => ({
    type: Actions.supplierContactSelectedV3,
    productId,
    email,
    isCC,
});

export const supplierContactDeselectedV3 = (productId: string, email: string): SupplierContactActionV3 => ({
    type: Actions.supplierContactDeselectedV3,
    productId,
    email,
});

export const supplierContactDeselected = (email: string): SupplierContactAction => ({
    type: Actions.supplierContactDeselected,
    email,
});

export const suppliersDeselectAll = (): Action => ({
    type: Actions.suppliersDeselectAll,
});

export const fetchSuppliers = (
    offset: number,
    pageSize: number,
    filters: { [property: string]: string | string[] | undefined },
): AppThunkAction<Promise<void>> => {
    return async (dispatch) => {
        try {
            dispatch(suppliersLoading());
            const result = await dispatch(
                requestServer((token) => getSuppliersAsync(offset, pageSize, filters, token)),
            );
            dispatch(suppliersLoaded(result || []));
        } catch (e) {
            console.log(e);
            dispatch(suppliersLoadError());
            dispatch(alertGenericError());
        }
    };
};
