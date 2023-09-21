import { TK } from '../store/Translations/translationKeys';

export interface IAdditionalInfo {
    [x: string]: any;
    label: string;
    filterKey: string;
    queryObject: {
        [key: string]: Boolean;
    };
}

export const AdditionalInfo: string[] = [
    TK.generic,
    TK.psychotropic,
    TK.biological,
    TK.additionalMonitoring,
    TK.prescription,
    TK.hospitalar,
    TK.precautionsForStorage,
];

// export const AdditionalInfo: IAdditionalInfo[] = [
//     { label: TK.generic, filterKey: 'isGeneric', queryObject: { isGeneric: true } },
//     {
//         label: TK.psychotropic,
//         filterKey: 'isPsychotropic',
//         queryObject: { isPsychotropic: true },
//     },
//     {
//         label: TK.biological,
//         filterKey: 'isBiological',
//         queryObject: { isBiological: true },
//     },
//     {
//         label: TK.additionalMonitoring,
//         filterKey: 'isAdditionalMonitoring',
//         queryObject: { isAdditionalMonitoring: true },
//     },
//     { label: TK.prescription, filterKey: 'isPrescription', queryObject: { isPrescription: true } },
//     { label: TK.hospitalar, filterKey: 'isHospitalar', queryObject: { isHospitalar: true } },
//     {
//         label: TK.precautionsForStorage,
//         filterKey: 'isPrecautionsForStorage',
//         queryObject: { isPrecautionsForStorage: true },
//     },
// ];
