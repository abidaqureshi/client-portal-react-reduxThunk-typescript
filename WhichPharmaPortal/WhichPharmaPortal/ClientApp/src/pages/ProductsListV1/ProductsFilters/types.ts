export enum FiltersKey {
    Free = 'free',
    Countries = 'countries',
    Name = 'name',
    ActiveSubstances = 'activeSubstances',
    Atc = 'atc',
    DrugForms = 'drugForms',
    AdministrationForms = 'administrationForms',
    ProductCode = 'productCode',
    Holder = 'holder',
    Statuses = 'statuses',
    Origins = 'origins',
    Shortages = 'shortage',
    IncludeExprice = 'includeExprice',
}

export interface Filters {
    [filterKey: string]: string | string[] | null | undefined;
}
