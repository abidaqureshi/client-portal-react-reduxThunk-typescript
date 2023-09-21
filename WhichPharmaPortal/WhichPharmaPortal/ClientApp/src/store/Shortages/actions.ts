import { AppThunkAction } from '..';
import { Shortage } from '../../models/Shortage';
import { Action } from 'redux';
import { getShortagesAsync } from '../../fetch/requests';
import { ShortagesLoadedAction } from './types';
import { SearchResult } from '../../models/SearchResult';
import { alertGenericError, requestServer } from '../Session/actions';

export const Actions = {
    shortagesLoading: '@@whichpharma.shortages.loading',
    shortagesLoaded: '@@whichpharma.shortages.loaded',
    shortagesLoadError: '@@whichpharma.shortages.loadError',
    shortageSelected: '@@whichpharma.shortages.shortageSelected',
    shortageDeselected: '@@whichpharma.shortages.shortageDeselected',
};

const shortagesLoading = (): Action => ({
    type: Actions.shortagesLoading,
});

const shortagesLoaded = (result: SearchResult<Shortage>): ShortagesLoadedAction => ({
    type: Actions.shortagesLoaded,
    result,
});

const shortagesLoadError = (): Action => ({
    type: Actions.shortagesLoadError,
});

export const fetchShortages = (
    offset: number,
    pageSize: number,
    filters: { [property: string]: string | string[] | undefined },
): AppThunkAction<Promise<void>> => {
    return async (dispatch): Promise<void> => {
        try {
            dispatch(shortagesLoading());
            const result = await dispatch(requestServer((token) => getShortagesAsync(offset, pageSize, filters, token)));
            dispatch(shortagesLoaded(result || []));
        } catch (e) {
            console.log(e);
            dispatch(shortagesLoadError());
            dispatch(alertGenericError());
        }
    };
};
