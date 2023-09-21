import * as React from 'react';
import Page from '../../components/Page';
import { useTranslations } from '../../store/Translations/hooks';
import { TK } from '../../store/Translations/translationKeys';
import Loading from '../../components/Loading';
import { useLocation } from 'react-router';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    FormControlLabel,
    IconButton,
    InputAdornment,
    makeStyles,
    Typography,
} from '@material-ui/core';
import TableChartTwoToneIcon from '@material-ui/icons/TableChartTwoTone';
import TocTwoToneIcon from '@material-ui/icons/TocTwoTone';

import {
    getExternalRFQsSupplierDataAsync,
    getExternalSupplierCollaboratorsAsync,
    getExternalSupplierRFQsResposiblesAsync,
    putExternalSupplierRFQsDataAsync,
} from '../../fetch/requests';
import { RFQSupplierDetails } from '../../models/RFQSupplierDetails';
import { alertGenericError, doRequestAccessLink } from '../../store/Session/actions';
import { useDispatch, useSelector } from 'react-redux';
import queryString from 'query-string';
import ReactCountryFlag from 'react-country-flag';
import SearchIcon from '@material-ui/icons/Search';
import {
    QuoteColumnTitle,
    QuotesColumn,
    ColumnsPanel,
    WhiteTypography,
    QuotesBoxesContainer,
    FiltersContainer,
} from './styled';
import { IFilterMembers, RFQQuote } from '../../models/RFQQuote';
import { RFQQuoteState } from '../../models/RFQQuoteState';
import EditQuoteForm from './EditQuoteForm';
import NewQuoteForm from './NewQuoteForm';
import { RFQQuoteInfo } from '../../models/RFQQuoteInfo';
import moment from 'moment';
import QuoteBox from './QuoteBox';
import RBPharmaIcon from '../../components/RBPharmaLogo';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { onlyUnique, reorder } from '../../utils/utils';
import { push } from 'react-router-redux';
import { MapOf } from '../../utils/Types';
import { usersUpdated } from '../../store/Users/actions';
import { isLoggingIn } from '../../store/Session/selectors';
import { Spinner } from 'reactstrap';
import FormDialog from '../../components/FormDialog';
import { useMemo } from 'react';
import QuotesTableView from './TableView';
import TextInput from '../../components/inputs/TextInput';
import { useCollaborators } from '../../store/Users/hooks';
import { PanelButtonsContainerKanban } from '../../components/Panel/styled';
import UserAvatar from '../../components/UserAvatar';
import { dueDateFilterList } from '../../utils/dueDateFilters';
import { KanbanFilters } from './Filters';

const uuidv4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const adaptReceivedQuote = (quote: RFQQuoteInfo): RFQQuoteInfo => ({
    ...quote,
    state: quote.endingDate && moment(quote.endingDate).isBefore() ? RFQQuoteState.Closed : quote.state,
});

const useStyles = makeStyles({
    btnIcon_margin: {
        marginRight: '5px',
    },
});

const SupplierReplyForm: React.FC = () => {
    const location = useLocation();
    const t = useTranslations();
    const dispatch = useDispatch();
    const users = useCollaborators();
    const classes = useStyles();
    const [loading, setLoading] = React.useState(true);
    const [showClosedColumn, setShowClosedColumn] = React.useState(true);
    const [showKanbanView, setShowKanbanView] = React.useState(true);
    const [showTableView, setShowTableView] = React.useState(false);
    const [details, setDetails] = React.useState<RFQSupplierDetails | undefined>(undefined);
    const [dataRows, setDataRows] = React.useState<RFQQuote[]>([]);
    const [members, setMembers] = React.useState<IFilterMembers[]>([]);
    const [dueDateFilters, setDueDateFilters] = React.useState(dueDateFilterList);
    const [searchResult, setSearchResult] = React.useState<RFQQuote[]>([]);
    const [responsibles, setResponsibles] = React.useState<MapOf<string>>({});
    const [opened, setOpened] = React.useState<string | undefined>(undefined);
    const [receiveEmail, setReceiveEmail] = React.useState<boolean>(true);
    const [addAlternative, setAddAlternative] = React.useState<RFQQuote | undefined>(undefined);
    const [requestAccessLink, setRequestAccessLink] = React.useState(false);
    const [searchText, setSearchText] = React.useState('');
    const [showFilters, setShowFilters] = React.useState(false);
    const [isShowOverDue, setIsShowOverDue] = React.useState(false);

    const [isConfirm, setIsConfirm] = React.useState('');

    const loggingIn = useSelector(isLoggingIn);

    // eslint-disable-next-line
    const initialLocation = useMemo(() => location, []);

    const [rfqsNrs, token] = React.useMemo(() => {
        const query = queryString.parse(location.search);
        return [query.rfqsNrs && decodeURIComponent(query.rfqsNrs as string).split(','), query.token as string];
    }, [location]);

    React.useEffect(() => {
        getExternalSupplierCollaboratorsAsync(token).then((users) => dispatch(usersUpdated(users)));
    }, [dispatch, token]);

    React.useEffect(() => {
        if (!token) {
            setLoading(false);
        } else {
            getExternalRFQsSupplierDataAsync(rfqsNrs || undefined, token)
                .then((details) => {
                    var adaptedDetails: RFQSupplierDetails = {
                        ...details,
                        dataTable: details.dataTable.map(adaptReceivedQuote),
                    };

                    setDetails(adaptedDetails);
                    setDataRows(adaptedDetails?.dataTable || []);
                    setSearchResult(adaptedDetails?.dataTable || []);
                    let users = [...new Set([...adaptedDetails?.dataTable.map((item) => item.createdBy)])];
                    setMembers(users.map((user) => ({ key: user, checked: false })));
                    var allRfqsNrs = details.dataTable.map((row) => row.rfqNr).filter(onlyUnique);

                    getExternalSupplierRFQsResposiblesAsync(allRfqsNrs, token).then(setResponsibles);
                })
                .finally(() => setLoading(false));
        }
    }, [rfqsNrs, token, setLoading, setDetails, setResponsibles, setSearchResult]);

    const handleChange = React.useCallback(
        (quote: RFQQuote) => {
            const dataToRevert = dataRows;

            if (!quote.currency) {
                quote.currency = 'EUR';
            }

            const prevState = dataRows.find((r) => r.id === quote.id)?.state;

            setDataRows((prev) => [quote, ...prev.filter((r) => r.id !== quote.id)]);
            setSearchResult((prev) => [quote, ...prev.filter((r) => r.id !== quote.id)]);

            if (prevState !== RFQQuoteState.Declined) {
                setOpened(undefined);
            }

            setLoading(true);

            putExternalSupplierRFQsDataAsync(
                { quotes: [quote], receiveEmailCopyWhenSubmitting: true /* receiveEmail*/ },
                token,
            )
                .catch(() => {
                    setDataRows(dataToRevert); // Revert
                    setSearchResult(dataToRevert); //
                    dispatch(alertGenericError());
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [dispatch, dataRows, token, receiveEmail, setSearchResult],
    );

    const handleAddQuote = React.useCallback(
        (quote: RFQQuote) => {
            setLoading(true);

            putExternalSupplierRFQsDataAsync({ quotes: [quote] }, token)
                .then(() => {
                    setOpened(undefined);
                    setDataRows((prev) => [quote, ...prev]);
                    setSearchResult((prev) => [quote, ...prev]);
                    setAddAlternative(undefined);
                })
                .catch(() => {
                    dispatch(alertGenericError());
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [setDataRows, dispatch, token],
    );

    const handleQuoteBoxClick = React.useCallback(
        (quote: RFQQuote) => {
            setOpened(quote.id);
        },
        [setOpened],
    );

    const onDragEnd = React.useCallback(
        (result: DropResult) => {
            if (!result.destination) return;

            const dragFromState = result.source && RFQQuoteState[result.source.droppableId as RFQQuoteState];
            const dropToState = result.destination && RFQQuoteState[result.destination.droppableId as RFQQuoteState];

            if (!dragFromState || dragFromState === RFQQuoteState.Closed || dragFromState === RFQQuoteState.Quoted)
                return;
            if (!dropToState || dropToState === RFQQuoteState.Closed || dropToState === RFQQuoteState.Open) return;

            if (dropToState === RFQQuoteState.Quoted) {
                handleChange({ ...dataRows[result.source.index], state: RFQQuoteState.InProgress });
                setOpened(result.draggableId);
                return;
            }

            if (dropToState === dragFromState) {
                setDataRows((prev) => reorder(prev, result.source.index, result.destination?.index || 0));
                setSearchResult((prev) => reorder(prev, result.source.index, result.destination?.index || 0));
            } else {
                handleChange({ ...dataRows[result.source.index], state: dropToState });
            }
        },
        [setDataRows, handleChange, dataRows],
    );

    const handleAddAlternative = React.useCallback(
        (forId: string) => () => {
            const forProduct = dataRows.find((row) => row.id === forId) as RFQQuote;
            setAddAlternative({
                id: uuidv4(),
                rfqNr: forProduct.rfqNr,
                endingDate: forProduct.endingDate,
                name: '',
                state: RFQQuoteState.Alternative,
                currency: 'EUR',
            });
        },
        [dataRows],
    );

    const handleRequestAccessLink = React.useCallback(
        async (values: MapOf<string>) => {
            setRequestAccessLink(false);
            await dispatch(doRequestAccessLink(values.email));
        },
        [setRequestAccessLink, dispatch],
    );

    const handleSeeAllOrHide = React.useCallback(() => {
        if (!showClosedColumn) {
            setShowClosedColumn(true);
            dispatch(
                push({
                    ...location,
                    search: queryString.stringify({ token }),
                }),
            );
        } else {
            setShowClosedColumn(false);
            dispatch(push(initialLocation));
        }
    }, [dispatch, setShowClosedColumn, showClosedColumn, initialLocation, location, token]);

    const handleShowKanban = () => {
        setShowTableView(false);
        setShowKanbanView(true);
    };

    const handleShowTable = () => {
        setShowTableView(true);
        setShowKanbanView(false);
    };

    const onInputSearchChange = React.useCallback(
        (val: any) => {
            setSearchText(val);
            if (val.length > 0) {
                let rfqQuotes: React.SetStateAction<RFQQuote[]> = [];
                let searchTerm = val.toLocaleLowerCase();
                if (isNaN(val)) {
                    rfqQuotes = dataRows.filter(
                        (item) =>
                            item.rfqNr.includes(searchTerm) ||
                            item.rfqDescription?.toLowerCase().includes(searchTerm) ||
                            item.activeSubstances?.toLowerCase().includes(searchTerm) ||
                            item.state.toLowerCase().includes(searchTerm) ||
                            item.name.toLowerCase().includes(searchTerm) ||
                            item.packSize?.toLowerCase().includes(searchTerm) ||
                            item.unitQuant?.trim().includes(searchTerm.trim()) ||
                            users
                                .find((user) => user.username == responsibles[item.rfqNr])
                                ?.firstName?.toLowerCase()
                                .includes(searchTerm) ||
                            users
                                .find((user) => user.username == responsibles[item.rfqNr])
                                ?.lastName?.toLowerCase()
                                .includes(searchTerm),
                    );
                } else {
                    rfqQuotes = dataRows.filter((item) => item.unitQuant?.trim().includes(searchTerm.trim()));
                }

                setSearchResult(rfqQuotes);
            } else {
                setSearchResult(dataRows);
            }
        },
        [setSearchText, setDataRows, dataRows, responsibles],
    );

    const onHandleChangeOverDue = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const dueFiltersCopy = [...dueDateFilters];
            const index = dueFiltersCopy.findIndex((item) => item.value == parseInt(event.target.value));
            dueFiltersCopy[index].checked = event.target.checked;
            const activeFilters = dueFiltersCopy.filter((item) => item.checked).map((item) => item.value);
            setDueDateFilters(dueFiltersCopy);

            if (activeFilters.length > 0) {
                let rfqQuotes = dataRows.filter((item) => {
                    if (item?.endingDate) {
                        const endDate = moment(item?.endingDate);

                        const today = moment(new Date());

                        const durationInMinutes = endDate.diff(today, 'minutes');
                        const duration = endDate.diff(today, 'hours');

                        const result = activeFilters.find((fvalue) => {
                            return duration < fvalue && fvalue == 0;
                        });

                        const overDueValue = activeFilters.find((fvalue) => durationInMinutes <= fvalue && fvalue == 0);

                        if (typeof overDueValue != 'undefined' && overDueValue >= 0) {
                            return true;
                        }

                        const in30MinsValue = activeFilters.find(
                            (fvalue) => durationInMinutes <= fvalue && fvalue == 30,
                        );
                        if (typeof in30MinsValue != 'undefined' && in30MinsValue >= 0) {
                            return true;
                        }

                        const in2hourValue = activeFilters.find(
                            (fvalue) => durationInMinutes <= fvalue * 60 && fvalue == 2,
                        );
                        if (typeof in2hourValue != 'undefined' && in2hourValue >= 0) {
                            return true;
                        }

                        const in6hourValue = activeFilters.find(
                            (fvalue) => durationInMinutes <= fvalue * 60 && fvalue == 6,
                        );
                        if (typeof in6hourValue != 'undefined' && in6hourValue >= 0) {
                            return true;
                        }

                        const in1DayValue = activeFilters.find(
                            (fvalue) => durationInMinutes <= fvalue * 60 && fvalue == 24,
                        );
                        if (typeof in1DayValue != 'undefined' && in1DayValue >= 0) {
                            return true;
                        }

                        const in3dayValue = activeFilters.find(
                            (fvalue) => durationInMinutes <= fvalue * 60 && fvalue == 72,
                        );

                        if (typeof in3dayValue != 'undefined' && in3dayValue >= 0) {
                            return true;
                        }

                        const in5DayValue = activeFilters.find(
                            (fvalue) => durationInMinutes <= fvalue * 60 && fvalue == 120,
                        );
                        if (typeof in5DayValue != 'undefined' && in5DayValue >= 0) {
                            return true;
                        }

                        // if (
                        //     activeFilters.find((fvalue) => duration >= fvalue && fvalue > 0) ||
                        //     activeFilters.find((fvalue) => {
                        //         return duration < fvalue && fvalue == 0;
                        //     }) == 0 ||
                        //     activeFilters.find((fvalue) => {
                        //         return durationInMinutes <= 30;
                        //     })
                        // ) {
                        //     return true;
                        // }
                    }
                    return false;
                });
                setSearchResult(rfqQuotes);
            } else {
                setSearchResult(dataRows);
            }

            setIsShowOverDue(event.target.checked);
        },
        [setIsShowOverDue, setDueDateFilters, setDataRows, dataRows, responsibles],
    );

    const onHandleMemberFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const copiedMembers = [...members];
        const index = copiedMembers.findIndex((member) => member.key === event.target.value);
        copiedMembers[index].checked = event.target.checked;
        const searchMembers = copiedMembers.filter((member) => member.checked).map((member) => member.key);
        let rfqQuotes = dataRows.filter((row) => {
            if (searchMembers.find((m) => m === responsibles[row.rfqNr])) {
                return true;
            }
            return false;
        });

        if (searchMembers.length > 0) {
            setSearchResult(rfqQuotes);
        } else {
            setSearchResult(dataRows);
        }
        setMembers(copiedMembers);
    };

    // const getUserAcknowledgement = React.useCallback(
    //     (isOfferAlertnative) => {
    //         if (isOfferAlertnative) {
    //             const forProduct = dataRows.find((row) => row.id === opened) as RFQQuote;
    //             setAddAlternative({
    //                 id: uuidv4(),
    //                 rfqNr: forProduct.rfqNr,
    //                 endingDate: forProduct.endingDate,
    //                 name: '',
    //                 state: RFQQuoteState.InProgress,
    //             });
    //         }
    //         setIsConfirm(isOfferAlertnative);
    //         setShowAlert(false);
    //     },
    //     [handleAddAlternative, opened, setShowAlert],
    // );

    return (
        <Page
            title={
                <WhiteTypography variant="h4">
                    <RBPharmaIcon height="3rem" width="3rem" color="white" style={{ margin: '0 1rem' }} />|{' '}
                    {t(TK.requestsForQuote)}
                </WhiteTypography>
            }
            actionPanel={
                !loading &&
                details && (
                    <WhiteTypography variant="h5" align="right">
                        <b>{details.supplierName}</b> <ReactCountryFlag svg countryCode={details.countryCode} />
                        <Typography variant="subtitle2">
                            {details.supplierContactName} <i>({details.supplierContactEmail})</i>
                        </Typography>
                    </WhiteTypography>
                )
            }
        >
            <Loading isLoading={loading} />

            {loading && !details && <WhiteTypography>{t(TK.loading)}...</WhiteTypography>}
            {!loading && !details && (
                <>
                    <WhiteTypography>{t(TK.thisLinkIsNoLongerAvailable)}</WhiteTypography>

                    <Button
                        disabled={loggingIn}
                        variant="outlined"
                        size="large"
                        onClick={() => setRequestAccessLink(true)}
                    >
                        {loggingIn && <Spinner size="sm" />}
                        {t(TK.requestAnAccessLink)}
                    </Button>

                    <FormDialog
                        title={t(TK.requestAnAccessLink)}
                        fields={[{ key: 'email', label: t(TK.email) }]}
                        onClose={() => setRequestAccessLink(false)}
                        open={requestAccessLink}
                        onSubmit={handleRequestAccessLink}
                    />
                </>
            )}

            <PanelButtonsContainerKanban>
                {!loading && details && (
                    <Box display="flex" justifyContent="space-between" width="100%">
                        <Box width="18%" display="flex" justifyContent="space-between">
                            <Button color="primary" onClick={handleSeeAllOrHide} variant="contained">
                                {t(showClosedColumn ? TK.viewOpen : TK.viewAll)}
                            </Button>
                            <Button color="primary" onClick={handleShowKanban} variant="contained">
                                <TableChartTwoToneIcon className={classes.btnIcon_margin} />
                            </Button>
                            <Button color="primary" onClick={handleShowTable} variant="contained">
                                <TocTwoToneIcon className={classes.btnIcon_margin} />
                            </Button>
                        </Box>
                        <Box display="flex" width="445px">
                            <Button
                                color="primary"
                                onClick={() => setShowFilters((value) => !value)}
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
                            {showFilters && (
                                <KanbanFilters
                                    members={members}
                                    dueDateFilters={dueDateFilterList}
                                    onHandleChangeOverDue={onHandleChangeOverDue}
                                    onHandleMemberFilterChange={onHandleMemberFilterChange}
                                    setShowFilters={setShowFilters}
                                />
                            )}
                            <TextInput
                                placeholder={t(TK.searchKanban)}
                                fullWidth={true}
                                type="text"
                                value={searchText}
                                onChange={onInputSearchChange}
                                formStyle={{ width: '70%', marginLeft: '12px' }}
                                endAdorment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            style={{ outline: 'none' }}
                                            aria-label="free text filter info"
                                            edge="start"
                                        >
                                            <SearchIcon color="primary" />
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </Box>
                    </Box>
                )}
            </PanelButtonsContainerKanban>

            {showTableView && searchResult && (
                <QuotesTableView
                    dataRows={searchResult}
                    handleQuoteBoxClick={handleQuoteBoxClick}
                    responsibles={responsibles}
                />
            )}

            {details && searchResult && showKanbanView && (
                <DragDropContext onDragEnd={onDragEnd}>
                    <ColumnsPanel>
                        {[
                            { title: TK.new, states: [RFQQuoteState.Open] },
                            // { title: TK.inProgress, states: [RFQQuoteState.InProgress] },
                            { title: TK.skipped, states: [RFQQuoteState.Declined] },
                            { title: TK.quoted, states: [RFQQuoteState.Quoted, RFQQuoteState.Alternative] },
                            { title: TK.closed, states: [RFQQuoteState.Closed], hide: !showClosedColumn },
                        ]
                            .filter((i) => !i.hide)
                            .map(({ title, states }) => (
                                <Droppable key={states.join(',')} droppableId={RFQQuoteState[states[0]]}>
                                    {(provided, snapshot) => (
                                        <QuotesColumn widthPercentage={showClosedColumn ? 25 : 33}>
                                            <QuoteColumnTitle variant="h6">
                                                <b>{t(title)}</b>
                                            </QuoteColumnTitle>
                                            <QuotesBoxesContainer
                                                ref={provided.innerRef}
                                                $isDraggingOver={snapshot.isDraggingOver}
                                            >
                                                {searchResult.map(
                                                    (row, index) =>
                                                        states.includes(row.state) && (
                                                            <Draggable key={row.id} draggableId={row.id} index={index}>
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                    >
                                                                        <QuoteBox
                                                                            quote={{
                                                                                ...row,
                                                                                username: responsibles[row.rfqNr],
                                                                            }}
                                                                            onClick={() => handleQuoteBoxClick(row)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ),
                                                )}
                                                {provided.placeholder}
                                            </QuotesBoxesContainer>
                                        </QuotesColumn>
                                    )}
                                </Droppable>
                            ))}
                    </ColumnsPanel>
                </DragDropContext>
            )}

            <Dialog open={!!opened} onClose={() => setOpened(undefined)} scroll="body">
                {opened && (
                    <EditQuoteForm
                        loading={loading}
                        quote={dataRows.find((row) => row.id === opened) as RFQQuote}
                        responsible={responsibles[dataRows.find((row) => row.id === opened)?.rfqNr || '']}
                        receiveEmail={receiveEmail}
                        onChangeReceiveEmail={setReceiveEmail}
                        onChange={handleChange}
                        onAddAlternative={handleAddAlternative(opened)}
                    />
                )}
            </Dialog>

            <Dialog open={!!addAlternative} scroll="body">
                {addAlternative && (
                    <NewQuoteForm
                        token={token}
                        loading={loading}
                        defaultValue={addAlternative}
                        receiveEmail={receiveEmail}
                        onChangeReceiveEmail={setReceiveEmail}
                        onAdd={handleAddQuote}
                        onCancel={() => setAddAlternative(undefined)}
                    />
                )}
            </Dialog>
        </Page>
    );
};

export default SupplierReplyForm;
