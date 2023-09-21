import { ProductV1 } from '../../models/ProductV1';

export interface ProductsState {
    items: { [id: string]: ProductV1 };
    isLoading: boolean;
    searchResult: string[];
    selectedItems: string[];
    searchTotal: number;
    timeInSeconds: number;
}
