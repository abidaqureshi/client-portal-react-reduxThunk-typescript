/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fetchMock from 'fetch-mock';
import { routes } from './routes';
import { SetName } from '../store/Sets/state';
import { SetName as SetNameV2 } from '../store/SetsV2/state';
import { productsMock } from './mocks/products';
import { productsV2Mock } from './mocks/productsV2';
import { countries } from './mocks/countries';
import { user, users } from './mocks/users';
import { suppliers } from './mocks/suppliers';
import { rfqsSummary } from './mocks/rfqs';
import { shortagesMock } from './mocks/shortages';
import { processingSettingsMock } from './mocks/processingSettingsMock';
import { rfqsDetails } from './mocks/rfqsDetails';
import { CreateRFQResult } from '../models/CreateRFQResult';

export const mockRequests = () => {
    fetchMock.post(routes.login(), user, { delay: 1000 });
    fetchMock.post(routes.accessLinkRequest(), {}, { delay: 1000 });
    fetchMock.get(routes.myUser(), users[0]);
    fetchMock.get(routes.users(), users, { query: {} });
    fetchMock.get(routes.usersCollaborators(), users, { query: {} });
    fetchMock.put(routes.myUser(), {}, { delay: 1000 });
    fetchMock.put(routes.myUserThirdPartyLink(), {}, { delay: 1000 });
    fetchMock.put(routes.users(), {}, { delay: 1000 });
    fetchMock.post(routes.users(), {}, { delay: 1000 });
    fetchMock.put(routes.mySettings(), {}, { delay: 1000 });
    fetchMock.get(routes.rfqsDetails(), rfqsDetails, { query: {}, delay: 1500 });
    rfqsDetails.forEach((rfqDetail) => {
        fetchMock.get(routes.rfqDetails(rfqDetail.rfqNumber), rfqDetail, { query: {}, delay: 1500 });
    });
    rfqsSummary.items.forEach((rfq) => {
        fetchMock.put(routes.rfqAssignee(rfq.number), {}, { delay: 1000 });
        fetchMock.put(routes.rfqTableData(rfq.number), {}, { delay: 1000 });
    });
    fetchMock.get(routes.rfqNextNumber(), { nextRfqNumber: '100/20' }, { delay: 2000 });
    fetchMock.get(routes.rfqs(), rfqsSummary, { query: {}, delay: 600 });
    fetchMock.post(routes.rfqs(), { result: CreateRFQResult.EmailsSentButErrorIntegratingWithStreak }, { delay: 1000 });
    fetchMock.get(routes.productsSet(SetName.Countries), countries);
    fetchMock.get(routes.productsSet(SetName.ATCs), ['AT01B00', 'A002B22']);
    fetchMock.get(routes.productsSet(SetName.ActiveSubstances), ['PARACETAMOL', 'CODEINE']);
    fetchMock.get(routes.productsSet(SetName.DrugForms), ['PALLETS', 'LIQUID']);
    fetchMock.get(routes.productsSet(SetName.AdministrationForms), ['ORAL', 'RECTAL']);
    fetchMock.get(routes.productsSet(SetName.Origins), ['ExPrice', 'infarmed.pt']);
    fetchMock.get(routes.productsSet(SetName.Statuses), ['Marketed', 'Discontinued']);

    fetchMock.get(routes.productsV2Set(SetName.Countries), countries);
    fetchMock.get(routes.productsV2Set(SetName.ATCs), ['AT01B00', 'A002B22']);

    fetchMock.get(routes.productsV2Set(SetNameV2.AdditionalInformation), [
        'Generic',
        'Psychotropic',
        'Biological',
        'Additional Monitoring',
        'Prescription',
        'Hospitalar',
        'Precautions For Storage',
    ]);
    fetchMock.get(routes.productsV2Set(SetName.ActiveSubstances), ['Paracetamol', 'Codeine']);
    fetchMock.get(routes.productsV2Set(SetName.DrugForms), ['Solid', 'Tablet', 'Film']);
    fetchMock.get(routes.productsV2Set(SetName.AdministrationForms), ['Oral', 'Rectal']);
    fetchMock.get(routes.productsV2Set(SetName.Origins), ['coiso.lv', 'infarmed.pt']);

    fetchMock.get(routes.products(), productsMock, { query: {}, delay: 2000 });
    fetchMock.get(routes.productsV2(), productsV2Mock, { query: {}, delay: 2000 });
    fetchMock.get(routes.shortages(), shortagesMock, { query: {} });
    fetchMock.get(routes.processingSettings('infarmed.pt'), processingSettingsMock);
    fetchMock.post(routes.processingSettings('infarmed.pt'), {}, { delay: 1000 });
    fetchMock.post(routes.processing('infarmed.pt'), {}, { delay: 1000 });
    fetchMock.get(routes.termsTranslation('pt'), { administrationMap: { Buccal: ['bocal'] } }, { delay: 200 });
    fetchMock.get(routes.externalSupplierRfqsData(), rfqsDetails[0].suppliersDetails[1], { query: {}, delay: 600 });
    fetchMock.put(routes.externalSupplierRfqsData(), {}, { query: {}, delay: 600 });
    fetchMock.get(routes.externalSupplierProductsSearch(), productsV2Mock.items, { query: {}, delay: 200 });
    fetchMock.get(
        routes.externalSupplierRfqsResponsibles(),
        { '456/20': 'fcardoso', '123/20': 'fonseca' },
        { query: {}, delay: 1000 },
    );
    fetchMock.get(routes.externalSupplierCollaborators(), users, { query: {}, delay: 4000 });
    fetchMock.get(routes.suppliers(), suppliers, { query: {} });
    fetchMock.get(
        'https://api.exchangeratesapi.io/latest?symbols=EUR&base=USD',
        { rates: { EUR: 0.8826904405 }, base: 'USD', date: '2020-07-13' },
        { delay: 8000 },
    );
};
