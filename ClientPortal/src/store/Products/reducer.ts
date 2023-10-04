import { ProductsState } from './state';
import { Action, Reducer } from 'redux';
import { Actions } from './actions';
import { Actions as SessionActions } from '../Session/actions';
import { ProductsLoadedAction, ProductAction } from './types';

const unloadedState: ProductsState = {
    items: {},
    searchResult: [],
    selectedItems: [],
    searchTotal: 0,
    isLoading: false,
    timeInSeconds: 0,
    origins: {}
};

export const persistor = (state: ProductsState): ProductsState => ({
    ...state,
    // Only save the selected products otherwise we'll reach the maximum localStorage size (10MB)
    items: !state?.items
        ? {}
        : Object.keys(state.items)
              .filter((productId) => state.selectedItems.includes(productId))
              .reduce((result, productId) => Object.assign(result, { [productId]: state.items[productId] }), {}),
    searchResult: [],
    searchTotal: 0,
    timeInSeconds: 0,
    isLoading: false,
});

export const reconciler = (stored: ProductsState): ProductsState => ({
    ...stored,
    isLoading: false,
});

const handleProductsLoading = (state: ProductsState): ProductsState => ({
    ...state,
    isLoading: true,
});

const handleProductsLoadError = (state: ProductsState): ProductsState => ({
    ...state,
    isLoading: false,
});

const handleProductsLoaded = (state: ProductsState, action: ProductsLoadedAction): ProductsState => ({
    ...state,
    isLoading: false,
    items: Object.assign({ ...state.items }, ...action.result.items.map((p) => ({ [p.id]: p }))),
    searchResult: action.result.items.map((p) => p.id),
    searchTotal: action.result.total,
    timeInSeconds: action.result.timeInSeconds || 0,
});

const handleProductSelected = (state: ProductsState, action: ProductAction): ProductsState => {
    const selectedItems = [...new Set([...state.selectedItems, action.productId])]
    return {
        ...state,
        selectedItems
    }
} 

const addOriginsByProductId = (state: ProductsState, action: ProductAction): ProductsState => {
    const productId = action.productId;
    const origins = action?.origins ? [...action.origins] : [];

    let selectedItemsByProductId = {...state.origins};

    selectedItemsByProductId[productId] = (selectedItemsByProductId[productId]) ?
        [...new Set([...origins])]
        :
        [...new Set([...origins])]
    return {
        ...state,
        origins: selectedItemsByProductId
    }
    
}

const handleProductDeselected = (state: ProductsState, action: ProductAction): ProductsState => ({
    ...state,
    selectedItems: state.selectedItems.filter((id) => id !== action.productId),
});

const handleProductsDeselectAll = (state: ProductsState): ProductsState => ({
    ...state,
    selectedItems: [],
});

export const reducer: Reducer<ProductsState> = (
    state: ProductsState = unloadedState,
    action: Action,
): ProductsState => {
    switch (action.type) {
        case SessionActions.loggedOut:
            return reconciler(state);
        case Actions.productsLoading:
            return handleProductsLoading(state);
        case Actions.productsLoadError:
            return handleProductsLoadError(state);
        case Actions.productsLoaded:
            return handleProductsLoaded(state, action as ProductsLoadedAction);
        case Actions.productSelected:
            return handleProductSelected(state, action as ProductAction);
        case Actions.productDeselected:
            return handleProductDeselected(state, action as ProductAction);
        case Actions.addOriginByProductId:
            return addOriginsByProductId(state, action as ProductAction);
        case Actions.productsDeselectAll:
            return handleProductsDeselectAll(state);
        default:
            return state;
    }
};
