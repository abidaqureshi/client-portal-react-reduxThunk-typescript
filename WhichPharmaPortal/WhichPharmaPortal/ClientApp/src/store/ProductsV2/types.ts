import { Action } from 'redux';
import { ProductV2 } from '../../models/ProductV2';
import { SearchResult } from '../../models/SearchResult';

export interface ProductsLoadedAction extends Action {
    result: SearchResult<ProductV2>;
}

export interface ProductAction extends Action {
    productId: string;
    origins?: (string | undefined)[]
}
