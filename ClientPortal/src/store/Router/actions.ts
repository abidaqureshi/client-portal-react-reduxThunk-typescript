/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { push } from 'react-router-redux';
import { routes } from './routes';
import queryString from 'query-string';
import { CreateRFQResult } from '../../models/CreateRFQResult';

export const goTo = (url: string) => push({ pathname: url });

export const goToHome = () => push({ pathname: routes.home });

export const goToCommunicationConfig = (filters?: any) =>
    push({
        pathname: routes.communicationSetup,
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });

export const goToCommunicationConfigProdV1 = (filters?: any) =>
    push({
        pathname: routes.communicationSetupProdV1,
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });

export const goToCommunicationConfigV2 = (filters?: any) =>
    push({
        pathname: routes.communicationSetupV2,
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });

export const goToRFQCreated = (result: CreateRFQResult) =>
    push({ pathname: routes.rfqCreated, hash: result && result.toString() });

export const goToLogin = (redirect?: string) => {
    return push({
        pathname: routes.login,
        search: (redirect && queryString.stringify({ redirect })) || window.location.search,
    });
};

export const goToProducts = (offset?: number, filters?: any) => {
    return push({
        pathname: routes.productsSelection(offset),
        search: filters && Object.keys(filters).length > 0 ? queryString.stringify({ ...filters }) : '',
    });
};

export const goToProductsProdV1 = (offset?: number, filters?: any) => {
    return push({
        pathname: routes.productsProdV1Selection(offset),
        search: filters && Object.keys(filters).length > 0 ? queryString.stringify({ ...filters }) : '',
    });
};

export const goToProductsV3 = (offset?: number, filters?: any) => {
    return push({
        pathname: routes.productsV3Selection(offset),
        search: Object.keys(filters).length > 0 ? queryString.stringify({ ...filters }) : '',
    });
};

export const goToProductsV1 = (offset?: number, filters?: any) => {
    return push({
        pathname: routes.productsV1Selection(offset),
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });
};

export const goToProductsV2 = (offset?: number, filters?: any) => {
    return push({
        pathname: routes.productsV2Selection(offset),
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });
};

export const goToShortages = (offset?: number, filters?: any) => {
    return push({
        pathname: routes.shortagesSelection(offset),
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });
};

export const goToSuppliers = (offset?: number, filters?: any) => {
    return push({
        pathname: routes.suppliersSelecion(offset),
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });
};

export const goToSuppliersProdV1 = (offset?: number, filters?: any) => {
    return push({
        pathname: routes.suppliersSelecionProdV1(offset),
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });
};

export const goToSuppliersV3 = (offset?: number, filters?: any) => {
    return push({
        pathname: routes.suppliersV3Selecion(offset),
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });
};

export const goToRFQDetails = (rfqNr: string, filters?: any) => {
    return push({
        pathname: routes.rfq(rfqNr),
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });
};
export const goToRFQDetailsV2 = (rfqNr: string) => push({ pathname: routes.rfqV2(rfqNr) });

export const goToRFQsList = (filters?: any) => {
    return push({
        pathname: routes.rfqsList,
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });
};

export const goToRFQsListV2 = (filters?: any) => {
    console.log('filters ', filters);
    return push({
        pathname: routes.rfqsListV2,
        search: filters ? queryString.stringify({ ...queryString.parse(window.location.search), ...filters }) : '',
    });
};
