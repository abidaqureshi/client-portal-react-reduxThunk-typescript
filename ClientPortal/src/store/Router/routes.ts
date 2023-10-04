export interface IRoutes {
    home: string;
    login: string;
    logout: string;
    rfqsList: string;
    rfqsListV2: string;
    rfq: (rfqNr: string, encode?: boolean) => string;
    rfqV2: (rfqNr: string, encode?: boolean) => string;
    profile: string;
    users: string;
    productsSelection: (offset?: number | string) => string;
    productsProdV1Selection: (offset?: number | string) => string;
    productsV1Selection: (offset?: number | string) => string;
    productsV2Selection: (offset?: number | string) => string;
    productsV3Selection: (offset?: number | string) => string;
    shortagesSelection: (offset?: number | string) => string;
    suppliersSelecion: (offset?: number | string) => string;
    suppliersSelecionProdV1: (offset?: number | string) => string;
    suppliersV3Selecion: (offset?: number | string) => string;
    communicationSetup: string;
    communicationSetupProdV1: string;
    communicationSetupV2: string;
    rfqCreated: string;
    platform: string;
    supplierReplyForm: string;
}

export const routes: IRoutes = {
    home: '/',
    login: '/login',
    logout: '/logout',
    rfqsList: '/rfqs',
    rfqsListV2: '/rfqsV2',
    rfq: (rfqNr: string, encode: boolean = true) => `/rfqs/${encode ? encodeURIComponent(rfqNr) : rfqNr}`,
    rfqV2: (rfqNr: string, encode: boolean = true) => `/rfqsV2/${encode ? encodeURIComponent(rfqNr) : rfqNr}`,
    profile: '/profile',
    users: '/users',
    productsSelection: (offset?: number | string) => `/products/${offset || ''}`,
    productsProdV1Selection: (offset?: number | string) => `/products-prodv1/${offset || ''}`,
    productsV1Selection: (offset?: number | string) => `/products-V1/${offset || ''}`,
    productsV2Selection: (offset?: number | string) => `/products-V2/${offset || ''}`,
    productsV3Selection: (offset?: number | string) => `/products-V3/${offset || ''}`,
    shortagesSelection: (offset?: number | string) => `/shortages/${offset || ''}`,
    suppliersSelecion: (offset?: number | string) => `/suppliers/${offset || ''}`,
    suppliersSelecionProdV1: (offset?: number | string) => `/suppliers-prodv1/${offset || ''}`,
    suppliersV3Selecion: (offset?: number | string) => `/suppliers-V3/${offset || ''}`,
    communicationSetup: '/commconfig',
    communicationSetupProdV1: '/commconfigProdV1',
    communicationSetupV2: '/commconfigV2',
    rfqCreated: '/rfqcreated',
    platform: '/platform',
    supplierReplyForm: '/replyform',
};

export const standaloneRoutes = [routes.supplierReplyForm];
