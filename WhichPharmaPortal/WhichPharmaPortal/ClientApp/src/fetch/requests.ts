import { routes } from './routes';
import { SearchResult } from '../models/SearchResult';
import { ProcessingPformsSettings } from '../models/ProcessingPformsSettings';
import { AuthenticatedUser } from '../models/AuthenticatedUser';
import { CreateUser } from '../models/CreateUser';
import { UpdateUser } from '../models/UpdateUser';
import { User } from '../models/User';
import { Supplier } from '../models/Supplier';
import { RFQSummary } from '../models/RFQSummary';
import { Shortage } from '../models/Shortage';
import { IRFQDueRminderRequest, IRFQStateReasonRequest, RFQRequest } from '../models/RFQRequest';
import { ProcessingSettings } from '../models/ProcessingSettings';
import { RFQDetails } from '../models/RFQDetails';
import { MapOf } from '../utils/Types';
import { CreateRFQResult } from '../models/CreateRFQResult';
import { ResultHandler } from '../models/ResultHandler';
import { RFQSupplierDetails } from '../models/RFQSupplierDetails';
import { ProductV1 } from '../models/ProductV1';
import { ProductV2 } from '../models/ProductV2';
import { Login } from '../models/Login';
import { RFQQuote } from '../models/RFQQuote';
import { SupplierRFQQuotesChange } from '../models/SupplierRFQQuotesChange';
import { TermsTranslations } from '../models/TermsMapping';
import { RequestAccessLink } from '../models/RequestAccessLink';
import { RFQQuoteTableItem } from '../pages/RFQDetailsV2';

export class RequestError extends Error {
    statusCode: number;
    body: any;

    constructor(statusCode: number, body: any) {
        super(`Request error: ${statusCode}`);
        this.statusCode = statusCode;
        this.body = body;
    }
}

const getHeaders = (token?: string): Headers => {
    const headers = new Headers();

    headers.append('content-type', 'application/json');
    if (token) headers.append('Authorization', `Bearer ${token}`);
    return headers;
};

const responseHandleMiddleware = async (r: Response): Promise<any> => {
    if (!r.ok) {
        let bodyObj = {};
        try {
            bodyObj = await r.json();
        } catch (e) {}
        throw new RequestError(r.status, bodyObj);
    }
    var isJson = r.headers.get('content-type')?.includes('application/json');
    return isJson ? r.json() : null;
};

function getParams(params?: { [name: string]: any }) {
    if (!params) return '';

    const paramsString = Object.keys(params)
        .filter((k) => !!params[k])
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k].toString()))
        .join('&');

    return paramsString.length === 0 ? '' : '?'.concat(paramsString);
}

const post = (uri: string, body: any, token?: string): Promise<any> =>
    fetch(uri, {
        method: 'post',
        headers: getHeaders(token),
        body: JSON.stringify(body),
    }).then(responseHandleMiddleware);

const put = (uri: string, body: any, token?: string): Promise<any> =>
    fetch(uri, {
        method: 'put',
        headers: getHeaders(token),
        body: JSON.stringify(body),
    }).then(responseHandleMiddleware);

const get = (uri: string, token?: string, params?: { [name: string]: any }): Promise<any> =>
    fetch(uri + getParams(params), {
        method: 'get',
        headers: getHeaders(token),
    }).then(responseHandleMiddleware);

export const getProductsAsync = (
    offset: number,
    pageSize: number,
    filters: { [property: string]: string | string[] | null | undefined },
    token?: string,
): Promise<SearchResult<ProductV1>> => get(routes.products(), token, { offset, pageSize, ...filters });

export const getProductsV2Async = (
    offset: number,
    pageSize: number,
    filters: { [property: string]: string | string[] | null | undefined },
    token?: string,
): Promise<SearchResult<ProductV2>> => get(routes.productsV2(), token, { offset, pageSize, ...filters });

export const getShortagesAsync = (
    offset: number,
    pageSize: number,
    filters: { [property: string]: string | string[] | undefined },
    token?: string,
): Promise<SearchResult<Shortage>> => get(routes.shortages(), token, { offset, pageSize, ...filters });

export const getSuppliersAsync = (
    offset: number,
    pageSize: number,
    filters: { [property: string]: string | string[] | undefined },
    token?: string,
): Promise<SearchResult<Supplier>> => get(routes.suppliers(), token, { offset, pageSize, ...filters });

export const getSetAsync = (setName: string, token?: string): Promise<any[]> => get(routes.productsSet(setName), token);

export const getSetV2Async = (setName: string, token?: string): Promise<any[]> =>
    get(routes.productsV2Set(setName), token);

export const getUsersAsync = (token?: string): Promise<User[]> => get(routes.users(), token);

export const getUsersCollaboratorsAsync = (token?: string): Promise<User[]> => get(routes.usersCollaborators(), token);

export const getMyUserAsync = (token?: string): Promise<User> => get(routes.myUser(), token);

export const postUserAsync = (user: CreateUser, token?: string): Promise<void> => post(routes.users(), user, token);

export const putUserAsync = (username: string, user: UpdateUser, token?: string): Promise<void> =>
    put(routes.user(username), user, token);

export const putMyUserGoogleLinkAsync = (googleProvider: string, googleId: string, token?: string): Promise<void> =>
    put(routes.myUserThirdPartyLink(), { provider: googleProvider, id: googleId }, token);

export const putMyUserAsync = (user: UpdateUser, token?: string): Promise<void> => put(routes.myUser(), user, token);

export const postLoginAsync = (login: Login): Promise<AuthenticatedUser> => post(routes.login(), login);

export const postRequestAccessLinkAsync = (request: RequestAccessLink): Promise<void> =>
    post(routes.accessLinkRequest(), request);

export const getRFQsAsync = (
    onlyMine: boolean,
    search: string | undefined,
    createdBy: string | undefined,
    expiredIn: string | undefined,
    offset: number,
    pageSize: number,
    token?: string,
): Promise<SearchResult<RFQSummary>> => get(routes.rfqs(), token, { offset, search,createdBy,expiredIn, pageSize, onlyMine });

export const getRFQsAsyncV2 = (
    onlyMine: boolean,
    search: string | undefined,
    expiredIn: string | undefined,
    createdBy: string | undefined,
    offset: number,
    pageSize: number,
    token?: string,
): Promise<SearchResult<RFQSummary>> =>
    get(routes.rfqs(), token, { offset, search, expiredIn, createdBy, pageSize, onlyMine });

export const getRFQsDetailsAsync = (rfqNumbers: string[], token?: string): Promise<RFQDetails[]> =>
    get(routes.rfqsDetails(), token, { rfqNumbers });

export const getRFQDetailsAsync = (rfqNumber: string, token?: string): Promise<RFQDetails> =>
    get(routes.rfqDetails(rfqNumber), token);

export const getRFQHistoryAsync = (rfqNumber: string, token?: string): Promise<RFQDetails[]> =>
    get(routes.rfqHistory(rfqNumber), token);

export const putUserSettingsAsync = (settings: { [key: string]: any }, token?: string): Promise<AuthenticatedUser> =>
    put(routes.mySettings(), settings, token);

export const postRFQRequestAsync = (request: RFQRequest, token?: string): Promise<ResultHandler<CreateRFQResult>> =>
    post(routes.rfqs(), request, token);

export const putRFQDueReminderRequestAsync = (
    rfqNumber: string,
    request: IRFQDueRminderRequest,
    token?: string,
): Promise<void> => put(routes.rfqsDueDate(rfqNumber), request, token);

export const putRFQStateReasonAsync = (
    rfqNumber: string,
    request: IRFQStateReasonRequest,
    token?: string,
): Promise<RFQSummary> => put(routes.rfqsReasonState(rfqNumber), request, token);

export const putRFQAssigneeAsync = (rfqNumber: string, username?: string, token?: string): Promise<void> =>
    put(routes.rfqAssignee(rfqNumber), username, token);

export const putRFQDataAsync = (rfqNumber: string, dataByThreadId: MapOf<RFQQuote[]>, token?: string): Promise<void> =>
    put(routes.rfqTableData(rfqNumber), dataByThreadId, token);

export const putRFQCardsDataAsync = (
    rfqNumber: string,
    cardsData: RFQQuoteTableItem[],
    token?: string,
): Promise<RFQSummary> => put(routes.rfqCardsData(rfqNumber), cardsData, token);

export const getRFQNextNumberAsync = (token?: string): Promise<{ nextRfqNumber: string }> =>
    get(routes.rfqNextNumber(), token);

export const getPlatformProcessingSettingsAsync = (origin: string, token?: string): Promise<ProcessingSettings> =>
    get(routes.processingSettings(origin), token);

export const getPlatformPformProcessingSettingsAsync = (origin: string, token?: string): Promise<SearchResult<ProcessingPformsSettings>> =>
    get(routes.processingPformSettings(origin), token);

export const postPlatformProcessingSettingsAsync = (
    origin: string,
    settings: ProcessingSettings,
    token?: string,
): Promise<void> => post(routes.processingSettings(origin), settings, token);

export const postPlatformSenReProcessRequestAsync = (
    origin: string,
    valuesAffected: string[],
    token?: string,
): Promise<void> => post(routes.processing(origin), valuesAffected, token);
export const postPlatformRestoreBackupRequestAsync = (
    origin: string,
    valuesAffected: string[],
    token?: string,
): Promise<void> => post(routes.processingBackup(origin), valuesAffected, token);

export const getPlatformTermsTranslationsAsync = (language: string, token?: string): Promise<TermsTranslations> =>
    get(routes.termsTranslation(language), token);

export const getExternalRFQsSupplierDataAsync = (rfqsNumbers?: string[], token?: string): Promise<RFQSupplierDetails> =>
    get(routes.externalSupplierRfqsData(), token, { rfqsNumbers });

export const putExternalSupplierRFQsDataAsync = (data: SupplierRFQQuotesChange, token?: string): Promise<void> =>
    put(routes.externalSupplierRfqsData(), data, token);

export const getExternalSupplierProductsSearchAsync = (term: string, token?: string): Promise<ProductV2[]> =>
    get(routes.externalSupplierProductsSearch(), token, { name: term });

export const getExternalSupplierCollaboratorsAsync = (token?: string): Promise<User[]> =>
    get(routes.externalSupplierCollaborators(), token);

export const getExternalSupplierRFQsResposiblesAsync = (
    rfqsNumbers: string[],
    token?: string,
): Promise<MapOf<string>> => get(routes.externalSupplierRfqsResponsibles(), token, { rfqsNumbers });
