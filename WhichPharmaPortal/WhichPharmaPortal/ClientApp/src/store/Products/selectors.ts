import { ApplicationState } from '..';
import { ProductV1 } from '../../models/ProductV1';

export const getAllProducts = (state: ApplicationState): { [id:string]: ProductV1 } => state.products.items;
export const getSearchResult = (state: ApplicationState): string[] => state.products.searchResult;
export const getSelectedProducts = (state: ApplicationState): string[] => state.products.selectedItems;
export const getSearchTotalIncludingNotLoaded = (state: ApplicationState): number => state.products.searchTotal;
export const isLoadingProducts = (state: ApplicationState): boolean => state.products.isLoading;
