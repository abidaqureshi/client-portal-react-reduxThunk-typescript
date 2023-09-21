import { RFQQuote } from '../../models/RFQQuote';

export interface RFQ {
    id: string;
    autoId: string;
    useExistingRfq: boolean;
    description: string;
    dueDate: string;
    packSize: number;
    unitQuant: string;
    isAlternative: boolean;
    items: string[];
}

export interface EmailData {
    countryCode: string;
    subject: string;
    table: RFQQuote[];
}
