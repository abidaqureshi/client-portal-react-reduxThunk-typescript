import { ApplicationState } from '..';
import { Shortage } from '../../models/Shortage';

export const getAllShortages = (state: ApplicationState): { [id:string]: Shortage } => state.shortages.items;
export const getSearchResult = (state: ApplicationState): string[] => state.shortages.searchResult;
export const getSearchTotalIncludingNotLoaded = (state: ApplicationState): number => state.shortages.searchTotal;
export const isLoadingShortages = (state: ApplicationState): boolean => state.shortages.isLoading;
