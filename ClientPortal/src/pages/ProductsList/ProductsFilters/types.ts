export enum FiltersKey {
    Free = 'free',
    Countries = 'countries',
    Name = 'name',
    ActiveSubstances = 'activeSubstances',
    Atc = 'atc',
    PharmaceuticalForms = 'drugForms',
    AdministrationForms = 'administrationForms',
    AdditionalInformation = 'additionalInformation',
    ProductCode = 'productCode',
    Holder = 'holder',
    Origins = 'origins',
    isAuthorised = 'isAuthorised',
    isMarketed = 'isMarketed',
    isShortage = 'isShortage',
    notCommercialized = 'notCommercialized',
}

export interface Filters {
    [filterKey: string]: string | string[] | null | undefined;
}
