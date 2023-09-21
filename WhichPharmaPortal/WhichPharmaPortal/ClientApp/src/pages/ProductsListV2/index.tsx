import React, { useRef } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import {
    isLoadingProducts,
    getSearchTotalIncludingNotLoaded,
    getSearchResult,
    getSelectedProducts,
    getAllProducts,
} from '../../store/ProductsV2/selectors';
import { fetchProducts, productSelected, productDeselected } from '../../store/ProductsV2/actions';
import { columnsArray, renders } from './columns';
import ProductsFilters from './ProductsFilters';
import { Filters } from './ProductsFilters/types';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Panel, { PanelButtonsContainer } from '../../components/Panel';
import queryString from 'query-string';
import List from '../../components/List';
import { ProductV2 } from '../../models/ProductV2';
import { goToProductsV2, goToSuppliers } from '../../store/Router/actions';
import Table, { TableSettings } from '../../components/Table';
import { getProductsV2TableSettings, getProductsV2TableDefaultSettings } from '../../store/Session/selectors';
import { updateProductsV2TableSettings } from '../../store/Session/actions';
import Page from '../../components/Page';
import { ColumnDefinition, Item } from '../../components/Table/types';
import ProductDetails from '../../components/ProductDetails';
import { goBack } from 'react-router-redux';
import ProductContect from '../../components/ProductDetailsV2';
import { margin, padding } from 'polished';
import { AppContext } from '../../app/App';
import { AppContextType } from '../../context/@types/types';

const ProductsList: React.FC = () => {
    const { offset } = useParams<{ offset?: string }>();
    const location = useLocation();
    const { setHeaderName } = React.useContext(AppContext) as AppContextType;
    const dispatch = useDispatch();
    const t = useTranslations();

    const isFirstRun = React.useRef(true);

    const query = React.useMemo(() => {
        var query =
            isFirstRun && !location.search.length
                ? { isAuthorised: 'yes', isMarketed: ['yes', 'unknown'], sortBy: 'country' }
                : queryString.parse(location.search);
        return query as Filters & { sortBy: string; sortType?: 'asc' | 'desc' };
        // eslint-disable-next-line
    }, [location.search]);

    const bottomRef = useRef<HTMLDivElement>(null);

    const allProducts = useSelector(getAllProducts) || {};
    const searchResult = useSelector(getSearchResult) || {};
    const selectedProductsIds = useSelector(getSelectedProducts) || [];
    const total = useSelector(getSearchTotalIncludingNotLoaded) || 0;
    const isLoading = useSelector(isLoadingProducts);
    const tableSettings = useSelector(getProductsV2TableSettings);

    const parsedOffset = (offset && parseInt(offset)) || 0;

    const [products, setProducts] = React.useState<ProductV2[]>([]);
    const [selectedProducts, setSelectedProducts] = React.useState<ProductV2[]>([]);
    const [lastProductOpen, setLastProductOpen] = React.useState<ProductV2 | null>(null); // Used only for dialog fade effect

    React.useMemo(
        () => setProducts(searchResult.map((id) => allProducts[id])),
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
    const tttt = columnsArray as ColumnDefinition<Item>[];

    React.useEffect(() => {
        isFirstRun.current = false;
        setHeaderName(t(TK.products) + ' ' + t(TK.v2));
    }, []);

    const page = React.useMemo(() => Math.ceil(parsedOffset / tableSettings.pageSize), [
        parsedOffset,
        tableSettings.pageSize,
    ]);

    const productOpen = React.useMemo(
        () => (location.hash?.length > 1 ? allProducts[location.hash.substring(1)] : null),
        [location, allProducts],
    );

    const handleChangePage = React.useCallback(
        (page: number) => dispatch(goToProductsV2(page * tableSettings.pageSize, {})),
        [dispatch, tableSettings],
    );

    const handleSortingChange = React.useCallback(
        (sortBy?: string, sortType?: 'asc' | 'desc') => dispatch(goToProductsV2(undefined, { sortBy, sortType })),
        [dispatch],
    );

    const handleFiltersChange = React.useCallback(
        (newFilters: Filters) => dispatch(goToProductsV2(undefined, newFilters)),
        [dispatch],
    );

    const handleProceedClick = React.useCallback(() => dispatch(goToSuppliers(undefined, { Version: 'V2' })), [
        dispatch,
    ]);

    const handleItemSelectionChange = React.useCallback(
        (id: string, selected: boolean) => dispatch(selected ? productSelected(id) : productDeselected(id)),
        [dispatch],
    );

    const handleDeselectAll = React.useCallback(
        () => selectedProductsIds.forEach((productId) => dispatch(productDeselected(productId))),
        [dispatch, selectedProductsIds],
    );

    const handleSettingsChange = React.useCallback(
        (settings: TableSettings) => dispatch(updateProductsV2TableSettings(settings)),
        [dispatch],
    );

    const handleResetTableSettings = React.useCallback(
        () => dispatch(updateProductsV2TableSettings(getProductsV2TableDefaultSettings())),
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

    return (
        <Page title={`${t(TK.products)} (${t(TK.new)})`}>
            <Dialog open={!!productOpen} onClose={handleDialogClose} maxWidth={'xl'} fullWidth={true}>
                <DialogTitle style={{ padding: 0 }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            backgroundColor: '#b7e1cd',
                            padding: '16px 24px 8px',
                            width: '100%',
                        }}
                    >
                        <ReactCountryFlag
                            style={{ height: 95, width: 130 }}
                            svg
                            countryCode={productOpen?.countryCode}
                        />
                        <Typography style={{ paddingLeft: '16px' }} variant="h3">
                            {productOpen?.originalName || productOpen?.name}
                        </Typography>
                    </div>
                    <hr style={{ margin: 0 }} />
                </DialogTitle>
                <DialogContent style={{ width: '100%' }}>
                    <ProductContect product={productOpen as ProductV2}> </ProductContect>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSelectProductOpen} color="primary" variant="contained">
                        {t(TK.createRequestForQuote)}
                    </Button>
                    <Button onClick={handleDialogClose} color="secondary" autoFocus variant="outlined">
                        {t(TK.close)}
                    </Button>
                </DialogActions>
            </Dialog>

            <ProductsFilters isLoading={isLoading} defaultFilters={query} onChange={handleFiltersChange} />

            {!isFirstRun.current && (
                <Table
                    columnsDefinition={columnsArray as ColumnDefinition<Item>[]}
                    isLoading={isLoading}
                    page={page}
                    data={products}
                    selectedItems={selectedProductsIds}
                    hideSelectionColumn={false}
                    total={total}
                    settings={tableSettings}
                    sortBy={query.sortBy}
                    sortDirection={query.sortType}
                    exportFileName={'Products'}
                    onChangePage={handleChangePage}
                    onChangeItemSelection={(id, selected) => handleItemSelectionChange(id as string, selected)}
                    onChangeSettings={handleSettingsChange}
                    onChangeSorting={handleSortingChange}
                    onResetSettings={handleResetTableSettings}
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
