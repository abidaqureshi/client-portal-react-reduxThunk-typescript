export enum FiltersKey {
    Free = 'free',
    Countries = 'countries',
    Name = 'name',
    ActiveSubstances = 'activeSubstances',
    Atc = 'atc',
    PharmaceuticalForms = 'drugForms',
    AdministrationForms = 'administrationForms',
    ProductCode = 'productCode',
    Holder = 'holder',
    Origins = 'origins',
    IsAuthorised = 'isAuthorised',
    IsMarketed = 'isMarketed',
}

export interface Filters {
    [filterKey: string]: string | string[] | null | undefined;
}
