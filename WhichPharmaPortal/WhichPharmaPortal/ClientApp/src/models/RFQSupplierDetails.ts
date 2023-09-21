import { RFQEntryState } from './RFQEntryState';
import { RFQQuoteInfo } from './RFQQuoteInfo';

export interface RFQSupplierDetails {
    threadId: string;
    supplierId: string;
    supplierName: string;
    supplierContactName: string;
    supplierContactEmail: string;
    countryCode: string;
    country: string;
    lastIteration: string;
    state: RFQEntryState;
    subject: string;
    supplierType: string;
    //type: string;
    unreadMessages: number;
    dataTable: RFQQuoteInfo[];
    externalAccessLink?: string;
    maHolder?: string;
}
