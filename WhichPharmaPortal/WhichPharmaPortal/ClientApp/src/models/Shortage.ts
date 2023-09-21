
import { ShortageType } from './ShortageType';
import { ProductV1 } from './ProductV1';

export interface Shortage { 
    id: string;
    productId?: string;
    scrapingOrigin: string;
    country: string;
    countryCode: string;
    isActive: boolean;
    start: string;
    end?: string;
    type: ShortageType;
    additionalNotes: string;
    lastUpdate: string;
    product?: ProductV1;
}