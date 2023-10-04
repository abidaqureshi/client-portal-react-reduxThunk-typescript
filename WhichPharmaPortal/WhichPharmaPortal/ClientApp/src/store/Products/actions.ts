import { AppThunkAction } from '..';
import { Action } from 'redux';
import { getProductsV2Async } from '../../fetch/requests';
import { ProductsLoadedAction, ProductAction } from './types';
import { SearchResult } from '../../models/SearchResult';
import { alertGenericError, requestServer } from '../Session/actions';
import { ProductV2 } from '../../models/ProductV2';

export const Actions = {
    productsLoading: '@@whichpharma.productsV2.loading',
    productsLoaded: '@@whichpharma.productsV2.loaded',
    productsLoadError: '@@whichpharma.productsV2.loadError',
    productSelected: '@@whichpharma.productsV2.productSelected',
    productDeselected: '@@whichpharma.productsV2.productDeselected',
    productsDeselectAll: '@@whichpharma.productsV2.productsDeselectAll',
    addOriginByProductId: '@@whichpharma.productsV2.addOriginByProductId'
};

const productsLoading = (): Action => ({
    type: Actions.productsLoading,
});

const productsLoaded = (result: SearchResult<ProductV2>): ProductsLoadedAction => ({
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

export const addOriginByProductId = (productId: string, origins: (string | undefined)[]): ProductAction => ({
    type: Actions.addOriginByProductId,
    productId,
    origins
});

export const fetchProducts = (
    offset: number,
    pageSize: number,
    filters: { [property: string]: string | string[] | null | undefined },
): AppThunkAction<Promise<void>> => {
    return async (dispatch): Promise<void> => {
        try {
            if (!Object.keys(filters).length) {
                dispatch(productsLoaded({ items: [], total: 0, timeInSeconds: 0 }));
                return;
            }

            dispatch(productsLoading());

            const startTime = new Date().getTime();

            const result = await dispatch(
                requestServer((token) => getProductsV2Async(offset, pageSize, filters, token)),
            );

            result.items.forEach(
                (I) =>
                    (I.administrationCategories = I.administrationCategories?.map((J) => {
                        J = J.replace(/_/g, ' ');
                        J = J.replace(/1/g, '+');
                        J = J.replace(/2/g, ',');
                        J = J.replace(/3/g, '/');
                        J = J.replace(/4/g, '-');
                        return J;
                    })),
            );

            result.items.forEach(
                (I) =>
                    (I.pharmaceuticalFormCategories = I.pharmaceuticalFormCategories?.map((J) => {
                        J = J.replace(/_/g, ' ');
                        J = J.replace(/1/g, '+');
                        J = J.replace(/2/g, ',');
                        J = J.replace(/3/g, '/');
                        J = J.replace(/4/g, '-');
                        return J;
                    })),
            );

            const endsTime = new Date().getTime();
            let timeInSeconds = 0;
            if (result.total > 0) {
                timeInSeconds = Math.round((endsTime - startTime) / 1000);
            }

            dispatch(productsLoaded(result || []));
        } catch (e) {
            console.log(e);
            dispatch(productsLoadError());
            dispatch(alertGenericError());
        }
    };
};
