import { AppThunkAction } from '..';
import { Action } from 'redux';
import { getProductsAsync } from '../../fetch/requests';
import { ProductsLoadedAction, ProductAction } from './types';
import { SearchResult } from '../../models/SearchResult';
import { alertGenericError, requestServer } from '../Session/actions';
import { ProductV1 } from '../../models/ProductV1';

export const Actions = {
    productsLoading: '@@whichpharma.products.loading',
    productsLoaded: '@@whichpharma.products.loaded',
    productsLoadError: '@@whichpharma.products.loadError',
    productSelected: '@@whichpharma.products.productSelected',
    productDeselected: '@@whichpharma.products.productDeselected',
    productsDeselectAll: '@@whichpharma.products.productsDeselectAll',
};

const productsLoading = (): Action => ({
    type: Actions.productsLoading,
});

const productsLoaded = (result: SearchResult<ProductV1>): ProductsLoadedAction => ({
    type: Actions.productsLoaded,
    result,
});

const productsLoadError = (): Action => ({
    type: Actions.productsLoadError,
});

export const productsDeselectAll = (): Action => ({
    type: Actions.productsDeselectAll,
});

export const productSelected = (productId: string): ProductAction => ({
    type: Actions.productSelected,
    productId,
});

export const productDeselected = (productId: string): ProductAction => ({
    type: Actions.productDeselected,
    productId,
});

export const fetchProducts = (
    offset: number,
    pageSize: number,
    filters: { [property: string]: string | string[] | null | undefined },
): AppThunkAction<Promise<void>> => {
    return async (dispatch): Promise<void> => {
        try {
            dispatch(productsLoading());
            const result = await dispatch(requestServer((token) => getProductsAsync(offset, pageSize, filters, token)));
                dispatch(productsLoaded(result || []));
        } catch (e) {
            console.log(e);
            dispatch(productsLoadError());
            dispatch(alertGenericError());
        }
    };
};
