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
    AdditionalInformation = 'additionalInformation',
    BackUps = 'backups',
    Statuses = 'statuses',
}

export interface SetsState {
    atcs: SetData<string>;
    backups: SetData<string>;
    activeSubstances: SetData<string>;
    countries: SetData<Country>;
    origins: SetData<string>;
    drugForms: SetData<string>;
    administrationForms: SetData<string>;
    additionalInformation: SetData<string>;
    statuses: SetData<string>;
}
