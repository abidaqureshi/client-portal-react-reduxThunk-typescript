/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useDispatch, useSelector } from 'react-redux';
import { ApplicationState } from '..';
import { getSet } from './selectors';
import { fetchSet } from './actions';
import { SetName } from './state';
import { Country } from '../../models/Country';

const useSet = (setName: SetName): any[] => {
    const dispatch = useDispatch();

    const values = useSelector<ApplicationState, string[]>((state) => getSet(state, setName));

    if (!(values && values.length)) {
        setTimeout(() => dispatch(fetchSet(setName)), 50);
    }

    return values;
};

export const useATCsSet = () => useSet(SetName.ATCs) as string[];
export const useActiveSubstancesSet = () => useSet(SetName.ActiveSubstances) as string[];
export const useCountriesSet = () => useSet(SetName.Countries) as Country[];
export const useOriginsSet = () => useSet(SetName.Origins) as string[];
export const useBackupSet = () => useSet(SetName.BackUps) as string[];
export const useDrugFormsSet = () => useSet(SetName.DrugForms) as string[];
export const useAdministrationFormsSet = () => useSet(SetName.AdministrationForms) as string[];
export const useStatusesSet = () => useSet(SetName.Statuses) as string[];
export const useAdditionalInformationSet = () => useSet(SetName.AdditionalInformation) as string[];
