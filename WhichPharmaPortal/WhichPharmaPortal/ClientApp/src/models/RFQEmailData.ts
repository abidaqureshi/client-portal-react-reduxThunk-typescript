import { RFQQuote } from './RFQQuote';

export interface RFQEmailData {
    supplierId: string;
    recipient: string;
    recipientName: string;
    cc: string[];
    subject: string;
    tableData: RFQQuote[];
    emailTemplate: string;
}