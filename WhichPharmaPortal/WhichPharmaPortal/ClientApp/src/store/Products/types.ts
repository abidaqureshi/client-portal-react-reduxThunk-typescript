import { Action } from 'redux';
import { ProductV1 } from '../../models/ProductV1';
import { SearchResult } from '../../models/SearchResult';

export interface ProductsLoadedAction extends Action {
    result: SearchResult<ProductV1>;
}

export interface ProductAction extends Action {
    productId: string;
}
