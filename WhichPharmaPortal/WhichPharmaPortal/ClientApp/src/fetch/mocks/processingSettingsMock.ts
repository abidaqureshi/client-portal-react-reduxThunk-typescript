import { AdministrationForm } from "../../models/AdministrationForm";
import { ProcessingSettings } from "../../models/ProcessingSettings";
import { DrugForm } from "../../models/DrugForm";
import { PharmaUnits } from "../../models/PharmaUnits";

export const processingSettingsMock: ProcessingSettings = {
    administrationFormsMap: {
        [AdministrationForm.Oral]: ['bucal','boca'],
    },
    drugFormsMap: {
        [DrugForm.Ampoule]: ['ampola'],
    },
    drugFormsMap2: {},
    atcMap: {},
    dciMap: {},
    catsMap: {},
    pharmaUnitsMap: {
        [PharmaUnits.Percent]: ['%','porcentagem'],
    },
    administrationFormPresenceFields: ["name"],
    drugFormPresenceFields: ["name", "drugForm"],
    packagePresenceFields: ["package"],
    strengthPresenceFields: ["name", "strength"],
    culture: 'pt-PT',
    decimalSeparator: '.',
    numberGroupSeparator: ',',
}