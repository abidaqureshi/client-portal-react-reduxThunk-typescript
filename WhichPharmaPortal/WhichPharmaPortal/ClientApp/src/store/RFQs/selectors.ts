import { ApplicationState } from '..';
import { RFQSummary } from '../../models/RFQSummary';
import { RFQRequest } from '../../models/RFQRequest';
import { RFQDetails } from '../../models/RFQDetails';
import { MapOf } from '../../utils/Types';

export const getRFQSummaries = (state: ApplicationState): MapOf<RFQSummary> => state.rfqs.summaries;
export const getRFQSearchTotal = (state: ApplicationState): number => state.rfqs.searchTotal || 0;
export const getRFQDetails = (state: ApplicationState): MapOf<RFQDetails> => state.rfqs.details;
export const isLoadingRFQs = (state: ApplicationState): boolean => state.rfqs.isLoading;
export const getLoadingTime = (state: ApplicationState): number => state.rfqs.timeInSeconds || 0;
export const isSubmittingRFQs = (state: ApplicationState): boolean => state.rfqs.isSubmitting;
export const isUpdatingRFQ = (state: ApplicationState, rfqNumber: string): boolean =>
    !!state.rfqs.isUpdating?.includes(rfqNumber);
export const getLatestRFQRequest = (state: ApplicationState): RFQRequest | undefined =>
    state.rfqs.latestRequestSubmitted;
export const getNextRfqNumber = (state: ApplicationState): string | undefined => state.rfqs.nextRfqNumber;
