export interface SearchResult<T> {
    items: T[];
    total: number;
    timeInSeconds?: number;
}
