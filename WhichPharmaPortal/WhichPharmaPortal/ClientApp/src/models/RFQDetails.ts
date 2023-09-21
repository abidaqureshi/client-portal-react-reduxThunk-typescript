import { RFQQuoteTableItem } from '../pages/RFQDetailsV2';
import { RFQNote } from './RFQNote';
import { RFQSupplierDetails } from './RFQSupplierDetails';

export interface RFQDetails {
    rfqNumber: string;
    notes: RFQNote[];
    suppliersDetails: RFQSupplierDetails[];
    cards?: RFQQuoteTableItem[];
}

export interface RFQDetailsResponse {
    result: RFQDetails[];
    timeInSeconds: number;
}
