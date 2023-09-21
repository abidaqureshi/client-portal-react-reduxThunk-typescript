//ProductList version v2
import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

import {
    isLoadingProducts,
    getSearchTotalIncludingNotLoaded,
    getSearchResult,
    getSelectedProducts,
    getAllProducts,
    getRequestTimeInSeconds,
} from '../../store/ProductsV2/selectors';
import { fetchProducts, productSelected, productDeselected } from '../../store/ProductsV2/actions';
import { columnsArray } from './columns';
import ProductsFilters from './ProductsFilters';
import { Filters } from './ProductsFilters/types';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import { Button } from '@material-ui/core';
import queryString from 'query-string';
import { ProductV2 } from '../../models/ProductV2';
import { goToProducts, goToProductsProdV1, goToSuppliers, goToSuppliersProdV1 } from '../../store/Router/actions';
import Table from '../../components/AGTable';
import { getProductsV2TableSettings } from '../../store/Session/selectors';
import Page from '../../components/Page';
import { goBack } from 'react-router-redux';
import { ColDef, ColGroupDef, RowSelectedEvent, IsExternalFilterPresentParams } from 'ag-grid-community';
import { AppContext } from '../../app/App';
import { AppContextType } from '../../context/@types/types';
import Panel, { PanelButtonsContainer } from '../../components/Panel';
import List from '../../components/ListV1';
import ProductDetails from '../../components/ProductDetails';
import { renders } from '../ProductsListV2/columns';
import appSettings from '../../appSettings';
import { useUrl } from '../../utils/hooks/url';
import { ProductDetailDialog } from '../../components/ProductDialog';

const ProductsList: React.FC = () => {
    const { setHeaderName } = React.useContext(AppContext) as AppContextType;
    const { offset } = useParams<{ offset?: string }>();
    const location = useLocation();

    const path = useUrl();
    const dispatch = useDispatch();
    const t = useTranslations();

    const isFirstRun = React.useRef(true);

    const bottomRef = useRef<HTMLDivElement>(null);

    const allProducts = useSelector(getAllProducts) || {};
    const searchResult = useSelector(getSearchResult) || {};

    let selectedProductsIds = useSelector(getSelectedProducts) || [];
    const total = useSelector(getSearchTotalIncludingNotLoaded) || 0;
    const timeInSeconds = useSelector(getRequestTimeInSeconds) || 0;
    const isLoading = useSelector(isLoadingProducts);
    const tableSettings = useSelector(getProductsV2TableSettings);

    const parsedOffset = (offset && parseInt(offset)) || 0;

    const [isDisableSwitch, setIsDisableSwitch] = React.useState<boolean>(false);
    const [isHideNotCommercial, setIsHideNotCommercial] = React.useState<boolean>(true);
    const [products, setProducts] = React.useState<ProductV2[]>([]);
    const [selectedProducts, setSelectedProducts] = React.useState<ProductV2[]>([]);
    const [lastProductOpen, setLastProductOpen] = React.useState<ProductV2 | null>(null); // Used only for dialog fade effect
    const [totalRecords, setTotalRecords] = React.useState<number>(total);

    const searchColumns: string[] = [
        'name',
        'activeSubstances',
        'pharmaceuticalFormCategories',
        'strength',
        'package',
        'atc',
        'maHolder',
    ];

    const handleDeselectAll = React.useCallback(
        () => selectedProductsIds.forEach((productId) => dispatch(productDeselected(productId))),
        [dispatch, selectedProductsIds],
    );

    React.useEffect(() => {
        setTimeout(() => {
            if (window.localStorage.getItem('queryString')) {
                setProducts(searchResult.map((id) => allProducts[id]));
                window?.localStorage.removeItem('queryString');
            }
        }, 1000);
    }, []);

    React.useEffect(() => {
        setIsDisableSwitch(false);
    }, [products, setIsDisableSwitch, isDisableSwitch]);

    const query = React.useMemo(() => {
        let query =
            isFirstRun && !location.search.length
                ? {} //{ isAuthorised: 'yes', isMarketed: ['yes', 'unknown'], sortBy: 'country' }
                : queryString.parse(location.search);

        if (window?.location.search.includes('?')) {
            query = queryString.parse(window?.location.search);
        }

        return query as Filters & { sortBy: string; sortType?: 'asc' | 'desc' };
        // eslint-disable-next-line
    }, [location.search]);

    React.useMemo(
        () => {
            //setProducts(searchResult.map((id) => allProducts[id]));

            if (!window.location.search.includes('?')) {
                setProducts([]);
                handleDeselectAll();
            } else {
                if (isHideNotCommercial) {
                    const commercialItems = searchResult
                        .map((id) => allProducts[id])
                        .filter((item) => {
                            if (item.isAuthorised !== false && item.isMarketed !== false) {
                                return true;
                            }
                        });
                    setProducts(commercialItems);
                    setTotalRecords(commercialItems.length);
                } else {
                    const itemsList = searchResult.map((id) => allProducts[id]);
                    setProducts(itemsList);
                    setTotalRecords(itemsList.length);
                }
            }
        },
        // eslint-disable-next-line
        [searchResult],
    );

    React.useMemo(
        () => setSelectedProducts(selectedProductsIds.map((id) => allProducts[id])),
        // eslint-disable-next-line
        [selectedProductsIds],
    );

    React.useMemo(
        () => {
            if (!isFirstRun.current || location.search?.length) {
                dispatch(fetchProducts(parsedOffset, tableSettings.pageSize, query));
            }
        },
        // eslint-disable-next-line
        [parsedOffset, tableSettings.pageSize, query],
    );

    React.useEffect(() => {
        isFirstRun.current = false;

        const headerText =
            path.includes(appSettings.developmentUrl + '/products-prov1/') ||
            path.includes(appSettings.localDevelopmentUrl + '/products-prov1/') ||
            path.includes(appSettings.localDevelopmentUrl) ||
            path.includes(appSettings.developmentUrl)
                ? t(TK.productsProdV1)
                : t(TK.products);

        setHeaderName(headerText);
    }, [setHeaderName, path, t]);

    const productOpen = React.useMemo(
        () => (location.hash?.length > 1 ? allProducts[location.hash.substring(1)] : null),
        [location, allProducts],
    );

    const handleFiltersChange = React.useCallback(
        (newFilters: Filters) => {
            if (Object.keys(newFilters).length === 0) {
                setProducts([]);
                handleDeselectAll();
            }

            dispatch(goToProductsProdV1(undefined, newFilters));
        },
        [dispatch, setProducts],
    );

    const hideNonCommercialItems = React.useCallback(
        (isActive: boolean) => {
            let itemsList: ProductV2[] = [];
            if (isActive && products.length > 0) {
                //Collect commercial items
                itemsList = searchResult
                    .map((id) => allProducts[id])
                    .filter((item) => {
                        if (item.isAuthorised !== false && item.isMarketed !== false) {
                            return true;
                        }
                    });
                setProducts(itemsList);
                setTotalRecords(itemsList.length);
            } else {
                //Show all items
                itemsList = searchResult.map((id) => allProducts[id]);
                setProducts(itemsList);
                setTotalRecords(itemsList.length);
            }
            setIsHideNotCommercial(isActive);
        },
        [products, setProducts, setIsHideNotCommercial],
    );

    const handleProceedClick = React.useCallback(() => {
        window?.localStorage.setItem('queryString', window?.location.search);
        return dispatch(goToSuppliersProdV1());
    }, [dispatch]);

    const handleItemSelectionChange = React.useCallback(
        (id: string, selected: boolean) => dispatch(selected ? productSelected(id) : productDeselected(id)),
        [dispatch],
    );

    const handleDialogClose = React.useCallback(() => {
        setLastProductOpen(productOpen);
        dispatch(goBack());
    }, [dispatch, setLastProductOpen, productOpen]);

    const handleSelectProductOpen = React.useCallback(() => {
        productOpen && handleItemSelectionChange(productOpen.id, true);
        handleDialogClose();
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    }, [handleDialogClose, handleItemSelectionChange, productOpen]);

    const defaultColDef = React.useMemo(
        () => ({
            sortable: true,
            wrapHeaderText: true,
            resizable: false,
            autoHeaderHeight: true,
            suppressMovable: true,
        }),
        [],
    );

    return (
        <Page>
            <ProductDetailDialog
                productOpen={productOpen}
                handleSelectProductOpen={handleSelectProductOpen}
                handleDialogClose={handleDialogClose}
            />
            <ProductsFilters
                isLoading={isLoading}
                hideNonCommercialItems={hideNonCommercialItems}
                setIsDisableSwitch={setIsDisableSwitch}
                isDisableSwitch={isDisableSwitch}
                defaultFilters={query}
                onChange={handleFiltersChange}
            />

            {!isFirstRun.current && (
                <Table
                    columnsDefinition={columnsArray as ColDef[] | ColGroupDef[]}
                    isLoading={isLoading}
                    total={totalRecords}
                    timeInSeconds={timeInSeconds}
                    enablePagination={true}
                    captionAnalytics={TK.TotalResult}
                    defaultColDef={defaultColDef}
                    searchColumns={searchColumns}
                    isExportable={false}
                    pageSize={10}
                    data={products}
                    rowSelection="multiple"
                    onRowSelected={(event: RowSelectedEvent) => {
                        const {
                            node: {
                                data: { id: productId },
                            },
                        } = event;

                        handleItemSelectionChange(productId as string, !!event.node.isSelected());
                    }}
                />
            )}
            {!!selectedProductsIds.length && (
                <>
                    <Panel title={`${t(TK.selectedProducts)} (${selectedProducts.length})`}>
                        {!selectedProducts.length && <p>{t(TK.noProductSelected)}</p>}
                        <List
                            items={selectedProducts.map((p) => ({ ...p, isSelected: true }))}
                            renderDetails={(p: ProductV2): React.ReactNode => (
                                <ProductDetails product={p} renders={renders} />
                            )}
                            renderName={(p: ProductV2): string => p.name}
                            renderSummary={(p: ProductV2): string =>
                                `(${[p.atc, p.pharmaceuticalForm, p.strength, p.package].filter((x) => x).join(' - ')})`
                            }
                            onItemDeselected={(p: ProductV2) => dispatch(productDeselected(p.id))}
                        />
                        {!!selectedProducts.length && <Button onClick={handleDeselectAll}>{t(TK.deselectAll)}</Button>}
                    </Panel>

                    <PanelButtonsContainer>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<NavigateNextIcon />}
                            onClick={handleProceedClick}
                        >
                            {t(TK.proceedToRFQCreation)}
                        </Button>
                    </PanelButtonsContainer>
                </>
            )}
            <div ref={bottomRef} />
        </Page>
    );
};

export default ProductsList;
