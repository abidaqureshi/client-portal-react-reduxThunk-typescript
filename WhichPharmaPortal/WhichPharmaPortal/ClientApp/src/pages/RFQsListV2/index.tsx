import React, { useCallback, useMemo } from 'react';
import Page from '../../components/Page';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import AddIcon from '@material-ui/icons/AddCircle';
import CreateIcon from '@material-ui/icons/Create';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {
    Tooltip,
    Typography,
    Badge,
    Button,
    TableContainer,
    makeStyles,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Link,
    IconButton,
    Box,
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { getRFQSummaries, isLoadingRFQs, getRFQDetails, getRFQSearchTotal } from '../../store/RFQs/selectors';
import List from '../../components/List';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import MailIcon from '@material-ui/icons/Mail';
import { RFQState } from '../../models/RFQState';
import { PaginationContainer, RFQItemActionsPanel, StateLabel } from './styled';
import { fetchRFQs, fetchRFQsV2, submitRFQDueDateAndReminder, submitRFQStateReason } from '../../store/RFQs/actions';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import { RFQEntryState } from '../../models/RFQEntryState';
import { RFQSummary } from '../../models/RFQSummary';
import { RFQDetails } from '../../models/RFQDetails';
import CountryFlag from '../../components/CountryFlag';
import { goToProducts, goToRFQsListV2, goToRFQDetailsV2 } from '../../store/Router/actions';

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
import UserAvatar from '../../components/UserAvatar';
import DueDateReminder from './DueDateReminder';
import { RFQQuoteChip } from '../../components/RFQQuoteAvatar';
import { RFQStateChip } from '../../components/RFQStateChip';
import { IRfqProps, RfqsFilters } from './interface';
import ReasonDialog from './ReasonDialog';
import { RFQRightPanel } from './RFQRightPanel';
import { KanbanFilters } from '../SupplierReplyFormNew/Filters';
import { IFilterMembers } from '../../models/RFQQuote';
import { dueDateFilterList } from '../../utils/dueDateFilters';
import { usersFilterList } from '../../utils/usersFilter';

const pageSize = 20;

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    tableHeading: {
        backgroundColor: '#00c4aa',
        color: '#ffffff',
        fontSize: 'medium',
        fontWeight: 'bold',
    },
    LinkStyle: {
        cursor: 'pointer',
    },
});

const getStateTK = (state: RFQState): TK =>
    state === RFQState.Open
        ? TK.open
        : state === RFQState.ClosedWithQuote
        ? TK.closed
        : state === RFQState.ClosedWithoutQuote
        ? TK.noQuote
        : TK.unknown;

const RFQsList: React.FC = () => {
    const { setHeaderName } = React.useContext(AppContext) as AppContextType;
    const location = useLocation();
    const filters = React.useMemo(() => queryString.parse(location.search) as RfqsFilters, [location.search]);

    const [isOpenDialog, setIsOpenDialg] = React.useState(false);
    const [isOpenRDialog, setIsOpenRDialog] = React.useState(false);
    const [members, setMembers] = React.useState<IFilterMembers[]>(usersFilterList);
    const [dueDateFilters, setDueDateFilters] = React.useState(dueDateFilterList);

    const [rfqItem, setRfqItem] = React.useState<IRfqProps>({
        id: '',
        username: '',
        number: '',
        creationDate: '',
        endingDate: '',
        title: '',
        state: RFQState.Open,
        stateChangeDate: '',
        assigneeUsername: '',
    });

    const [isShowFilters, setIsShowFilters] = React.useState(false);

    const dispatch = useDispatch();
    const t = useTranslations();

    const myUser = useSelector(getMyUser);
    const rfqSummariesTotal = useSelector(getRFQSearchTotal);
    const rfqSummaries = useSelector(getRFQSummaries) || {};
    const rfqsDetails = useSelector(getRFQDetails);
    const isLoading = useSelector(isLoadingRFQs);
    const classes = useStyles();

    React.useEffect(() => {
        dispatch(
            fetchRFQsV2(
                filters.onlyMine === 'true',
                filters.search,
                filters.expiredIn,
                filters.createdBy,
                parseInt(filters.offset || '0'),
                pageSize,
            ),
        );

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
            goToRFQsListV2({
                ...filters,
                offset: undefined,
                onlyMine: filters.onlyMine === 'true' ? undefined : 'true',
            }),
        );
    }, [dispatch, filters]);

    const onSearch = useCallback(
        (search: string) => {
            dispatch(goToRFQsListV2({ ...filters, offset: undefined, search: search?.length ? search : undefined }));
        },
        [dispatch, filters],
    );

    const goToPage = useCallback(
        (page: number) => {
            dispatch(goToRFQsListV2({ ...filters, offset: (page - 1) * pageSize }));
        },
        [dispatch, filters],
    );

    const changeDueDate = (item: IRfqProps) => {
        setIsOpenDialg(true);
        setRfqItem(item);
    };

    const onClickStateHandler = (item: IRfqProps) => {
        setRfqItem(item);
        setIsOpenRDialog(true);
    };

    const saveRDialogBox = (rfqNumber: string, reason: string, state: RFQState) => {
        const rfqState = state == RFQState.Open ? RFQState.ClosedWithoutQuote : RFQState.Open;
        dispatch(submitRFQStateReason(rfqNumber, { reason, state: rfqState }));
        setIsOpenRDialog(false);
    };

    const closeRDialogBox = () => {
        setIsOpenRDialog(false);
    };

    const closeDialogBox = () => {
        setIsOpenDialg(false);
    };

    const saveReminder = (rfqNumber: string, reminder: number, dueDate: string) => {
        dispatch(submitRFQDueDateAndReminder(rfqNumber, { reminder, dueDate }));
        console.log(rfqNumber, reminder, ' ', dueDate);
    };

    /*  
        The Due date filters needs to be test
    */
    const onHandleChangeOverDue = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const dueFiltersCopy = [...dueDateFilters];
            const index = dueFiltersCopy.findIndex((item) => item.value == parseInt(event.target.value));
            dueFiltersCopy[index].checked = event.target.checked;
            const activeFilters = dueFiltersCopy.filter((item) => item.checked).map((item) => item.value);
            if (activeFilters.length) {
                dispatch(goToRFQsListV2({ ...filters, offset: undefined, expiredIn: activeFilters.join(',') }));
            } else {
                dispatch(goToRFQsListV2({ ...filters, offset: undefined, expiredIn: undefined }));
            }

            setDueDateFilters(dueFiltersCopy);
        },
        [filters, dispatch],
    );

    const onHandleMemberFilterChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const copiedMembers = [...members];
            const index = copiedMembers.findIndex((member) => member.key === event.target.value);
            copiedMembers[index].checked = event.target.checked;
            const searchMembers = copiedMembers.filter((member) => member.checked).map((member) => member.key);

            if (searchMembers.length) {
                dispatch(goToRFQsListV2({ ...filters, offset: undefined, createdBy: searchMembers.join(',') }));
            } else {
                dispatch(goToRFQsListV2({ ...filters, offset: undefined, createdBy: undefined }));
            }

            setMembers(copiedMembers);
        },
        [filters, dispatch],
    );

    const page = useMemo(() => Math.floor(parseInt(filters.offset || '0') / pageSize) + 1, [filters.offset]);
    const totalPages = useMemo(() => Math.ceil(rfqSummariesTotal / pageSize), [rfqSummariesTotal]);

    return (
        <Page
            title={t(TK.rfqsList)}
            actionPanel={
                <PageActionPanel>
                    <Button variant="contained" color="primary" endIcon={<AddIcon />} onClick={onCreateNew}>
                        {t(TK.create)}
                    </Button>
                    <TextInput value={filters.search} onChange={onSearch} placeholder={t(TK.search)} />
                    <ToggleButton
                        size="small"
                        value="check"
                        selected={filters.onlyMine === 'true'}
                        onChange={invertOnlyMine}
                    >
                        {t(TK.onlyMine)}
                    </ToggleButton>
                    <Button
                        color="primary"
                        onClick={() => {
                            setIsShowFilters((value) => !value);
                        }}
                        variant="contained"
                    >
                        <svg
                            width="24"
                            height="24"
                            role="presentation"
                            focusable="false"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M4.61799 6C3.87461 6 3.39111 6.78231 3.72356 7.44721L3.99996 8H20L20.2763 7.44721C20.6088 6.78231 20.1253 6 19.3819 6H4.61799ZM10.8618 17.7236C10.9465 17.893 11.1196 18 11.309 18H12.6909C12.8803 18 13.0535 17.893 13.1382 17.7236L14 16H9.99996L10.8618 17.7236ZM17 13H6.99996L5.99996 11H18L17 13Z"
                                fill="currentColor"
                            ></path>
                        </svg>
                        Filters
                    </Button>
                    {isShowFilters && (
                        <KanbanFilters
                            members={members}
                            dueDateFilters={dueDateFilterList}
                            onHandleChangeOverDue={onHandleChangeOverDue}
                            onHandleMemberFilterChange={onHandleMemberFilterChange}
                            setShowFilters={setIsShowFilters}
                        />
                    )}
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
                    <TableContainer component={Paper}>
                        <Table className={classes.table} aria-label="rfq table">
                            <TableHead>
                                <TableRow>
                                    <TableCell width="230" className={classes.tableHeading}>
                                        Rfq
                                    </TableCell>
                                    <TableCell align="center" className={classes.tableHeading}>
                                        Date created
                                    </TableCell>
                                    <TableCell align="left" width="230" className={classes.tableHeading}>
                                        Countries
                                    </TableCell>
                                    <TableCell align="center" className={classes.tableHeading}>
                                        Status
                                    </TableCell>
                                    <TableCell align="left" className={classes.tableHeading}>
                                        User
                                    </TableCell>
                                    <TableCell align="center" className={classes.tableHeading}>
                                        Due date
                                    </TableCell>
                                    <TableCell align="center" className={classes.tableHeading}>
                                        Time to close
                                    </TableCell>
                                    <TableCell align="center" className={classes.tableHeading}>
                                        &nbsp;
                                    </TableCell>
                                    <TableCell align="center" className={classes.tableHeading}>
                                        Reason
                                    </TableCell>
                                    <TableCell align="left" className={classes.tableHeading}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rfqSummariesItems
                                    .sort((a, b) => (a.creationDate > b.creationDate ? -1 : 1))
                                    .map((item) => {
                                        const rfqDetail = rfqsDetails && rfqsDetails[item.number];
                                        const byCountry =
                                            rfqDetail?.suppliersDetails &&
                                            rfqDetail?.suppliersDetails.reduce<MapOf<RFQSupplierDetails[]>>(
                                                (prev, curr) => ({
                                                    ...prev,
                                                    [curr.country]: prev[curr.country]
                                                        ? [...prev[curr.country], curr]
                                                        : [curr],
                                                }),
                                                {},
                                            );
                                        return (
                                            <TableRow>
                                                <TableCell component="th" scope="row">
                                                    {item.title}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {' '}
                                                    <Typography variant="subtitle2">
                                                        {moment(item.creationDate).format(DateFormat)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="left">
                                                    {!!byCountry &&
                                                        Object.keys(byCountry).map((country) => (
                                                            <Badge
                                                                badgeContent={byCountry[country].length}
                                                                color="primary"
                                                                anchorOrigin={{
                                                                    horizontal: 'right',
                                                                    vertical: 'bottom',
                                                                }}
                                                            >
                                                                <CountryFlag
                                                                    hideName
                                                                    country={byCountry[country][0].country}
                                                                    countryCode={byCountry[country][0].countryCode}
                                                                />
                                                            </Badge>
                                                        ))}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <RFQStateChip state={item.state} size="medium" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {' '}
                                                    {!!item.username?.length && <UserAvatar username={item.username} />}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box width={140}>
                                                        {moment(item.endingDate).format(DateFormat)}
                                                        <IconButton
                                                            aria-label="create"
                                                            size="small"
                                                            onClick={() => changeDueDate(item)}
                                                        >
                                                            <CreateIcon fontSize="inherit" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {moment(item.endingDate).fromNow()}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <RFQRightPanel
                                                        rfq={item}
                                                        onClickStateHandler={onClickStateHandler}
                                                        details={rfqsDetails && rfqsDetails[item.number]}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">{item?.reason || '-'}</TableCell>
                                                <TableCell align="center">
                                                    <Link
                                                        className={classes.LinkStyle}
                                                        onClick={() => {
                                                            dispatch(goToRFQDetailsV2(item.id));
                                                        }}
                                                    >
                                                        Show details
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>

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
            <ReasonDialog
                rfqItem={rfqItem}
                isOpenRDialog={isOpenRDialog}
                saveRDialogBox={saveRDialogBox}
                closeRDialogBox={closeRDialogBox}
            />
            <DueDateReminder
                rfqItem={rfqItem}
                saveReminder={saveReminder}
                isOpenDialog={isOpenDialog}
                closeDialogBox={closeDialogBox}
            />
        </Page>
    );
};

export default RFQsList;
