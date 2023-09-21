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
    getProductSelectedSuppliers,
    getSelectedSuppliersByProductIds,
    getProductSelectedSupplierSelectedEmails,
} from '../../store/Suppliers/selectors';
import {
    fetchSuppliers,
    supplierSelected,
    supplierDeselected,
    supplierContactSelected,
    supplierContactSelectedV3,
    supplierContactDeselected,
    supplierContactDeselectedV3,
} from '../../store/Suppliers/actions';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Table, { TableSettings } from '../../components/Table';
import { columnsArray, columns } from './columns';
import { ProductV2 } from '../../models/ProductV2';
import SuppliersFilters from './SuppliersFilters';
import { Filters } from './SuppliersFilters/types';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import { Button, Checkbox, Typography, Tooltip } from '@material-ui/core';
import { goBack } from 'react-router-redux';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Panel, { PanelButtonsContainer } from '../../components/Panel';
import queryString from 'query-string';
import List, { Item } from '../../components/List';
import { renders } from '../ProductsListV2/columns';
import { productDeselected } from '../../store/ProductsV2/actions';
import ProductDetails from '../../components/ProductDetails';
import { Supplier } from '../../models/Supplier';
import { Contact } from '../../models/Contact';
import StarIcon from '@material-ui/icons/Star';
import RFQProgress from '../../modules/RFQProgress';
import { RFQStep } from '../../modules/RFQProgress/RFQProgress';
import Page from '../../components/Page';
import {
    goToSuppliers,
    goToCommunicationConfig,
    goToSuppliersV3,
    goToCommunicationConfigV2,
} from '../../store/Router/actions';
import { getSuppliersTableSettings, getSuppliersTableDefaultSettings } from '../../store/Session/selectors';
import { updateSuppliersTableSettings } from '../../store/Session/actions';
import {
    getAllProducts as getAllProductsV2,
    getSelectedProducts as getSelectedProductsV2,
    getOriginsByProductId,
} from '../../store/ProductsV2/selectors';
import {
    getAllProducts as getAllProductsV1,
    getSelectedProducts as getSelectedProductsV1,
} from '../../store/Products/selectors';
import { SupplierState } from '../../models/SupplierState';
import { ColumnDefinition } from '../../components/Table/types';
import { ApplicationState } from '../../store';
import { SuppliersListDialog } from '../../components/SuppliersDialog';
import Alert from '@material-ui/lab/Alert/Alert';
import ConfirmDialog from '../../components/ConfirmDialog';

var getSelectedProducts: (state: ApplicationState) => string[];
var getAllProducts: (state: ApplicationState) => { [id: string]: any };
const onlyUnique = (value: any, index: number, self: any): boolean => self.indexOf(value) === index;

const SuppliersList: React.FC = () => {
    const isFirstRun = React.useRef(true);

    const { offset } = useParams<{ offset?: string }>();
    const [verified, setVerified] = React.useState<string[]>([]);
    const [expanded, setExpanded] = React.useState<string[]>([]);
    const [isShowAlert, setIsShowAlert] = React.useState<boolean>(false);
    const [removeProdId, setRemoveProdId] = React.useState<string>('');
    const [isRemoveProd, setIsRemoveProd] = React.useState<boolean>(false);
    const location = useLocation();

    const all = useParams();

    const dispatch = useDispatch();
    const t = useTranslations();

    const query2 = queryString.parse(location.search) as Filters;

    if (query2.Version === 'V2' || !query2.Version) {
        getSelectedProducts = getSelectedProductsV2;
        getAllProducts = getAllProductsV2;
    }
    if (query2.Version === 'V1') {
        getSelectedProducts = getSelectedProductsV1;
        getAllProducts = getAllProductsV1;
    }

    const [selectedProducts, setSelectedProducts] = React.useState<ProductV2[]>([]);

    const [selectedProduct, setSelectedProduct] = React.useState<ProductV2 | null>(null);

    const [supplierDialogOpen, setSupplierDialogOpen] = React.useState<boolean>(false);

    const allProducts = useSelector(getAllProducts) || {};
    const selectedProductsIds = useSelector(getSelectedProducts) || [];
    const productOrigins = useSelector(getOriginsByProductId) || {};
    const allSuppliers = useSelector(getSuppliers) || [];
    const selectedProductSuppliers = useSelector(getProductSelectedSuppliers) || {};
    const selectedProductSuppliersEmails = useSelector(getProductSelectedSupplierSelectedEmails) || {};
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

    React.useEffect(() => {
        setVerified(verified.filter((id) => id != selectedProduct?.id));
    }, [selectedProductSuppliers, setVerified]);

    React.useMemo(
        () => setSelectedProducts(selectedProductsIds.map((id) => allProducts[id])),
        // eslint-disable-next-line
        [selectedProductsIds],
    );

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

    const getSelectedProductSuppliersCount = () => {
        let count = 0;
        selectedProductsIds.map((id) => {
            if (selectedProductSuppliers[id] && selectedProductSuppliers[id].length > 0) {
                count++;
            }
        });

        return count;
    };

    const errorMessage = React.useMemo(
        () =>
            suppliersWithoutEmailSelected.length > 0
                ? t(TK.pleaseSelectContactEmailForTheSupplier, suppliersWithoutEmailSelected[0].name)
                : selectedSuppliersEmails.findIndex((email) => !email.value?.trim().length) >= 0
                ? t(TK.pleaseMakeSureAllContactsHaveAValidEmail)
                : selectedProducts.length === getSelectedProductSuppliersCount() &&
                  verified.length !== selectedProducts.length
                ? t(TK.pleaseMakeSureVerifiedAllProducts)
                : selectedProducts.length === 0
                ? t(TK.pleaseSelectProducts)
                : undefined,
        [
            selectedSuppliersEmails,
            countriesWithoutSupplier,
            suppliersWithoutEmailSelected,
            countriesWithoutProducts,
            verified,
            t,
        ],
    );

    const query = React.useMemo(
        () => {
            return queryString.parse(location.search) as Filters & { sortBy: string; sortType: 'asc' | 'desc' };
        },
        // eslint-disable-next-line
        [location.search],
    );

    React.useEffect(() => {
        dispatch(fetchSuppliers(parsedOffset, tableSettings.pageSize, query));
    }, [dispatch, parsedOffset, tableSettings.pageSize, query]);

    // eslint-disable-next-line
    const handleFiltersChange = React.useCallback(
        (filters: Filters) => dispatch(goToSuppliersV3(undefined, filters)),
        [],
    );

    // eslint-disable-next-line
    const handleSortingChange = React.useCallback(
        (sortBy?: string, sortType?: 'asc' | 'desc') => dispatch(goToSuppliers(undefined, { sortBy, sortType })),
        [],
    );

    // eslint-disable-next-line
    const handleProceedClick = React.useCallback(
        () => dispatch(goToCommunicationConfigV2({ Version: query2.Version })),
        [],
    );

    // eslint-disable-next-line
    // const handleItemSelectionChange = React.useCallback((id: string, selected: boolean) => {
    //     dispatch(selected ? supplierSelected(id) : supplierDeselected(id));
    // }, []);

    // const handleDeselectAll = React.useCallback(
    //     () => selectedSuppliersIds.forEach((supplierId) => dispatch(supplierDeselected(supplierId))),
    //     // eslint-disable-next-line
    //     [],
    // );

    //deselect products
    const handleDeselectAllProductsSelected = React.useCallback(
        () => selectedProductsIds.forEach((productId) => dispatch(productDeselected(productId))),
        [dispatch, selectedProductsIds],
    );

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

    React.useEffect(() => {
        if (isRemoveProd) {
            dispatch(productDeselected(removeProdId));
        }
    }, [isRemoveProd, dispatch]);

    //const sdi =useSelector(getSelectedSuppliersIds) || [];

    const onSelectSupplier = (id: any) => {
        setSelectedProduct(allProducts[id]);
        setSupplierDialogOpen(true);
        setExpanded([id]);
        const currentProduct = allProducts[id];
        const updatedQuery = queryString.parse(location.search) as Filters & {
            sortBy: string;
            sortType: 'asc' | 'desc';
        };
        if (updatedQuery && currentProduct) {
            const countries: any = productOrigins[currentProduct.id] || [];
            const localSearchCountries = [currentProduct.countryCode];
            updatedQuery.countries = [...new Set([...countries, ...localSearchCountries])];
            updatedQuery.name = '';

            if (Array.isArray(updatedQuery.countries) && updatedQuery.countries.length === 1) {
                updatedQuery.countries = updatedQuery.countries[0];
            }
            dispatch(goToSuppliersV3(undefined, updatedQuery));
        }
    };

    const getUserAcknowledgement = (isAgree: boolean) => {
        setIsRemoveProd(isAgree);
        setIsShowAlert(false);
    };

    const onProductDeleteHandler = (product: ProductV2) => {
        setIsShowAlert(true);
        setIsRemoveProd(false);
        setRemoveProdId(product.id);
        //dispatch(productDeselected(product.id))
    };

    const getSuppliersByCountryCode = (product: ProductV2) => {
        let countries: any = productOrigins[product.id] || [];
        if (!countries.length) {
            countries = [product.countryCode];
        }
        const suppliersByCountryCode = selectedSuppliers.filter((s) => countries.includes(s.countryCode)) || [];

        return suppliersByCountryCode;
    };

    const getSuppliersByProductId = (product: ProductV2) => {
        let productSuppliers: any = selectedProductSuppliers[product.id] || [];

        const suppliersByProducts = selectedSuppliers.filter((s) => productSuppliers.includes(s.id)) || [];

        return suppliersByProducts;
    };

    const handleVerifyChange = React.useCallback(
        (id: string, checked: boolean) => {
            const newVerified = checked ? [...verified, id] : verified.filter((i) => i !== id);

            setVerified(newVerified);

            setExpanded(checked ? expanded.filter((i) => i !== id) : [...expanded, id]);
        },
        [setVerified, setExpanded, verified, expanded],
    );

    return (
        <Page title={t(TK.createRequestForQuote)} style={{ marginTop: '10rem' }}>
            <RFQProgress activeStep={RFQStep.SelectSuppliers} />
            <ConfirmDialog showAlert={isShowAlert} getUserAcknowledgement={getUserAcknowledgement} />
            {!!selectedProductsIds.length && (
                <Panel title={`${t(TK.selectedProducts)} (${selectedProducts.length})`}>
                    {!selectedProducts.length && <p>{t(TK.noProductSelected)}</p>}
                    {selectedProducts.length !== getSelectedProductSuppliersCount() && (
                        <Typography>
                            <Alert severity="info">
                                <strong>{TK.selectSuppliersMessage}</strong>
                            </Alert>
                        </Typography>
                    )}
                    {errorMessage && (
                        <Typography color="error">
                            <Alert severity="error">{errorMessage}</Alert>
                        </Typography>
                    )}
                    <List
                        multiple
                        defaultExpanded={expanded}
                        onExpandedChanged={(expanded) => setExpanded(expanded as string[])}
                        items={selectedProducts.map((p) => ({ ...p, isSelected: true }))}
                        listType="products"
                        selectSupplierButton={true}
                        onClickSupplierButton={(id: any) => onSelectSupplier(id)}
                        renderActions={(item) => {
                            let checkValue = false;
                            const ourSuppliers = getSuppliersByProductId(item);
                            checkValue =
                                ourSuppliers && ourSuppliers.length
                                    ? ourSuppliers.some((s) =>
                                          s.contacts.some((c) =>
                                              selectedProductSuppliersEmails[item.id].find((e) => e.value === c.email),
                                          ),
                                      )
                                    : false;
                            if (checkValue) {
                                return (
                                    <Tooltip title={t(TK.markAsValidated)}>
                                        <Checkbox
                                            checked={verified.includes(item.id)}
                                            onChange={(_, checked) => handleVerifyChange(item.id, checked)}
                                            key={item.id}
                                            icon={<CheckCircleOutlineIcon style={{ fill: 'red' }} />}
                                            checkedIcon={<CheckCircleIcon style={{ fill: 'green' }} />}
                                            name={`checked-${item.id}`}
                                        />
                                    </Tooltip>
                                );
                            } else {
                                return null;
                            }
                        }}
                        renderDetails={(product: ProductV2): React.ReactNode => {
                            return (
                                <div style={{ width: '100%' }}>
                                    <Panel title={t(TK.emailsSelection)}>
                                        {!!!selectedSuppliers.length && <p>{t(TK.noSupplierSelected)}</p>}
                                        {!!selectedSuppliers.length && (
                                            <List
                                                items={getSuppliersByProductId(product).flatMap((s) =>
                                                    s.contacts.map((c) => ({
                                                        ...c,
                                                        id: c.email,
                                                        productId: product.id,
                                                        supplier: s,
                                                        isSelected: !!selectedProductSuppliersEmails[product.id].find(
                                                            (e) => e.value === c.email,
                                                        ),
                                                        isCc: !!selectedProductSuppliersEmails[product.id].find(
                                                            (e) => e.value === c.email,
                                                        )?.isCC,
                                                    })),
                                                )}
                                                listType="suppliers"
                                                renderName={(p: Contact & { supplier: Supplier }) => (
                                                    <span>
                                                        {columns.country.renderTableCell &&
                                                            columns.country.renderTableCell(p.supplier, t)}{' '}
                                                        - {p.supplier.name} - {p.name}
                                                        {p.isStared && <StarIcon />}
                                                    </span>
                                                )}
                                                renderSummary={(p: Contact) => `(${p.email})`}
                                                renderActions={(p: Contact & { isCc: boolean }) => (
                                                    <span>
                                                        CC:
                                                        <Checkbox
                                                            checked={p.isCc}
                                                            onChange={() => {
                                                                dispatch(
                                                                    supplierContactSelectedV3(
                                                                        product.id,
                                                                        p.email,
                                                                        !p.isCc,
                                                                    ),
                                                                );
                                                            }}
                                                        />
                                                    </span>
                                                )}
                                                onItemSelected={(p: Contact) => {
                                                    dispatch(supplierContactSelectedV3(product.id, p.email, false));
                                                }}
                                                onItemDeselected={(p: Contact) =>
                                                    dispatch(supplierContactDeselectedV3(product.id, p.email))
                                                }
                                            />
                                        )}
                                    </Panel>
                                </div>
                            );
                        }}
                        renderName={(p: ProductV2): string => p.name}
                        renderSummary={(p: ProductV2): string =>
                            `(${[p.atc, p.pharmaceuticalForm, p.strength, p.package].filter((x) => x).join(' - ')})`
                        }
                        onItemDeselected={(p: ProductV2) => onProductDeleteHandler(p)}
                    />
                    {/* {!!selectedProducts.length && (
                        <Button onClick={handleDeselectAllProductsSelected}>{t(TK.deselectAll)}</Button>
                    )} */}
                </Panel>
            )}

            <PanelButtonsContainer>
                {errorMessage && (
                    <Typography color="error">
                        <Alert severity="error">{errorMessage}</Alert>
                    </Typography>
                )}

                <Button
                    disabled={!!errorMessage || selectedProducts.length !== getSelectedProductSuppliersCount()}
                    variant="contained"
                    color="primary"
                    endIcon={<NavigateNextIcon />}
                    onClick={() => handleProceedClick()}
                >
                    {t(TK.proceedToEmailConfiguration)}
                </Button>
            </PanelButtonsContainer>
            {selectedProduct && (
                <SuppliersListDialog
                    open={supplierDialogOpen}
                    productOpen={selectedProduct}
                    handleDialogClose={() => setSupplierDialogOpen(false)}
                    handleFiltersChange={handleFiltersChange}
                />
            )}
        </Page>
    );
};

export default SuppliersList;
