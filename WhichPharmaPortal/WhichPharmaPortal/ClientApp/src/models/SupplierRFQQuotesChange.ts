
import { RFQQuote } from './RFQQuote';

export interface SupplierRFQQuotesChange { 
    quotes: RFQQuote[];
    receiveEmailCopyWhenSubmitting?: boolean;
}