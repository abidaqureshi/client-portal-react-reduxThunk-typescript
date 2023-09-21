import { RFQSummary } from '../../models/RFQSummary';
import { RFQRequest } from '../../models/RFQRequest';
import { RFQDetails } from '../../models/RFQDetails';
import { MapOf } from '../../utils/Types';

export interface RFQsState {
    summaries: MapOf<RFQSummary>;
    details: MapOf<RFQDetails>;
    isLoading: boolean;
    isSubmitting: boolean;
    isUpdating: string[];
    latestRequestSubmitted?: RFQRequest;
    nextRfqNumber?: string;
    searchTotal?: number;
    timeInSeconds?: number;
    rfqHistory: RFQDetails[];
}
