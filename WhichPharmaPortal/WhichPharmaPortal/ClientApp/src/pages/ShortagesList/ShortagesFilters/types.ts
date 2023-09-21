export enum FiltersKey {
    Countries = 'countries',
    Origins = 'origins',
    Types = 'types',
    MinStartDate = 'minStartDate',
    MaxStartDate = 'maxStartDate',
    MinEndDate = 'minEndDate',
    MaxEndDate = 'maxEndDate',
}

export interface Filters {
    [filterKey: string]: string | string[] | undefined;
}
