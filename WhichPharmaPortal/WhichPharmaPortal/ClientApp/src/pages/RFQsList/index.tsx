import React, { useCallback, useMemo } from 'react';
import Page from '../../components/Page';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import AddIcon from '@material-ui/icons/AddCircle';
import { Tooltip, Typography, Badge, Button } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { getRFQSummaries, isLoadingRFQs, getRFQDetails, getRFQSearchTotal } from '../../store/RFQs/selectors';
import List from '../../components/List';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import MailIcon from '@material-ui/icons/Mail';
import { RFQState } from '../../models/RFQState';
import { PaginationContainer, RFQItemActionsPanel, StateLabel } from './styled';
import { fetchRFQs } from '../../store/RFQs/actions';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import { RFQEntryState } from '../../models/RFQEntryState';
import { RFQSummary } from '../../models/RFQSummary';
import { RFQDetails } from '../../models/RFQDetails';
import CountryFlag from '../../components/CountryFlag';
import { goToRFQDetails, goToProducts, goToRFQsList } from '../../store/Router/actions';
import Loading from '../../components/Loading';
import { DateFormat } from '../../components/Table/DataTypeFormatter';
import moment from 'moment';
import { MapOf } from '../../utils/Types';
import { RFQSupplierDetails } from '../../models/RFQSupplierDetails';
import { Pagination, ToggleButton } from '@material-ui/lab';
import { PageActionPanel } from '../../components/Page/styled';
import { productsDeselectAll } from '../../store/Products/actions';
import { suppliersDeselectAll } from '../../store/Suppliers/actions';
import { getMyUser } from '../../store/Users/selectors';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import TextInput from '../../components/inputs/TextInput';
import { AppContext } from '../../app/App';
import { AppContextType } from '../../context/@types/types';

const getStateTK = (state: RFQState): TK =>
    state === RFQState.Open
        ? TK.open
        : state === RFQState.ClosedWithQuote
        ? TK.closed
        : state === RFQState.ClosedWithoutQuote
        ? TK.noQuote
        : TK.unknown;

const RFQLeftPanel: React.FC<{
    rfq: RFQSummary;
    details?: RFQDetails;
}> = ({ rfq, details }) => {
    const byCountry =
        details?.suppliersDetails &&
        details?.suppliersDetails.reduce<MapOf<RFQSupplierDetails[]>>(
            (prev, curr) => ({ ...prev, [curr.country]: prev[curr.country] ? [...prev[curr.country], curr] : [curr] }),
            {},
        );

    return (
        <div>
            <Typography>
                <b>{rfq.title}</b>
            </Typography>
            <Typography variant="subtitle2">{moment(rfq.creationDate).format(DateFormat)}</Typography>
            <div>
                {!!byCountry &&
                    Object.keys(byCountry).map((country) => (
                        <Badge
                            badgeContent={byCountry[country].length}
                            color="primary"
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <CountryFlag
                                hideName
                                country={byCountry[country][0].country}
                                countryCode={byCountry[country][0].countryCode}
                            />
                        </Badge>
                    ))}
            </div>
        </div>
    );
};

const RFQRightPanel: React.FC<{
    rfq: RFQSummary;
    details?: RFQDetails;
}> = ({ rfq, details }) => {
    const t = useTranslations();

    var unread = React.useMemo(
        () => details?.suppliersDetails?.reduce((prev, curr) => prev + curr.unreadMessages, 0) || 0,
        [details],
    );
    var waiting = React.useMemo(
        () =>
            details?.suppliersDetails?.reduce(
                (prev, curr) => prev + (curr.state === RFQEntryState.SupplierWaitingReply ? 1 : 0),
                0,
            ) || 0,
        [details],
    );
    var closed = React.useMemo(
        () =>
            details?.suppliersDetails?.reduce(
                (prev, curr) => prev + (curr.state === RFQEntryState.Closed ? 1 : 0),
                0,
            ) || 0,
        [details],
    );
    var open = React.useMemo(() => (details?.suppliersDetails ? details.suppliersDetails.length - closed : 0), [
        details,
        closed,
    ]);

    return (
        <RFQItemActionsPanel>
            {!!unread && (
                <Tooltip title={t(TK.unviewedReplies)}>
                    <Badge badgeContent={unread} color="error">
                        <MailIcon />
                    </Badge>
                </Tooltip>
            )}
            {!!waiting && (
                <Tooltip title={t(TK.supplierWaitingReply)}>
                    <Badge badgeContent={waiting} color="error">
                        <HourglassFullIcon />
                    </Badge>
                </Tooltip>
            )}
            <Tooltip title={t(TK.openQuotes)}>
                <Badge badgeContent={open || '...'}>
                    <AssignmentLateIcon />
                </Badge>
            </Tooltip>
            <Tooltip title={t(TK.closedQuotes)}>
                <Badge badgeContent={closed.toString()}>
                    <AssignmentTurnedInIcon />
                </Badge>
            </Tooltip>
            <StateLabel $rfqState={rfq.state}>{t(getStateTK(rfq.state))}</StateLabel>
        </RFQItemActionsPanel>
    );
};

interface RfqsFilters {
    search?: string;
    createdBy?: string;
    expiredIn?: string;
    offset?: string;
    onlyMine?: string;
}

const pageSize = 20;

const RFQsList: React.FC = () => {
    const { setHeaderName } = React.useContext(AppContext) as AppContextType;
    const location = useLocation();
    const filters = React.useMemo(() => queryString.parse(location.search) as RfqsFilters, [location.search]);

    const dispatch = useDispatch();
    const t = useTranslations();

    const myUser = useSelector(getMyUser);
    const rfqSummariesTotal = useSelector(getRFQSearchTotal);
    const rfqSummaries = useSelector(getRFQSummaries) || {};
    const rfqsDetails = useSelector(getRFQDetails);
    const isLoading = useSelector(isLoadingRFQs);

    React.useEffect(() => {
        dispatch(fetchRFQs(filters.onlyMine === 'true', filters.search, filters.createdBy, filters.expiredIn, parseInt(filters.offset || '0'), pageSize));
        setHeaderName(t(TK.rfqsList));
        // eslint-disable-next-line
    }, [filters]);

    const onCreateNew = React.useCallback(() => {
        dispatch(productsDeselectAll());
        dispatch(suppliersDeselectAll());
        dispatch(goToProducts());
    }, [dispatch]);

    const rfqSummariesItems = React.useMemo(
        () =>
            Object.values(rfqSummaries)
                .filter((rfq) => !filters.onlyMine || rfq.assigneeUsername === myUser?.username)
                .map((rfq) => ({ ...rfq, id: rfq.number, username: rfq.assigneeUsername })),
        [rfqSummaries, filters.onlyMine, myUser],
    );

    const invertOnlyMine = useCallback(() => {
        dispatch(
            goToRFQsList({ ...filters, offset: undefined, onlyMine: filters.onlyMine === 'true' ? undefined : 'true' }),
        );
    }, [dispatch, filters]);

    const onSearch = useCallback(
        (search: string) => {
            dispatch(goToRFQsList({ ...filters, offset: undefined, search: search?.length ? search : undefined }));
        },
        [dispatch, filters],
    );

    const goToPage = useCallback(
        (page: number) => {
            dispatch(goToRFQsList({ ...filters, offset: (page - 1) * pageSize }));
        },
        [dispatch, filters],
    );

    const page = useMemo(() => Math.floor(parseInt(filters.offset || '0') / pageSize) + 1, [filters.offset]);
    const totalPages = useMemo(() => Math.ceil(rfqSummariesTotal / pageSize), [rfqSummariesTotal]);

    return (
        <Page
            title={t(TK.rfqsList)}
            actionPanel={
                <PageActionPanel>
                    <TextInput value={filters.search} onChange={onSearch} placeholder={t(TK.search)} />
                    <ToggleButton
                        size="small"
                        value="check"
                        selected={filters.onlyMine === 'true'}
                        onChange={invertOnlyMine}
                    >
                        {t(TK.onlyMine)}
                    </ToggleButton>
                    <Button variant="contained" color="primary" endIcon={<AddIcon />} onClick={onCreateNew}>
                        {t(TK.create)}
                    </Button>
                </PageActionPanel>
            }
            style={{ marginTop: '10rem' }}
        >
            <Loading isLoading={isLoading} />
            {!Object.keys(rfqSummaries).length ? (
                isLoading ? (
                    t(TK.loading)
                ) : (
                    t(TK.noResults)
                )
            ) : (
                <>
                    {totalPages > 1 && (
                        <PaginationContainer>
                            <Pagination
                                showFirstButton
                                showLastButton
                                page={page}
                                count={totalPages}
                                color="primary"
                                onChange={(_, page) => goToPage(page)}
                            />
                        </PaginationContainer>
                    )}
                    <List
                        items={rfqSummariesItems.sort((a, b) => (a.creationDate > b.creationDate ? -1 : 1))}
                        renderName={(rfq): React.ReactNode => (
                            <RFQLeftPanel rfq={rfq} details={rfqsDetails && rfqsDetails[rfq.number]} />
                        )}
                        renderActions={(rfq): React.ReactNode => (
                            <RFQRightPanel rfq={rfq} details={rfqsDetails && rfqsDetails[rfq.number]} />
                        )}
                        onItemClick={(rfq) => dispatch(goToRFQDetails(rfq.id))}
                    />
                    {totalPages > 1 && (
                        <PaginationContainer>
                            <Pagination
                                showFirstButton
                                showLastButton
                                page={page}
                                count={totalPages}
                                color="primary"
                                onChange={(_, page) => goToPage(page)}
                            />
                        </PaginationContainer>
                    )}
                </>
            )}
        </Page>
    );
};

export default RFQsList;
