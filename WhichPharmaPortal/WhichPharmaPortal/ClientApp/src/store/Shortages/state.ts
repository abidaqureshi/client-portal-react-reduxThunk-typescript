import { Shortage } from '../../models/Shortage';

export interface ShortagesState {
    items: { [id: string]: Shortage };
    isLoading: boolean;
    searchResult: string[];
    searchTotal: number;
}
