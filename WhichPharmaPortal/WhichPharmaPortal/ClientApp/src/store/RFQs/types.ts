import { Action } from 'redux';
import { RFQSummary } from '../../models/RFQSummary';
import { SearchResult } from '../../models/SearchResult';
import { RFQRequest } from '../../models/RFQRequest';
import { RFQDetails } from '../../models/RFQDetails';
import { MapOf } from '../../utils/Types';
import { RFQQuote } from '../../models/RFQQuote';
import { RFQQuoteInfo } from '../../models/RFQQuoteInfo';

export interface RFQsSummariesLoadedAction extends Action {
    result: SearchResult<RFQSummary>;
}

export interface RFQsDetailsLoadedAction extends Action {
    response: {
        result: RFQDetails[];
        timeInSeconds: number;
    };
}

export interface RFQDetailsLoadedAction extends Action {
    rfqNr: string;
    result: RFQDetails;
}

export interface RFQHistoryLoadedAction extends Action {
    rfqNr: string;
    result: RFQDetails[];
}

export interface RFQAction extends Action {
    rfqId: string;
}

export interface RFQsSubmittedAction extends Action {
    request: RFQRequest;
}

export interface RFQUpdatingAction extends Action {
    rfqNumber: string;
}

export interface RFQUpdatedAction extends Action {
    result: RFQSummary;
}

export interface RFQTableDataUpdatedAction extends RFQUpdatingAction {
    dataByThreadId: MapOf<RFQQuoteInfo[]>;
}

export interface RFQTableQuotesDataUpdateAction extends RFQUpdatingAction {
    dataByThreadId: MapOf<RFQQuoteInfo[]>;
}
