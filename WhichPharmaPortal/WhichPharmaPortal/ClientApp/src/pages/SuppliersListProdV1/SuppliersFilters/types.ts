export enum FiltersKey {
    Countries = 'countries',
    Name = 'name',
    Statuses = 'statuses',
}

export interface Filters {
    [filterKey: string]: string | string[] | undefined;
}
