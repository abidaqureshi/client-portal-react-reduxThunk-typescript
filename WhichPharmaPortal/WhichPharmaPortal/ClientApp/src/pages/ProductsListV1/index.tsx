import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import {
    isLoadingProducts,
    getSearchTotalIncludingNotLoaded,
    getSearchResult,
    getSelectedProducts,
    getAllProducts,
} from '../../store/Products/selectors';
import { fetchProducts, productSelected, productDeselected } from '../../store/Products/actions';
import { columnsArray } from './columns';
import ProductsFilters from './ProductsFilters';
import { Filters } from './ProductsFilters/types';
import { TK } from '../../store/Translations/translationKeys';
import { useTranslations } from '../../store/Translations/hooks';
import { Button } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Panel, { PanelButtonsContainer } from '../../components/Panel';
import queryString from 'query-string';
import List from '../../components/List';
import { ProductV1 } from '../../models/ProductV1';
import { goToProductsV1, goToSuppliers } from '../../store/Router/actions';
import Table, { TableSettings } from '../../components/Table';
import { getProductsTableSettings, getProductsTableDefaultSettings } from '../../store/Session/selectors';
import { updateProductsTableSettings } from '../../store/Session/actions';
import Page from '../../components/Page';
import { ColumnDefinition, Item } from '../../components/Table/types';
import { AppContext } from '../../app/App';
import { AppContextType } from '../../context/@types/types';

const ProductsList: React.FC = () => {
    const { setHeaderName } = React.useContext(AppContext) as AppContextType;
    const { offset } = useParams<{ offset?: string }>();
    const location = useLocation();

    const dispatch = useDispatch();
    const t = useTranslations();

    const isFirstRun = React.useRef(true);

    const query = React.useMemo(() => {
        var query = queryString.parse(location.search);
        return {
            ...query,
            sortBy: query.sortBy || 'country',
        } as Filters & { sortBy: string; sortType: 'asc' | 'desc' };
        // eslint-disable-next-line
    }, [location.search]);

    const allProducts = useSelector(getAllProducts) || {};
    const searchResult = useSelector(getSearchResult) || {};
    const selectedProductsIds = useSelector(getSelectedProducts) || [];
    const total = useSelector(getSearchTotalIncludingNotLoaded) || 0;
    const isLoading = useSelector(isLoadingProducts);
    const tableSettings = useSelector(getProductsTableSettings);

    const parsedOffset = (offset && parseInt(offset)) || 0;

    const [products, setProducts] = React.useState<ProductV1[]>([]);
    const [selectedProducts, setSelectedProducts] = React.useState<ProductV1[]>([]);

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

    React.useEffect(() => {
        isFirstRun.current = false;
        setHeaderName('Products' + ' ' + t(TK.v1));
    }, []);

    const page = React.useMemo(() => Math.ceil(parsedOffset / tableSettings.pageSize), [
        parsedOffset,
        tableSettings.pageSize,
    ]);

    const handleChangePage = (page: number) => dispatch(goToProductsV1(page * tableSettings.pageSize, {}));
    const handleSortingChange = (sortBy?: string, sortType?: 'asc' | 'desc') =>
        dispatch(goToProductsV1(undefined, { sortBy, sortType }));
    const handleFiltersChange = (newFilters: Filters) => dispatch(goToProductsV1(undefined, newFilters));
    const handleProceedClick = () => dispatch(goToSuppliers(undefined, { Version: 'V1' }));
    const handleItemSelectionChange = (id: string, selected: boolean) =>
        dispatch(selected ? productSelected(id) : productDeselected(id));
    const handleDeselectAll = () => selectedProductsIds.forEach((productId) => dispatch(productDeselected(productId)));
    const handleSettingsChange = (settings: TableSettings) => dispatch(updateProductsTableSettings(settings));
    const handleResetTableSettings = () => dispatch(updateProductsTableSettings(getProductsTableDefaultSettings()));

    return (
        <Page>
            <ProductsFilters isLoading={isLoading} defaultFilters={query} onChange={handleFiltersChange} />

            {!isFirstRun.current && (
                <Table
                    columnsDefinition={columnsArray as ColumnDefinition<Item>[]}
                    isLoading={isLoading}
                    page={page}
                    data={products}
                    selectedItems={selectedProductsIds}
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

            {(!isFirstRun.current || !!selectedProductsIds.length) && (
                <>
                    <Panel title={`${t(TK.selectedProducts)} (${selectedProducts.length})`}>
                        {!selectedProducts.length && <p>{t(TK.noProductSelected)}</p>}
                        <List
                            items={selectedProducts.map((p) => ({ ...p, isSelected: true }))}
                            renderDetails={(p: ProductV1): React.ReactNode[] =>
                                columnsArray
                                    .map((c) => {
                                        var value = c.getCellValue ? c.getCellValue(p) : (p as any)[c.columnName];

                                        return (
                                            value && (
                                                <div key={c.columnName}>
                                                    {t(c.labelTK)}:{' '}
                                                    {c.renderDetails
                                                        ? c.renderDetails(p, t)
                                                        : c.renderTableCell
                                                        ? c.renderTableCell(p, t)
                                                        : value}
                                                </div>
                                            )
                                        );
                                    })
                                    .filter((c) => c)
                            }
                            renderName={(p: ProductV1): string => p.name}
                            renderSummary={(p: ProductV1): string =>
                                `(${[p.atc, p.drugForm, p.strength, p.package].filter((x) => x).join(' - ')})`
                            }
                            onItemDeselected={(p: ProductV1) => dispatch(productDeselected(p.id))}
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
        </Page>
    );
};

export default ProductsList;
