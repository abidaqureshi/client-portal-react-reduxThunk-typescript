import { RFQSummary } from '../../models/RFQSummary';
import { RFQState } from '../../models/RFQState';
import { SearchResult } from '../../models/SearchResult';

export const rfqsSummary: SearchResult<RFQSummary> = {
    total: 55,
    timeInSeconds: 0.58,
    items: [
        {
            number: '795/22',
            endingDate: '2022-11-03T17:13:44.38Z',
            creationDate: '2022-11-03T17:13:44.38Z',
            title: 'RFQ 795/22 - Desmopressina 0,2mg Comprimidos (H01BA02)',
            state: RFQState.Open,
            stateChangeDate: '2022-11-03T17:13:44.38Z',
            assigneeUsername: 'sjacinto',
        },
        {
            number: '123/20',
            endingDate: '2022-11-03T17:13:44.38Z',
            state: RFQState.Open,
            creationDate: '2020-06-25T00:25:00.000',
            title: 'RFQ 123/20 - BRUFEN',
            assigneeUsername: 'fcardoso',
            stateChangeDate: '2020-06-25T00:25:00.000',
        },
        {
            number: '333/20',
            endingDate: '2022-11-03T17:13:44.38Z',
            state: RFQState.Cancelled,
            creationDate: '2020-06-25T00:25:00.000',
            title: 'RFQ 333/20 - COISO',
            assigneeUsername: 'andrei',
            stateChangeDate: '2020-06-25T00:25:00.000',
        },
        {
            number: '456/20',
            endingDate: '2022-11-03T17:13:44.38Z',
            state: RFQState.ClosedWithoutQuote,
            creationDate: '2020-06-25T00:25:00.000',
            title: 'RFQ 456/20 - ARDINEX',
            assigneeUsername: 'fcardoso',
            stateChangeDate: '2020-06-25T00:25:00.000',
        },
        {
            number: '363/21',
            endingDate: '2022-11-03T17:13:44.38Z',
            creationDate: '2021-03-29T12:08:30.43Z',
            title: 'RFQ 363/21 - Pilocarpina 20 mg/ml Colírio  (S01EB01)',
            state: RFQState.Open,
            stateChangeDate: '2021-03-29T12:08:30.43Z',
            assigneeUsername: 'joana',
        },
        {
            number: '725/22',
            endingDate: '2022-11-03T17:13:44.38Z',
            creationDate: '2022-10-10T11:04:09.561Z',
            title: 'RFQ 725/22 - OXITOCINA 5 I.E./ml  (H01BB02)',
            state: RFQState.Open,
            stateChangeDate: '2022-10-10T11:04:09.561Z',
            assigneeUsername: 'jaime.sousa',
        },
    ],
};
