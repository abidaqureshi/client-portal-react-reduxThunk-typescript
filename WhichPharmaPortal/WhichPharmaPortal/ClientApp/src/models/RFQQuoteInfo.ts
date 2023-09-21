import { ICostItem } from '../pages/RFQDetailsV2/AdditionalCost';
import { RFQQuoteState } from './RFQQuoteState';

export interface RFQQuoteInfo {
    id: string;
    rfqNr: string;
    name: string;
    state: RFQQuoteState;
    endingDate?: string;
    rfqDescription?: string;
    activeSubstances?: string;
    expDate?: string;
    isCopy?: boolean;
    leadTimeToDeliver?: string;
    availabilityPacks?: string | number;
    availabilityPacsForCard?: number;
    exwNetPriceEuro?: string;
    priceCurrencyToEuro?: number;
    currency?: string;
    unitQuant?: string;
    packSize?: string;
    package?: string;
    cardDate?: string;
    productCode?: string;
    countryOfOrigin?: string;
    weightedPrice?: number;
    additionalCost?: number;
    additionalCostList?: ICostItem[];
    maHolder?: string;
    comments?: string;
    createdBy: string;
    creationDate: string;
    updatedBy?: string;
    lastUpdateDate?: string;
}
