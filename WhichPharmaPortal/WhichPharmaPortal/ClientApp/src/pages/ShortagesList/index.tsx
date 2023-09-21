import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import { columnsArray } from './columns';
import { Shortage } from '../../models/Shortage';
import { goToShortages } from '../../store/Router/actions';
import Table, { TableSettings } from '../../components/Table';
import { getShortagesTableSettings, getShortagesTableDefaultSettings } from '../../store/Session/selectors';
import { updateShortagesTableSettings } from '../../store/Session/actions';
import {
    getAllShortages,
    getSearchResult,
    getSearchTotalIncludingNotLoaded,
    isLoadingShortages,
} from '../../store/Shortages/selectors';
import { fetchShortages } from '../../store/Shortages/actions';
import Page from '../../components/Page';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import queryString from 'query-string';
import { Filters } from './ShortagesFilters/types';
import ShortagesFilters from './ShortagesFilters';
import { Item, ColumnDefinition } from '../../components/Table/types';
import { AppContext } from '../../app/App';
import { AppContextType } from '../../context/@types/types';

const ShortagesList: React.FC = () => {
    const { setHeaderName } = React.useContext(AppContext) as AppContextType;
    const { offset } = useParams<{ offset?: string }>();
    const location = useLocation();

    const t = useTranslations();
    const dispatch = useDispatch();

    const allShortages = useSelector(getAllShortages) || {};
    const searchResult = useSelector(getSearchResult) || {};
    const total = useSelector(getSearchTotalIncludingNotLoaded) || 0;
    const isLoading = useSelector(isLoadingShortages);
    const tableSettings = useSelector(getShortagesTableSettings);

    const filters = queryString.parse(location.search) as Filters;

    const parsedOffset = (offset && parseInt(offset)) || 0;

    const [products, setShortages] = React.useState<Shortage[]>([]);

    React.useMemo(
        () => setShortages(searchResult.map((id) => allShortages[id])),
        // eslint-disable-next-line
        [searchResult],
    );

    React.useEffect(() => {
        setHeaderName(t(TK.shortages));
    }, []);

    const page = React.useMemo(() => Math.ceil(parsedOffset / tableSettings.pageSize), [
        parsedOffset,
        tableSettings.pageSize,
    ]);

    const handleChangePage = React.useCallback(
        (page: number): void => {
            dispatch(goToShortages(page * tableSettings.pageSize));
            // eslint-disable-next-line
        },
        [tableSettings.pageSize],
    );

    const handleSettingsChange = React.useCallback((settings: TableSettings): void => {
        dispatch(updateShortagesTableSettings(settings));
        // eslint-disable-next-line
    }, []);

    const handleResetTableSettings = React.useCallback(() => {
        dispatch(updateShortagesTableSettings(getShortagesTableDefaultSettings()));
        // eslint-disable-next-line
    }, []);

    React.useMemo(
        () => dispatch(fetchShortages(parsedOffset, tableSettings.pageSize, filters)),
        // eslint-disable-next-line
        [parsedOffset, tableSettings.pageSize, location.search],
    );

    const handleFiltersChange = (filters: Filters): void => {
        dispatch(goToShortages(undefined, filters));
    };

    return (
        <Page title={t(TK.shortages)}>
            <ShortagesFilters isLoading={isLoading} defaultFilters={filters} onChange={handleFiltersChange} />
            <Table
                columnsDefinition={columnsArray as ColumnDefinition<Item>[]}
                isLoading={isLoading}
                page={page}
                data={products}
                total={total}
                settings={tableSettings}
                exportFileName={'Shortages'}
                onChangePage={handleChangePage}
                onChangeSettings={handleSettingsChange}
                onResetSettings={handleResetTableSettings}
            />
        </Page>
    );
};

export default ShortagesList;
