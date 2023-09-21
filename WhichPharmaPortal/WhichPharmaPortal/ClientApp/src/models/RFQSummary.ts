import { RFQState } from './RFQState';

export interface RFQSummary {
    number: string;
    creationDate: string;
    title: string;
    state: RFQState;
    endingDate: string;
    stateChangeDate: string;
    assigneeUsername?: string;
    reason?: string;
    reminder?: number;
}
