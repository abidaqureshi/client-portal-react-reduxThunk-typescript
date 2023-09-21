import { Country } from '../../models/Country';

export interface SetData<T> {
    items: T[];
    isUpdating: boolean;
    lastUpdate: Date;
}

export enum SetName {
    ATCs = 'atcs',
    ActiveSubstances = 'activeSubstances',
    Countries = 'countries',
    Origins = 'origins',
    DrugForms = 'drugForms',
    AdministrationForms = 'administrationForms',
    Statuses = 'statuses',
}

export interface SetsState {
    atcs: SetData<string>;
    activeSubstances: SetData<string>;
    countries: SetData<Country>;
    origins: SetData<string>;
    drugForms: SetData<string>;
    administrationForms: SetData<string>;
    statuses: SetData<string>;
}
