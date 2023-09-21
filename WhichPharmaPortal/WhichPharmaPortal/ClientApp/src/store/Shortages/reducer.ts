import { ShortagesState } from './state';
import { Action, Reducer } from 'redux';
import { Actions } from './actions';
import { Actions as SessionActions } from '../Session/actions';
import { ShortagesLoadedAction } from './types';

const unloadedState: ShortagesState = {
    items: {},
    searchResult: [],
    searchTotal: 0,
    isLoading: false,
};

export const persistor = (state: ShortagesState): ShortagesState => ({
    ...unloadedState,
});

export const reconciler = (stored: ShortagesState): ShortagesState => ({
    ...unloadedState,
});

const handleShortagesLoading = (state: ShortagesState): ShortagesState => ({
    ...state,
    isLoading: true,
});

const handleShortagesLoadError = (state: ShortagesState): ShortagesState => ({
    ...state,
    isLoading: false,
});

const handleShortagesLoaded = (state: ShortagesState, action: ShortagesLoadedAction): ShortagesState => ({
    ...state,
    isLoading: false,
    items: Object.assign({ ...state.items }, ...action.result.items.map((p) => ({ [p.id]: p }))),
    searchResult: action.result.items.map((p) => p.id),
    searchTotal: action.result.total,
});

export const reducer: Reducer<ShortagesState> = (
    state: ShortagesState = unloadedState,
    action: Action,
): ShortagesState => {
    switch (action.type) {
        case SessionActions.loggedOut:
            return unloadedState;
        case Actions.shortagesLoading:
            return handleShortagesLoading(state);
        case Actions.shortagesLoadError:
            return handleShortagesLoadError(state);
        case Actions.shortagesLoaded:
            return handleShortagesLoaded(state, action as ShortagesLoadedAction);
        default:
            return state;
    }
};
