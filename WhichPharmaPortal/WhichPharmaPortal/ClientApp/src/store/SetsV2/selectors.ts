import { ApplicationState } from '..';
import { SetName } from './state';

const SETS_REFRESH_SECONDS = 60 * 60;

export const needsUpdate = (state: ApplicationState, setName: SetName) => {
    if (state.setsV2[setName]?.isUpdating) {
        return false;
    }

    if (!state.setsV2[setName].items?.length) {
        return true;
    }

    const lastUpdate = state.setsV2[setName]?.lastUpdate;

    return !lastUpdate || new Date().getTime() - new Date(lastUpdate).getTime() > SETS_REFRESH_SECONDS * 1000;
};

export const getSet = (state: ApplicationState, setName: SetName): any[] => state.setsV2[setName]?.items || [];
