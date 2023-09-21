import { SupplierType } from './SupplierType';
import { Contact } from './Contact';
import { SupplierState } from './SupplierState';

export interface Supplier {
    id: string;
    name: string;
    type: SupplierType;
    country: string;
    countryCode: string;
    isEurope: boolean;
    classification: number;
    notes: string;
    contacts: Contact[];
    state: SupplierState;
    lastVerification: string;
    expirationDate: string;
    creationDate: string;
}

export interface AGSupplier {
    data: {
        id: string;
        name: string;
        type: SupplierType;
        country: string;
        countryCode: string;
        isEurope: boolean;
        classification: number;
        notes: string;
        contacts: Contact[];
        state: SupplierState;
        lastVerification: string;
        expirationDate: string;
        creationDate: string;
    };
}
