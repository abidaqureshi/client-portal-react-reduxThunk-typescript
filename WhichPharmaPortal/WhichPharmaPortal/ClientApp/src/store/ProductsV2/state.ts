import { ProductV2 } from '../../models/ProductV2';

export interface ProductsState {
    items: { [id: string]: ProductV2 };
    isLoading: boolean;
    searchResult: string[];
    selectedItems: string[];
    searchTotal: number;
    timeInSeconds: number;
    origins: { [id: string]: (string | string[] | undefined)[]}
}
