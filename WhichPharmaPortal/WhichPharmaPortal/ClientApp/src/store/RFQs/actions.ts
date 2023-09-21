import { ApplicationState, AppThunkAction } from '..';
import { RFQSummary } from '../../models/RFQSummary';
import { Action } from 'redux';
import {
    postRFQRequestAsync,
    RequestError,
    getRFQsAsync,
    getRFQsDetailsAsync,
    getRFQDetailsAsync,
    putRFQAssigneeAsync,
    putRFQDataAsync,
    getRFQNextNumberAsync,
    putRFQCardsDataAsync,
    getRFQHistoryAsync,
    putRFQStateReasonAsync,
    putRFQDueReminderRequestAsync,
    getRFQsAsyncV2,
} from '../../fetch/requests';
import {
    RFQsSummariesLoadedAction,
    RFQsSubmittedAction,
    RFQsDetailsLoadedAction,
    RFQDetailsLoadedAction,
    RFQUpdatedAction,
    RFQUpdatingAction,
    RFQTableDataUpdatedAction,
    RFQTableQuotesDataUpdateAction,
    RFQAction,
    RFQHistoryLoadedAction,
} from './types';
import { SearchResult } from '../../models/SearchResult';
import { alertGenericError, requestServer, alertError, alertSuccess } from '../Session/actions';
import { IRFQDueRminderRequest, IRFQStateReasonRequest, RFQRequest } from '../../models/RFQRequest';
import { isLoadingRFQs, isSubmittingRFQs, getRFQSummaries, isUpdatingRFQ, getRFQDetails } from './selectors';
import { suppliersDeselectAll } from '../Suppliers/actions';
import { productsDeselectAll } from '../Products/actions';
import { productsDeselectAll as productsDeselectAllV2 } from '../ProductsV2/actions';
import { goToRFQCreated } from '../Router/actions';
import { TK } from '../Translations/translationKeys';
import { RFQCreationError } from '../../models/RFQCreationError';
import { HTTP_BAD_REQUEST } from '../../fetch/statusCodes';
import { getTranslation } from '../Translations/selectors';
import { RFQDetails, RFQDetailsResponse } from '../../models/RFQDetails';
import { RFQUpdateError } from '../../models/RFQUpdateError';
import { MapOf } from '../../utils/Types';
import { CreateRFQResult } from '../../models/CreateRFQResult';
import { RFQQuoteInfo } from '../../models/RFQQuoteInfo';
import { RFQQuoteTableItem } from '../../pages/RFQDetailsV2';

export const Actions = {
    rfqsLoading: '@@whichpharma.rfqs.loading',
    rfqsLoaded: '@@whichpharma.rfqs.loaded',
    rfqsDetailsLoaded: '@@whichpharma.rfqs.detailsLoaded',
    rfqDetailsLoaded: '@@whichpharma.rfq.detailsLoaded',
    rfqHistoryLoaded: '@@whichpharma.rfq.historyLoaded',
    rfqsLoadError: '@@whichpharma.rfqs.loadError',
    rfqsSubmitting: '@@whichpharma.rfqs.submitting',
    rfqsSubmitted: '@@whichpharma.rfqs.submitted',
    rfqsSubmitError: '@@whichpharma.rfqs.submitError',
    rfqsUpdating: '@@whichpharma.rfqs.updating',
    rfqUpdate: '@@whichpharma.rfq.update',
    rfqsUpdated: '@@whichpharma.rfqs.updated',
    rfqsUpdateError: '@@whichpharma.rfqs.updateError',
    rfqTableDataUpdated: '@@whichpharma.rfq.tableDataUpdated',
    rfqQuotesTableDataUpdated: '@@whichpharma.rfq.quotes.tableDataUpdated',
    rfqNextRfqNumberUpdated: '@@whichpharma.rfq.rfqNextRfqNumberUpdated',
};

const rfqsLoading = (): Action => ({
    type: Actions.rfqsLoading,
});

const rfqsLoaded = (result: SearchResult<RFQSummary>): RFQsSummariesLoadedAction => ({
    type: Actions.rfqsLoaded,
    result,
});

const rfqsDetailsLoaded = (response: RFQDetailsResponse): RFQsDetailsLoadedAction => ({
    type: Actions.rfqsDetailsLoaded,
    response,
});

const rfqDetailsLoaded = (rfqNr: string, result: RFQDetails): RFQDetailsLoadedAction => ({
    type: Actions.rfqDetailsLoaded,
    rfqNr,
    result,
});

const rfqHistoryLoaded = (rfqNr: string, result: RFQDetails[]): RFQHistoryLoadedAction => ({
    type: Actions.rfqHistoryLoaded,
    rfqNr,
    result,
});

const rfqsLoadError = (): Action => ({
    type: Actions.rfqsLoadError,
});

const rfqsSubmitting = (): Action => ({
    type: Actions.rfqsSubmitting,
});

const rfqsSubmitted = (request: RFQRequest): RFQsSubmittedAction => ({
    type: Actions.rfqsSubmitted,
    request,
});

const rfqsUpdating = (rfqNumber: string): RFQUpdatingAction => ({
    type: Actions.rfqsUpdating,
    rfqNumber,
});

const rfqUpdated = (result: RFQSummary): RFQUpdatedAction => ({
    type: Actions.rfqsUpdated,
    result,
});

const rfqsSubmitError = (): Action => ({
    type: Actions.rfqsSubmitError,
});

const rfqsUpdateError = (rfqNumber: string): RFQUpdatingAction => ({
    type: Actions.rfqsUpdateError,
    rfqNumber,
});

const rfqTableDataUpdated = (rfqNumber: string, dataByThreadId: MapOf<RFQQuoteInfo[]>): RFQTableDataUpdatedAction => ({
    type: Actions.rfqTableDataUpdated,
    rfqNumber,
    dataByThreadId,
});

const rfqQuotesTableDataUpdated = (
    rfqNumber: string,
    dataByThreadId: MapOf<RFQQuoteInfo[]>,
): RFQTableQuotesDataUpdateAction => ({
    type: Actions.rfqQuotesTableDataUpdated,
    rfqNumber,
    dataByThreadId,
});

const nextRfqNumberUpdated = (nextRfqNumber: string): RFQAction => ({
    type: Actions.rfqNextRfqNumberUpdated,
    rfqId: nextRfqNumber,
});

export const fetchRFQsV2 = (
    onlyMine: boolean,
    search?: string,
    expiredIn?: string,
    createdBy?: string,
    offset = 0,
    pageSize = 50,
): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if (isLoadingRFQs(getState())) {
                console.log('rfqs are loading.....');
                return;
            }
            dispatch(rfqsLoading());
            const result = await dispatch(
                requestServer((token) =>
                    getRFQsAsyncV2(onlyMine, search, expiredIn, createdBy, offset, pageSize, token),
                ),
            );
            dispatch(rfqsLoaded(result || []));
            dispatch(fetchRFQsDetails(true));
        } catch (e) {
            console.log(e);
            dispatch(rfqsLoadError());
            dispatch(alertGenericError());
        }
    };
};

export const fetchRFQs = (
    onlyMine: boolean,
    search?: string,
    createdBy?: string,
    expiredIn?: string,
    offset = 0,
    pageSize = 50,
): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if (isLoadingRFQs(getState())) {
                console.log('rfqs are loading.....');
                return;
            }
            dispatch(rfqsLoading());
            const result = await dispatch(
                requestServer((token) => getRFQsAsync(onlyMine, search, createdBy, expiredIn, offset, pageSize, token)),
            );
            dispatch(rfqsLoaded(result || []));
            dispatch(fetchRFQsDetails(true));
        } catch (e) {
            console.log(e);
            dispatch(rfqsLoadError());
            dispatch(alertGenericError());
        }
    };
};

export const fetchRFQsDetails = (onlyMissing?: boolean): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            const state = getState();
            const rfqs = getRFQSummaries(state);
            const details = getRFQDetails(state);
            const rfqsNrs = onlyMissing
                ? Object.values(rfqs)
                      .filter((rfq) => !details[rfq.number])
                      .map((rfq) => rfq.number)
                : Object.values(rfqs).map((rfq) => rfq.number);
            dispatch(rfqsLoading());
            const startTime = new Date().getTime();
            const result = await dispatch(requestServer((token) => getRFQsDetailsAsync(rfqsNrs, token)));
            const endsTime = new Date().getTime();
            let timeInSeconds = 0;
            if (result.length > 0) {
                timeInSeconds = Math.round((endsTime - startTime) / 1000);
            }
            dispatch(rfqsDetailsLoaded({ result, timeInSeconds: timeInSeconds }));
        } catch (e) {
            console.log(e);
        }
    };
};

export const fetchRFQDetails = (rfqNr: string): AppThunkAction<Promise<void>> => {
    return async (dispatch): Promise<void> => {
        try {
            dispatch(rfqsLoading());
            const result = await dispatch(requestServer((token) => getRFQDetailsAsync(rfqNr, token)));
            dispatch(rfqDetailsLoaded(rfqNr, result));
        } catch (e) {
            console.log(e);
        }
    };
};

export const fetchRFQHistory = (rfqNr: string): AppThunkAction<Promise<void>> => {
    return async (dispatch): Promise<void> => {
        try {
            //dispatch(rfqsLoading());
            const result = await dispatch(requestServer((token) => getRFQHistoryAsync(rfqNr, token)));
            // dispatch(rfqHistoryLoaded(rfqNr, result));
        } catch (e) {
            console.log(e);
        }
    };
};

const getRFQCreationErrorTranslationKey = (error: RFQCreationError): TK => {
    switch (error) {
        case RFQCreationError.SupplierFirstNameMissing:
            return TK.supplierFirstNameMissing;
        case RFQCreationError.SupplierLastNameMissing:
            return TK.supplierLastNameMissing;
        case RFQCreationError.UserFirstNameMissing:
            return TK.userFirstNameMissing;
        case RFQCreationError.UserLastNameMissing:
            return TK.userLastNameMissing;
        case RFQCreationError.UserEmailMissing:
            return TK.userEmailMissing;
        case RFQCreationError.UserTitleMissing:
            return TK.userTitleMissing;
        case RFQCreationError.ProductsTableMissing:
            return TK.productsTableMissing;
        case RFQCreationError.SupplierNotFoundInDatabase:
            return TK.supplierNotFoundInDatabase;
        case RFQCreationError.RecipientNotFoundInSupplierData:
            return TK.recipientNotFoundInSupplierData;
        case RFQCreationError.UserNotFoundInDatabase:
            return TK.userNotFoundInDatabase;
        case RFQCreationError.EmailBodyContainsUnknownPlaceholder:
            return TK.emailBodyContainsUnknownPlaceholder;
        case RFQCreationError.UnableToConnectToYourEmailAccount:
            return TK.unableToConnectToYourEmailAccount;
        case RFQCreationError.DueDateMissing:
            return TK.dueDateMissing;
        default:
            return TK.somethingWentWrong;
    }
};

const getRFQCreationErrorMessage = (error: any, state: ApplicationState): string => {
    const result: RFQCreationError | undefined =
        (error instanceof RequestError &&
            (error as RequestError).statusCode === HTTP_BAD_REQUEST &&
            ((error as RequestError).body?.error as RFQCreationError)) ||
        undefined;

    if (result !== undefined) {
        return getTranslation(state, getRFQCreationErrorTranslationKey(result));
    }

    const stateModelResult =
        (error instanceof RequestError &&
            (error as RequestError).statusCode === HTTP_BAD_REQUEST &&
            ((error as RequestError).body?.errors as MapOf<string[]>)) ||
        undefined;

    if (stateModelResult !== undefined) {
        return `Invalid request: ${Object.keys(stateModelResult).map(
            (field) => `${field} - ${stateModelResult[field].join(' ')}`,
        )}`;
    }

    return getTranslation(state, TK.somethingWentWrong);
};

const getRFQUpdateErrorMessage = (error: any): TK => {
    const result: RFQUpdateError | undefined =
        (error instanceof RequestError &&
            (error as RequestError).statusCode === HTTP_BAD_REQUEST &&
            ((error as RequestError).body?.error as RFQUpdateError)) ||
        undefined;

    switch (result) {
        case RFQUpdateError.UserNotFound:
            return TK.userNotFoundInDatabase;
        case RFQUpdateError.UserIsNotACollaborator:
            return TK.userIsNotACollaborator;
        case RFQUpdateError.UserIsNotAllowed:
            return TK.userIsNotAllowed;
        case RFQUpdateError.ThreadNotFound:
            return TK.threadNotFound;
        default:
            return TK.somethingWentWrong;
    }
};

const getRFQCreateErrorMessage = (result: CreateRFQResult): TK | null => {
    switch (result) {
        case CreateRFQResult.ErrorAccessingDatabase:
            return TK.errorAccessingDatabase;
        case CreateRFQResult.ErrorSendingEmails:
            return TK.errorSendingEmails;
        case CreateRFQResult.ExistingRfqNotFound:
            return TK.youreTryingToAssignToAnExistingRfqWhichWasntFound;
        case CreateRFQResult.RfqNumberIsAlreadyInUse:
            return TK.someoneHasCreatedRfqWithTheSameNumberPleaseTryAgain;
        default:
            return null;
    }
};

export const submitRFQs = (request: RFQRequest): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if (isSubmittingRFQs(getState())) {
                return;
            }
            dispatch(rfqsSubmitting());

            const result = await dispatch(requestServer((token) => postRFQRequestAsync(request, token)));

            var error = getRFQCreateErrorMessage(result?.result);

            if (error) {
                if (result?.result === CreateRFQResult.RfqNumberIsAlreadyInUse) {
                    dispatch(updateNextRFQNumber());
                }
                dispatch(alertError(getTranslation(getState(), error)));
                dispatch(rfqsSubmitError());
            } else {
                dispatch(rfqsSubmitted(request));
                dispatch(goToRFQCreated(result?.result));
                dispatch(productsDeselectAll());
                dispatch(productsDeselectAllV2());
                dispatch(suppliersDeselectAll());
            }
        } catch (e) {
            console.log(e);
            dispatch(rfqsSubmitError());
            dispatch(alertError(getRFQCreationErrorMessage(e, getState())));
        }
    };
};

export const changeRFQAssignment = (rfqNumber: string, username?: string): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if (isUpdatingRFQ(getState(), rfqNumber)) {
                return;
            }

            dispatch(rfqsUpdating(rfqNumber));

            await dispatch(requestServer((token) => putRFQAssigneeAsync(rfqNumber, username, token)));

            var rfq: RFQSummary = {
                ...getRFQSummaries(getState())[rfqNumber],
                assigneeUsername: username,
            };
            dispatch(rfqUpdated(rfq));
            dispatch(alertSuccess(getTranslation(getState(), TK.assigneeSuccessfullyUpdated)));
        } catch (e) {
            console.log(e);
            dispatch(rfqsUpdateError(rfqNumber));
            dispatch(alertError(getTranslation(getState(), getRFQUpdateErrorMessage(e))));
        }
    };
};

export const changeRFQData = (
    rfqNumber: string,
    dataByThreadId: MapOf<RFQQuoteInfo[]>,
): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if (isUpdatingRFQ(getState(), rfqNumber)) {
                return;
            }

            dispatch(rfqsUpdating(rfqNumber));

            await dispatch(requestServer((token) => putRFQDataAsync(rfqNumber, dataByThreadId, token)));

            dispatch(rfqTableDataUpdated(rfqNumber, dataByThreadId));

            dispatch(alertSuccess(getTranslation(getState(), TK.tableDataSuccessfullyUpdated)));
        } catch (e) {
            console.log(e);
            dispatch(rfqsUpdateError(rfqNumber));
            dispatch(alertError(getTranslation(getState(), getRFQUpdateErrorMessage(e))));
        }
    };
};

export const changeRFQQuotesData = (
    rfqNumber: string,
    dataByThreadId: MapOf<RFQQuoteInfo[]>,
): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if (isUpdatingRFQ(getState(), rfqNumber)) {
                return;
            }

            dispatch(rfqsUpdating(rfqNumber));

            await dispatch(requestServer((token) => putRFQDataAsync(rfqNumber, dataByThreadId, token)));

            dispatch(rfqQuotesTableDataUpdated(rfqNumber, dataByThreadId));

            dispatch(alertSuccess(getTranslation(getState(), TK.tableDataSuccessfullyUpdated)));
        } catch (e) {
            console.log(e);
            dispatch(rfqsUpdateError(rfqNumber));
            dispatch(alertError(getTranslation(getState(), getRFQUpdateErrorMessage(e))));
        }
    };
};

export const submitRFQDueDateAndReminder = (
    rfqNumber: string,
    request: IRFQDueRminderRequest,
): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if (isUpdatingRFQ(getState(), rfqNumber)) {
                return;
            }

            dispatch(rfqsUpdating(rfqNumber));

            const result = await dispatch(
                requestServer((token) => putRFQDueReminderRequestAsync(rfqNumber, request, token)),
            );

            console.log(' the reminder and dueDate ', result);

            var rfq: RFQSummary = {
                ...getRFQSummaries(getState())[rfqNumber],
                endingDate: request.dueDate,
                reminder: request.reminder,
            };
            dispatch(rfqUpdated(rfq));
            //dispatch(rfqUpdate(rfqNumber,request))
            dispatch(alertSuccess(getTranslation(getState(), TK.rfqUpdated)));
        } catch (e) {
            console.log(e);
            dispatch(rfqsUpdateError(rfqNumber));
            dispatch(alertError(getTranslation(getState(), getRFQUpdateErrorMessage(e))));
        }
    };
};

export const submitRFQStateReason = (
    rfqNumber: string,
    request: IRFQStateReasonRequest,
): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            if (isUpdatingRFQ(getState(), rfqNumber)) {
                return;
            }

            dispatch(rfqsUpdating(rfqNumber));

            const result = await dispatch(requestServer((token) => putRFQStateReasonAsync(rfqNumber, request, token)));
            var rfq: RFQSummary = {
                ...getRFQSummaries(getState())[rfqNumber],
                reason: request.reason,
                state: request.state,
            };
            dispatch(rfqUpdated(rfq));

            dispatch(alertSuccess(getTranslation(getState(), TK.rfqUpdated)));
        } catch (e) {
            console.log(e);
            dispatch(rfqsUpdateError(rfqNumber));
            dispatch(alertError(getTranslation(getState(), getRFQUpdateErrorMessage(e))));
        }
    };
};

export const updateRFQQuotesCardsData = (
    rfqNumber: string,
    cardsData: RFQQuoteTableItem[],
): AppThunkAction<Promise<void>> => {
    return async (dispatch, getState): Promise<void> => {
        try {
            // if (isUpdatingRFQ(getState(), rfqNumber)) {
            //     return;
            // }

            dispatch(rfqsUpdating(rfqNumber));

            await dispatch(requestServer((token) => putRFQCardsDataAsync(rfqNumber, cardsData, token)));
            //dispatch(rfqQuotesTableDataUpdated(rfqNumber, dataByThreadId));
            dispatch(alertSuccess(getTranslation(getState(), TK.tableDataSuccessfullyUpdated)));
        } catch (e) {
            console.log(e);
            dispatch(rfqsUpdateError(rfqNumber));
            dispatch(alertError(getTranslation(getState(), getRFQUpdateErrorMessage(e))));
        }
    };
};

export const updateNextRFQNumber = (): AppThunkAction<Promise<void>> => {
    return async (dispatch): Promise<void> => {
        try {
            const response = await dispatch(requestServer((token) => getRFQNextNumberAsync(token)));
            dispatch(nextRfqNumberUpdated(response.nextRfqNumber));
        } catch (e) {
            console.log(e);
        }
    };
};
