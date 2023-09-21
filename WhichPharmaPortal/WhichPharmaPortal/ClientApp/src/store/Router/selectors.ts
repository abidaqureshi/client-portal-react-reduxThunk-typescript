import { ApplicationState } from '..';
import queryString, { ParsedQuery } from 'query-string';

export const getLocation = (state: ApplicationState) => state.router.location;
export const getLocationQuery = (state: ApplicationState): ParsedQuery<string> =>
    queryString.parse(state.router.location?.search || '');
export const getLocationRedirectParam = (state: ApplicationState): string | undefined =>
    getLocationQuery(state)['redirect'] as string | undefined;
