import { ApplicationState } from '..';
import { ProductV2 } from '../../models/ProductV2';

export const getAllProducts = (state: ApplicationState): { [id: string]: ProductV2 } => state.productsV2.items;
export const getSearchResult = (state: ApplicationState): string[] => state.productsV2.searchResult;
export const getSelectedProducts = (state: ApplicationState): string[] => state.productsV2.selectedItems;
export const getSearchTotalIncludingNotLoaded = (state: ApplicationState): number => state.productsV2.searchTotal;
export const getRequestTimeInSeconds = (state: ApplicationState): number => state.productsV2.timeInSeconds;
export const isLoadingProducts = (state: ApplicationState): boolean => state.productsV2.isLoading;
export const getOriginsByProductId = (state: ApplicationState): { [id: string]: (string | string[] | undefined)[]; } => state.productsV2.origins;
