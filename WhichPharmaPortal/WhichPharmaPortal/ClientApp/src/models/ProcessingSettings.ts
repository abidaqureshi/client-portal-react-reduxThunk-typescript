import { fromUnixTime } from "date-fns/esm";
import { ProcessingPformsSettings } from "./ProcessingPformsSettings";
import { ProcessingCatSettings } from "./ProcessingCatSettings";
import { ProcessingATCSettings } from "./ProcessingATCSettings";

export interface ProcessingSettings {
    culture: string;
    decimalSeparator: string;
    numberGroupSeparator: string;
    administrationFormsMap: { [key: string]: string[]; };
    drugFormsMap: { [key: string]: string[]; };
    drugFormsMap2: { [key: string]: ProcessingPformsSettings; };
    dciMap: { [key: string]: ProcessingPformsSettings; };
    catsMap: { [key: string]: ProcessingCatSettings; };
    atcMap: { [key: string]: ProcessingATCSettings; };
    pharmaUnitsMap: { [key: string]: string[]; };
    administrationFormPresenceFields: string[];
    drugFormPresenceFields: string[];
    strengthPresenceFields: string[];
    packagePresenceFields: string[];
}