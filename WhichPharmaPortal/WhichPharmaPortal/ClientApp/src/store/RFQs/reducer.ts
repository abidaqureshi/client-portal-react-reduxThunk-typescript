import { RFQsState } from './state';
import { Action, Reducer } from 'redux';
import { Actions } from './actions';
import { Actions as SessionActions } from '../Session/actions';
import {
    RFQsSummariesLoadedAction,
    RFQsSubmittedAction,
    RFQsDetailsLoadedAction,
    RFQDetailsLoadedAction,
    RFQHistoryLoadedAction,
    RFQUpdatedAction,
    RFQUpdatingAction,
    RFQTableDataUpdatedAction,
    RFQAction,
} from './types';
import { RFQDetails } from '../../models/RFQDetails';
import { MapOf } from '../../utils/Types';
import { RFQSummary } from '../../models/RFQSummary';

const unloadedState: RFQsState = {
    summaries: {},
    details: {},
    isLoading: false,
    isSubmitting: false,
    isUpdating: [],
    latestRequestSubmitted: undefined,
    nextRfqNumber: undefined,
    timeInSeconds: 0,
    rfqHistory: [],
};

export const persistor = (state: RFQsState): RFQsState => ({
    ...unloadedState,
});

export const reconciler = (stored: RFQsState): RFQsState => ({
    ...stored,
    isLoading: false,
    isSubmitting: false,
    isUpdating: [],
    latestRequestSubmitted: undefined,
    nextRfqNumber: undefined,
    timeInSeconds: 0,
});

const handleRFQsLoading = (state: RFQsState): RFQsState => ({
    ...state,
    isLoading: true,
});

const handleRFQsLoadError = (state: RFQsState): RFQsState => ({
    ...state,
    isLoading: false,
});

const handleRFQsLoaded = (state: RFQsState, action: RFQsSummariesLoadedAction): RFQsState => ({
    ...state,
    isLoading: false,
    summaries: action.result.items.reduce<MapOf<RFQSummary>>(
        (prev, curr) => Object.assign({ [curr.number]: curr }, prev),
        {},
    ),
    searchTotal: action.result.total,
});

const handleRFQsDetailsLoaded = (state: RFQsState, action: RFQsDetailsLoadedAction): RFQsState => ({
    ...state,
    isLoading: false,
    details: {
        ...state.details,
        ...action.response.result.reduce<MapOf<RFQDetails>>(
            (prev, curr) => Object.assign({ [curr.rfqNumber]: curr }, prev),
            {},
        ),
    },
    timeInSeconds: action.response.timeInSeconds,
});

const handleRFQDetailsLoaded = (state: RFQsState, action: RFQDetailsLoadedAction): RFQsState => ({
    ...state,
    isLoading: false,
    details: {
        ...state.details,
        [action.rfqNr]: action.result,
    },
});

const handleRFQHistoryLoaded = (state: RFQsState, action: RFQHistoryLoadedAction): RFQsState => ({
    ...state,
    isLoading: false,
    rfqHistory: action.result,
});

const handleRFQsSubmitting = (state: RFQsState): RFQsState => ({
    ...state,
    isSubmitting: true,
});

const handleRFQsSubmitError = (state: RFQsState): RFQsState => ({
    ...state,
    isSubmitting: false,
});

const handleRFQsSubmitted = (state: RFQsState, action: RFQsSubmittedAction): RFQsState => ({
    ...state,
    isSubmitting: false,
    latestRequestSubmitted: action.request,
});

const handleRFQUpdating = (state: RFQsState, action: RFQUpdatingAction): RFQsState => ({
    ...state,
    isUpdating: [...state.isUpdating, action.rfqNumber],
});

const handleRFQUpdateError = (state: RFQsState, action: RFQUpdatingAction): RFQsState => ({
    ...state,
    isUpdating: state.isUpdating.filter((rfqNumber) => rfqNumber !== action.rfqNumber),
});

const handleRFQUpdated = (state: RFQsState, action: RFQUpdatedAction): RFQsState => ({
    ...state,
    isUpdating: state.isUpdating.filter((rfqNumber) => rfqNumber !== action.result.number),
    summaries: {
        ...state.summaries,
        [action.result.number]: action.result,
    },
});

const handleRFQTableDataUpdated = (state: RFQsState, action: RFQTableDataUpdatedAction): RFQsState => ({
    ...state,
    isUpdating: state.isUpdating.filter((rfqNumber) => rfqNumber !== action.rfqNumber),
    details: {
        ...state.details,
        [action.rfqNumber]: {
            ...state.details[action.rfqNumber],
            suppliersDetails: state.details[action.rfqNumber].suppliersDetails.map((details) => ({
                ...details,
                dataTable: action.dataByThreadId[details.threadId],
            })),
        },
    },
});

const handleRFQQuotesTableDataUpdated = (state: RFQsState, action: RFQTableDataUpdatedAction): RFQsState => ({
    ...state,
    isUpdating: state.isUpdating.filter((rfqNumber) => rfqNumber !== action.rfqNumber),
    details: {
        ...state.details,
        [action.rfqNumber]: {
            ...state.details[action.rfqNumber],
            suppliersDetails: state.details[action.rfqNumber].suppliersDetails.map((details) => ({
                ...details,
                dataTable: action.dataByThreadId[details.threadId]
                    ? action.dataByThreadId[details.threadId]
                    : details.dataTable,
            })),
        },
    },
});

const handleNextRFQNumberUpdated = (state: RFQsState, action: RFQAction): RFQsState => ({
    ...state,
    nextRfqNumber: action.rfqId,
});

export const reducer: Reducer<RFQsState> = (state: RFQsState = unloadedState, action: Action): RFQsState => {
    switch (action.type) {
        case SessionActions.loggedOut:
            return unloadedState;
        case Actions.rfqsLoading:
            return handleRFQsLoading(state);
        case Actions.rfqsLoadError:
            return handleRFQsLoadError(state);
        case Actions.rfqsLoaded:
            return handleRFQsLoaded(state, action as RFQsSummariesLoadedAction);
        case Actions.rfqsDetailsLoaded:
            return handleRFQsDetailsLoaded(state, action as RFQsDetailsLoadedAction);
        case Actions.rfqDetailsLoaded:
            return handleRFQDetailsLoaded(state, action as RFQDetailsLoadedAction);
        case Actions.rfqHistoryLoaded:
            return handleRFQHistoryLoaded(state, action as RFQHistoryLoadedAction);
        case Actions.rfqsSubmitting:
            return handleRFQsSubmitting(state);
        case Actions.rfqsSubmitError:
            return handleRFQsSubmitError(state);
        case Actions.rfqsSubmitted:
            return handleRFQsSubmitted(state, action as RFQsSubmittedAction);
        case Actions.rfqsUpdating:
            return handleRFQUpdating(state, action as RFQUpdatingAction);
        case Actions.rfqsUpdateError:
            return handleRFQUpdateError(state, action as RFQUpdatingAction);
        case Actions.rfqsUpdated:
            return handleRFQUpdated(state, action as RFQUpdatedAction);
        case Actions.rfqTableDataUpdated:
            return handleRFQTableDataUpdated(state, action as RFQTableDataUpdatedAction);
        case Actions.rfqQuotesTableDataUpdated:
            return handleRFQQuotesTableDataUpdated(state, action as RFQTableDataUpdatedAction);
        case Actions.rfqNextRfqNumberUpdated:
            return handleNextRFQNumberUpdated(state, action as RFQAction);
        default:
            return state;
    }
};
