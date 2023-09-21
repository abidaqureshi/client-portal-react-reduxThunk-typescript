import { RFQState } from '../../models/RFQState';

export interface RfqsFilters {
    search?: string;
    expiredIn?: string;
    createdBy?: string;
    offset?: string;
    onlyMine?: string;
}

export interface IRfqProps {
    id: string;
    username: string | undefined;
    number: string;
    creationDate: string;
    endingDate: string;
    title: string;
    state: RFQState;
    stateChangeDate: string;
    assigneeUsername?: string | undefined;
}
