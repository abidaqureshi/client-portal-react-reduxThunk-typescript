import { RFQQuote } from "../../models/RFQQuote";

export interface RFQ {
    id: string,
    autoId: string,
    useExistingRfq: boolean,
    description: string,
    dueDate: string,
    items: string[],
}

export interface EmailData {
    countryCode: string;
    subject: string;
    table: RFQQuote[];
}