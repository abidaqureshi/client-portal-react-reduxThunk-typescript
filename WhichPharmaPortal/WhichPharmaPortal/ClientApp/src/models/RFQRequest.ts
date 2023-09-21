import { RFQEmailData } from './RFQEmailData';
import { RFQState } from './RFQState';

export interface RFQRequest {
    senderEmail?: string;
    senderPassword?: string;
    senderGmailAccessCode?: string;
    emailsData: RFQEmailData[];
    rfqNumbersToAssignToExistingOnes?: string[];
}

export interface IRFQDueRminderRequest {
    reminder: number;
    dueDate: string;
}

export interface IRFQStateReasonRequest {
    reason: string;
    state: RFQState;
}
