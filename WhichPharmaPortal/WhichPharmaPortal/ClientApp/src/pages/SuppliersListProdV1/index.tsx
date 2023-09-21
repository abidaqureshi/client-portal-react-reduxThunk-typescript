import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import {
    isLoadingSuppliers,
    getSearchTotalIncludingNotLoaded,
    getSearchResultSuppliers,
    getSelectedSuppliersIds,
    getSelectedSuppliers,
    getSelectedSuppliersEmails,
    getSuppliers,
} from '../../store/Suppliers/selectors';
import {
    fetchSuppliers,
    supplierSelected,
    supplierDeselected,
    supplierContactSelected,
    supplierContactDeselected,
} from '../../store/Suppliers/actions';
import Table, { TableSettings } from '../../components/Table';
import { columnsArray, columns } from './columns';
import SuppliersFilters from './SuppliersFilters';
import { Filters } from './SuppliersFilters/types';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import { Button, Checkbox, Typography } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Panel, { PanelButtonsContainer } from '../../components/Panel';
import queryString from 'query-string';
import List from '../../components/ListV1';
import { Supplier } from '../../models/Supplier';
import { Contact } from '../../models/Contact';
import StarIcon from '@material-ui/icons/Star';
import RFQProgress from '../../modules/RFQProgress';
import { RFQStep } from '../../modules/RFQProgress/RFQProgress';
import Page from '../../components/Page';
import {
    goToSuppliers,
    goToCommunicationConfig,
    goToSuppliersProdV1,
    goToCommunicationConfigProdV1,
} from '../../store/Router/actions';
import { getSuppliersTableSettings, getSuppliersTableDefaultSettings } from '../../store/Session/selectors';
import { updateSuppliersTableSettings } from '../../store/Session/actions';
import {
    getAllProducts as getAllProductsV2,
    getSelectedProducts as getSelectedProductsV2,
} from '../../store/ProductsV2/selectors';
import {
    getAllProducts as getAllProductsV1,
    getSelectedProducts as getSelectedProductsV1,
} from '../../store/Products/selectors';
import { SupplierState } from '../../models/SupplierState';
import { ColumnDefinition, Item } from '../../components/Table/types';
import { ApplicationState } from '../../store';

var getSelectedProducts: (state: ApplicationState) => string[];
var getAllProducts: (state: ApplicationState) => { [id: string]: any };
const onlyUnique = (value: any, index: number, self: any): boolean => self.indexOf(value) === index;

const SuppliersList: React.FC = () => {
    const isFirstRun = React.useRef(true);

    const { offset } = useParams<{ offset?: string }>();
    const location = useLocation();

    const query2 = queryString.parse(location.search) as Filters;

    if (query2.Version === 'V2' || !query2.Version) {
        getSelectedProducts = getSelectedProductsV2;
        getAllProducts = getAllProductsV2;
    }
    if (query2.Version === 'V1') {
        getSelectedProducts = getSelectedProductsV1;
        getAllProducts = getAllProductsV1;
    }

    const all = useParams();

    const dispatch = useDispatch();
    const t = useTranslations();

    const allProducts = useSelector(getAllProducts) || {};
    const selectedProductsIds = useSelector(getSelectedProducts) || [];

    const allSuppliers = useSelector(getSuppliers) || [];
    const suppliersResults = useSelector(getSearchResultSuppliers) || [];
    const selectedSuppliersIds = useSelector(getSelectedSuppliersIds) || [];
    const selectedSuppliers = useSelector(getSelectedSuppliers) || [];
    const selectedSuppliersEmails = useSelector(getSelectedSuppliersEmails) || [];

    const total = useSelector(getSearchTotalIncludingNotLoaded) || 0;
    const isLoading = useSelector(isLoadingSuppliers);
    const tableSettings = useSelector(getSuppliersTableSettings);

    const parsedOffset = (offset && parseInt(offset)) || 0;

    const page = React.useMemo(() => Math.ceil(parsedOffset / tableSettings.pageSize), [
        parsedOffset,
        tableSettings.pageSize,
    ]);

    const mandatoryCountries = React.useMemo(
        () => selectedProductsIds.map((id) => allProducts[id].countryCode).filter(onlyUnique),
        [selectedProductsIds, allProducts],
    );

    const selectedSupliersCountries = React.useMemo(
        () => selectedSuppliersIds.map((id) => allSuppliers[id].countryCode).filter(onlyUnique),
        [selectedSuppliersIds, allSuppliers],
    );

    const countriesWithoutSupplier = React.useMemo(
        () => mandatoryCountries.filter((country) => selectedSupliersCountries.indexOf(country) === -1),
        [mandatoryCountries, selectedSupliersCountries],
    );

    const countriesWithoutProducts = React.useMemo(
        () =>
            selectedSuppliers
                .filter((supplier) => !mandatoryCountries.includes(supplier.countryCode))
                .map((supplier) => supplier.countryCode)
                .filter(onlyUnique),
        [selectedSuppliers, mandatoryCountries],
    );

    const suppliersWithoutEmailSelected = React.useMemo(
        () =>
            selectedSuppliers.filter(
                (supplier) =>
                    supplier.contacts.findIndex((contact) =>
                        selectedSuppliersEmails
                            .filter((e) => !e.isCC)
                            .map((e) => e.value)
                            .includes(contact.email),
                    ) === -1,
            ),
        [selectedSuppliers, selectedSuppliersEmails],
    );

    const errorMessage = React.useMemo(
        () =>
            countriesWithoutSupplier.length > 0
                ? t(TK.pleaseSelectSupplierForCountry, countriesWithoutSupplier[0])
                : suppliersWithoutEmailSelected.length > 0
                ? t(TK.pleaseSelectContactEmailForTheSupplier, suppliersWithoutEmailSelected[0].name)
                : selectedSuppliersEmails.findIndex((email) => !email.value?.trim().length) >= 0
                ? t(TK.pleaseMakeSureAllContactsHaveAValidEmail)
                : countriesWithoutProducts.length > 0
                ? t(TK.youAreSelectingASupplierForACountryWithoutSelectedProducts, countriesWithoutSupplier[0])
                : undefined,
        [selectedSuppliersEmails, countriesWithoutSupplier, suppliersWithoutEmailSelected, countriesWithoutProducts, t],
    );

    const supplierResultOhtersFilter = suppliersResults.filter((supplier) => {
        return !(supplier.state === SupplierState.Others && supplier.classification === 0);
    });

    const query = React.useMemo(
        () => queryString.parse(location.search) as Filters & { sortBy: string; sortType: 'asc' | 'desc' },
        // eslint-disable-next-line
        [location.search, isFirstRun.current],
    );

    React.useEffect(() => {
        if (!isFirstRun.current) dispatch(fetchSuppliers(parsedOffset, tableSettings.pageSize, query));
    }, [dispatch, parsedOffset, tableSettings.pageSize, query]);

    React.useEffect(() => {
        selectedSuppliers
            .filter((supplier) => !mandatoryCountries.includes(supplier.countryCode))
            .forEach((supplier) => dispatch(supplierDeselected(supplier.id)));
    }, [dispatch, selectedSuppliers, mandatoryCountries]);

    const handleChangePage = React.useCallback(
        (page: number) => dispatch(goToSuppliersProdV1(page * tableSettings.pageSize)),
        // eslint-disable-next-line
        [tableSettings.pageSize],
    );

    // eslint-disable-next-line
    const handleFiltersChange = React.useCallback(
        (filters: Filters) => dispatch(goToSuppliersProdV1(undefined, filters)),
        [],
    );

    // eslint-disable-next-line
    const handleSortingChange = React.useCallback(
        (sortBy?: string, sortType?: 'asc' | 'desc') => dispatch(goToSuppliersProdV1(undefined, { sortBy, sortType })),
        [],
    );

    // eslint-disable-next-line
    const handleProceedClick = React.useCallback(
        () => dispatch(goToCommunicationConfigProdV1({ Version: query2.Version })),
        [],
    );

    // eslint-disable-next-line
    const handleItemSelectionChange = React.useCallback((id: string, selected: boolean) => {
        dispatch(selected ? supplierSelected(id) : supplierDeselected(id));
    }, []);

    const handleDeselectAll = React.useCallback(
        () => selectedSuppliersIds.forEach((supplierId) => dispatch(supplierDeselected(supplierId))),
        // eslint-disable-next-line
        [],
    );

    const handleSettingsChange = React.useCallback((settings: TableSettings): void => {
        dispatch(updateSuppliersTableSettings(settings));
        // eslint-disable-next-line
    }, []);

    const handleResetTableSettings = React.useCallback(() => {
        dispatch(updateSuppliersTableSettings(getSuppliersTableDefaultSettings()));
        // eslint-disable-next-line
    }, []);

    React.useEffect(() => {
        isFirstRun.current = false;
        handleFiltersChange({
            sortBy: query.sortBy || 'country',
            countries: query.countries ? query.countries : mandatoryCountries,
            statuses: query.statuses
                ? query.statuses
                : [SupplierState.New, SupplierState.Qualify, SupplierState.Qualified, SupplierState.Others],
        });
        // eslint-disable-next-line
    }, []);

    const idsSelected = suppliersResults.reduce((ids: string[], supplier) => {
        if (supplier.classification > 0) {
            ids.push(supplier.id);
        }
        return ids;
    }, []);

    //const sdi =useSelector(getSelectedSuppliersIds) || [];

    return (
        <Page title={t(TK.createRequestForQuote)} style={{ marginTop: '10rem' }}>
            <RFQProgress activeStep={RFQStep.SelectSuppliers} />
            <Panel title={t(TK.suppliersSelection)}>
                <SuppliersFilters initialValues={query} onChange={handleFiltersChange} />
                <Table
                    columnsDefinition={columnsArray as ColumnDefinition<Item>[]}
                    isLoading={isLoading}
                    page={page}
                    data={supplierResultOhtersFilter}
                    selectedItems={selectedSuppliersIds}
                    total={total}
                    settings={tableSettings}
                    sortBy={query.sortBy}
                    sortDirection={query.sortType}
                    onChangePage={handleChangePage}
                    onChangeItemSelection={(id, selected) => handleItemSelectionChange(id as string, selected)}
                    onChangeSettings={handleSettingsChange}
                    onResetSettings={handleResetTableSettings}
                    onChangeSorting={handleSortingChange}
                />
            </Panel>

            <Panel title={t(TK.emailsSelection)}>
                {!selectedSuppliers.length && <p>{t(TK.noSupplierSelected)}</p>}
                <List
                    items={selectedSuppliers.flatMap((s) =>
                        s.contacts.map((c) => ({
                            ...c,
                            id: c.email,
                            supplier: s,
                            isSelected: !!selectedSuppliersEmails.find((e) => e.value === c.email),
                            isCc: !!selectedSuppliersEmails.find((e) => e.value === c.email)?.isCC,
                        })),
                    )}
                    renderName={(p: Contact & { supplier: Supplier }) => (
                        <span>
                            {columns.country.renderTableCell && columns.country.renderTableCell(p.supplier, t)} -{' '}
                            {p.supplier.name} - {p.name}
                            {p.isStared && <StarIcon />}
                        </span>
                    )}
                    renderSummary={(p: Contact) => `(${p.email})`}
                    renderActions={(p: Contact & { isCc: boolean }) => (
                        <span>
                            CC:
                            <Checkbox
                                checked={p.isCc}
                                onChange={() => dispatch(supplierContactSelected(p.email, !p.isCc))}
                            />
                        </span>
                    )}
                    onItemSelected={(p: Contact) => dispatch(supplierContactSelected(p.email, false))}
                    onItemDeselected={(p: Contact) => dispatch(supplierContactDeselected(p.email))}
                />
                {!!selectedSuppliers.length && <Button onClick={handleDeselectAll}>{t(TK.deselectAll)}</Button>}
            </Panel>
            <PanelButtonsContainer>
                {errorMessage && <Typography color="error">{errorMessage}</Typography>}
                <Button
                    disabled={!!errorMessage}
                    variant="contained"
                    color="primary"
                    endIcon={<NavigateNextIcon />}
                    onClick={() => handleProceedClick()}
                >
                    {t(TK.proceedToEmailConfiguration)}
                </Button>
            </PanelButtonsContainer>
        </Page>
    );
};

export default SuppliersList;
