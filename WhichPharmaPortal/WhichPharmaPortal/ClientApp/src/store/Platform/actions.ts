import { AppThunkAction } from '..';
import { Action } from 'redux';
import { alertGenericError, requestServer, alertSuccess } from '../Session/actions';
import { PlatformProcessingSettingsLoadedAction, PlatformProcessingPformSettingsLoadedAction} from './types';
import { isLoadingPlatformData } from './selectors';
import { ProcessingSettings } from '../../models/ProcessingSettings';
import { getPlatformProcessingSettingsAsync, getPlatformPformProcessingSettingsAsync, postPlatformProcessingSettingsAsync, postPlatformSenReProcessRequestAsync as postPlatformSendReprocessRequestAsync, postPlatformRestoreBackupRequestAsync } from '../../fetch/requests';
import { getTranslation } from '../Translations/selectors';
import { TK } from '../Translations/translationKeys';
import { SearchResult } from '../../models/SearchResult';
import { ProcessingPformsSettings } from '../../models/ProcessingPformsSettings';

export const Actions = {
    platformDataLoading: '@@whichpharma.platform.dataLoading',
    platformDataLoadError: '@@whichpharma.platform.dataLoadError',
    platformProcessingSettingsLoaded: '@@whichpharma.platform.mappingsLoaded',
    platformProcessingPformsSettingsLoaded: '@@whichpharma.platform.mappingsPformsLoaded',
};

const platformDataLoading = (): Action => ({
    type: Actions.platformDataLoading,
});

const platformDataLoadError = (): Action => ({
    type: Actions.platformDataLoadError,
});

const platformProcessingSettingsLoaded = (country: string, mappings: ProcessingSettings): PlatformProcessingSettingsLoadedAction => ({
    type: Actions.platformProcessingSettingsLoaded,
    country,
    mappings,
});
const platformProcessingPformSettingsLoaded = (country: string, mappings: SearchResult<ProcessingPformsSettings>): PlatformProcessingPformSettingsLoadedAction => ({
    type: Actions.platformProcessingPformsSettingsLoaded,
    country,
    mappings,
});

export const fetchPlatformProcessingSettings = (countryCode: string): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if(isLoadingPlatformData(getState())) {
                return;
            }
            dispatch(platformDataLoading());
            const result = await dispatch(requestServer((token) => getPlatformProcessingSettingsAsync(countryCode, token)));
            dispatch(platformProcessingSettingsLoaded(countryCode, result));
        } catch (e) {
            console.log(e);
            dispatch(platformDataLoadError());
            dispatch(alertGenericError());
        }
    };
};
export const fetchPformPlatformProcessingSettings = (countryCode: string): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if(isLoadingPlatformData(getState())) {
                return;
            }
            dispatch(platformDataLoading());
            const result = await dispatch(requestServer((token) => getPlatformPformProcessingSettingsAsync(countryCode, token)));
            dispatch(platformProcessingPformSettingsLoaded(countryCode, result));
        } catch (e) {
            console.log(e);
            dispatch(platformDataLoadError());
            dispatch(alertGenericError());
        }
    };
};

export const savePlatformProcessingSettings = (countryCode: string, mappings: ProcessingSettings): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if(isLoadingPlatformData(getState())) {
                return;
            }
            dispatch(platformDataLoading());
            await dispatch(requestServer((token) => postPlatformProcessingSettingsAsync(countryCode, mappings, token)));
            dispatch(platformProcessingSettingsLoaded(countryCode, mappings));
        } catch (e) {
            console.log(e);
            dispatch(platformDataLoadError());
            dispatch(alertGenericError());
        }
    };
};

export const sendReprocessRequest = (origin: string, valuesAffected: string[]): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            await dispatch(requestServer((token) => postPlatformSendReprocessRequestAsync(origin, valuesAffected, token)));
            dispatch(alertSuccess(getTranslation(getState(), TK.reprocessRequestSubmitted)))
        } catch (e) {
            console.log(e);
            dispatch(platformDataLoadError());
            dispatch(alertGenericError());
        }
    };
};export const sendRestoreFromBackup = (origin: string, valuesAffected: string[]): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            await dispatch(requestServer((token) => postPlatformRestoreBackupRequestAsync(origin, valuesAffected, token)));
            dispatch(alertSuccess(getTranslation(getState(), TK.reprocessRequestSubmitted)))
        } catch (e) {
            console.log(e);
            dispatch(platformDataLoadError());
            dispatch(alertGenericError());
        }
    };
};