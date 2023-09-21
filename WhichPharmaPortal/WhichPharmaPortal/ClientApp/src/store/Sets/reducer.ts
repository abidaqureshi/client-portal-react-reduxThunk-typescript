import { Action, Reducer } from 'redux';
import { Actions } from './actions';
import { Actions as SessionActions } from '../Session/actions';
import { SetsState, SetData } from './state';
import { SetUpdatedAction, SetAction } from './types';

const unloadedSetData: SetData<any> = {
    items: [],
    isUpdating: false,
    lastUpdate: new Date(1990),
};

const unloadedState: SetsState = {
    activeSubstances: { ...unloadedSetData },
    atcs: { ...unloadedSetData },
    countries: { ...unloadedSetData },
    drugForms: { ...unloadedSetData },
    administrationForms: { ...unloadedSetData },
    origins: { ...unloadedSetData },
    statuses: { ...unloadedSetData },
};

export const persistor = (state: SetsState): SetsState => ({
    activeSubstances: { ...state?.activeSubstances, isUpdating: false },
    atcs: { ...state?.atcs, isUpdating: false },
    countries: { ...state?.countries, isUpdating: false },
    drugForms: { ...state?.drugForms, isUpdating: false },
    administrationForms: { ...state?.administrationForms, isUpdating: false },
    origins: { ...state?.origins, isUpdating: false },
    statuses: { ...state?.statuses, isUpdating: false },
});

export const reconciler = persistor;

export const reducer: Reducer<SetsState> = (state: SetsState = unloadedState, action: Action): SetsState => {
    switch (action.type) {
        case SessionActions.loggedOut:
            return unloadedState;
        case Actions.setUpdated:
            return handleSetUpdated(state, action as SetUpdatedAction);
        case Actions.setUpdating:
            return handleSetUpdating(state, action as SetAction);
        case Actions.setUpdateError:
            return handleSetUpdateError(state, action as SetAction);
        default:
            return state;
    }
};

const handleSetUpdated = (state: SetsState, action: SetUpdatedAction): SetsState => ({
    ...state,
    [action.setName]: {
        items: action.values,
        isUpdating: false,
        lastUpdate: new Date(),
    },
});

const handleSetUpdating = (state: SetsState, action: SetAction): SetsState => ({
    ...state,
    [action.setName]: {
        ...state[action.setName],
        isUpdating: true,
        lastUpdate: new Date(),
    },
});

const handleSetUpdateError = (state: SetsState, action: SetAction): SetsState => ({
    ...state,
    [action.setName]: {
        ...state[action.setName],
        isUpdating: false,
        lastUpdate: new Date(),
    },
});
