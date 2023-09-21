
import { Action, Reducer } from 'redux';
import { Actions } from './actions';
import { Actions as SessionActions } from '../Session/actions';
import { PlatformPformState, PlatformState } from './state';
import { PlatformProcessingPformSettingsLoadedAction, PlatformProcessingSettingsLoadedAction } from './types';

const unloadedState: PlatformState = {
    processingSettings: {},
    isLoading: false,
};

export const persistor = (state: PlatformState): PlatformState => ({
    ...unloadedState,
});

export const reconciler = (stored: PlatformState): PlatformState => ({
    ...stored,
    isLoading: false,
});

const handlePlatformDataLoading = (state: PlatformState): PlatformState => ({
    ...state,
    isLoading: true,
});

const handlePlatformDataLoadError = (state: PlatformState): PlatformState => ({
    ...state,
    isLoading: false,
});

const handlePlatformProcessingSettingsLoaded = (state: PlatformState, action: PlatformProcessingSettingsLoadedAction | PlatformProcessingPformSettingsLoadedAction): PlatformState | PlatformPformState => ({
    ...state,
    isLoading: false,
    processingSettings: {
        ...state.processingSettings, 
        [action.country]: action.mappings
    },
});

export const reducer: Reducer<PlatformState> = (state: PlatformState = unloadedState, action: Action): PlatformState | PlatformPformState => {
    switch (action.type) {
        case SessionActions.loggedOut:
            return unloadedState;
        case Actions.platformDataLoading:
            return handlePlatformDataLoading(state);
        case Actions.platformDataLoadError:
            return handlePlatformDataLoadError(state);
        case Actions.platformProcessingSettingsLoaded:
            return handlePlatformProcessingSettingsLoaded(state, action as PlatformProcessingSettingsLoadedAction);
        case Actions.platformProcessingPformsSettingsLoaded:
            return handlePlatformProcessingSettingsLoaded(state, action as PlatformProcessingPformSettingsLoadedAction);
        default:
            return state;
    }
};
