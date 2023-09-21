import { RFQQuoteState } from './RFQQuoteState';

export interface RFQQuoteV2 {
    data: {
        id: string;
        rfqNr: string;
        name: string;
        state: RFQQuoteState;
        endingDate?: string;
        rfqDescription?: string;
        activeSubstances?: string;
        expDate?: string;
        leadTimeToDeliver?: string;
        availabilityPacks?: number;
        exwNetPriceEuro?: string;
        unitQuant?: string;
        packSize?: string;
        supplierReplyForm?: string;
        productCode?: string;
        countryOfOrigin?: string;
        maHolder?: string;
        comments?: string;
    };
}

export interface RFQQuote {
    id: string;
    rfqNr: string;
    name: string;
    state: RFQQuoteState;
    endingDate?: string;
    lastUpdateDate?: string;
    rfqDescription?: string;
    activeSubstances?: string;
    expDate?: string;
    leadTimeToDeliver?: string;
    availabilityPacks?: string | number;
    exwNetPriceEuro?: string;
    currency?: string;
    priceInCurrency?: string;
    updatedBy?: string;
    createdBy?: string;
    unitQuant?: string;
    numOfPacks?: string;
    packSize?: string;
    productCode?: string;
    countryOfOrigin?: string;
    maHolder?: string;
    comments?: string;
    isAlternative?: boolean;
    // attachment?: string;
}

export interface IFilterMembers {
    key: string;
    checked: boolean;
}
