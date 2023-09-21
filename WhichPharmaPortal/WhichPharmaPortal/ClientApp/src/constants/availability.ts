import { TK } from '../store/Translations/translationKeys';

export interface IAvailability {
    label: TK;
    value: TK;
    queryObject: {
        isAuthorised?: TK;
        isMarketed?: TK;
        isShortage?: Boolean;
    };
}

export const AvailabiltiyArray: string[] = [
    TK.notAuthorised,
    TK.commercialised,
    TK.notCommercialised,
    TK.unknown,
    TK.shortage,
];

export const Availability: IAvailability[] = [
    { label: TK.notAuthorised, value: TK.NotAuthorised, queryObject: { isAuthorised: TK.no, isMarketed: TK.no } },
    {
        label: TK.commercialised,
        value: TK.Marketed,
        queryObject: { isAuthorised: TK.yes, isMarketed: TK.yes },
    },
    {
        label: TK.notCommercialised,
        value: TK.NotMarketed,
        queryObject: { isAuthorised: TK.yes, isMarketed: TK.no },
    },
    { label: TK.unknown, value: TK.unknown, queryObject: { isAuthorised: TK.yes, isMarketed: TK.unknown } },
    { label: TK.shortage, value: TK.shortage, queryObject: { isShortage: true } },
];
