import { AppThunkAction } from '..';
import { getSetAsync } from '../../fetch/requests';
import { SetUpdatedAction, SetAction } from './types';
import { needsUpdate } from './selectors';
import { SetName } from './state';
import { requestServer } from '../Session/actions';

export const Actions = {
    setUpdating: '@@whichpharma.sets.setUpdating',
    setUpdated: '@@whichpharma.sets.setUpdated',
    setUpdateError: '@@whichpharma.sets.setUpdateError',
};

const setUpdating = (setName: SetName): SetAction => ({
    type: Actions.setUpdating,
    setName,
});

const setUpdated = (setName: SetName, values: string[]): SetUpdatedAction => ({
    type: Actions.setUpdated,
    setName,
    values,
});

const setUpdateError = (setName: SetName): SetAction => ({
    type: Actions.setUpdateError,
    setName,
});

export const fetchSet = (setName: SetName): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            const state = getState();

            if (needsUpdate(state, setName)) {
                dispatch(setUpdating(setName));
                const result = await dispatch(requestServer((token) => getSetAsync(setName, token)));
                dispatch(setUpdated(setName, result));
            }
        } catch (e) {
            console.log(e);
            dispatch(setUpdateError(setName));
        }
    };
};
